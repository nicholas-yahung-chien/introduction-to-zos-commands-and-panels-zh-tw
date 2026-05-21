import argparse
import json
from pathlib import Path

from faster_whisper import WhisperModel


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "course-manifest.json"
MEDIA_DIR = ROOT / "docs" / "public" / "media"
SUBTITLE_DIR = ROOT / "docs" / "public" / "subtitles"
TRANSCRIPT_DIR = ROOT / "data" / "transcripts"


def format_timestamp(seconds: float) -> str:
    milliseconds = round(seconds * 1000)
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02}.{millis:03}"


def write_vtt(path: Path, segments) -> None:
    lines = ["WEBVTT", ""]
    for index, segment in enumerate(segments, start=1):
        lines.append(str(index))
        lines.append(f"{format_timestamp(segment['start'])} --> {format_timestamp(segment['end'])}")
        lines.append(segment["text"].strip())
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def included_videos():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for section in manifest["sections"]:
        for activity in section["activities"]:
            if activity.get("type") == "video" and activity.get("includeInFirstEdition") is not False:
                yield section, activity


def main():
    parser = argparse.ArgumentParser(description="Transcribe downloaded course MP4 files to English VTT.")
    parser.add_argument("--model", default="small.en", help="faster-whisper model name or local path")
    parser.add_argument("--device", default="auto", help="auto, cpu, or cuda")
    parser.add_argument("--compute-type", default="default", help="default, int8, float16, etc.")
    parser.add_argument("--limit", type=int, default=0, help="Transcribe only the first N videos")
    parser.add_argument("--force", action="store_true", help="Overwrite existing transcript files")
    args = parser.parse_args()

    SUBTITLE_DIR.mkdir(parents=True, exist_ok=True)
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)

    videos = list(included_videos())
    if args.limit:
        videos = videos[: args.limit]

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)

    for _, video in videos:
        slug = video["slug"]
        media_path = MEDIA_DIR / f"{slug}.mp4"
        json_path = TRANSCRIPT_DIR / f"{slug}.en.json"
        vtt_path = SUBTITLE_DIR / f"{slug}.en.vtt"
        if not media_path.exists():
            print(f"skip {slug}: missing {media_path}")
            continue
        if json_path.exists() and vtt_path.exists() and not args.force:
            print(f"skip {slug}: transcript already exists")
            continue

        print(f"transcribing {slug}...")
        segments_iter, info = model.transcribe(
            str(media_path),
            language="en",
            vad_filter=True,
            beam_size=5,
            word_timestamps=False,
        )
        segments = [
            {"start": segment.start, "end": segment.end, "text": segment.text.strip()}
            for segment in segments_iter
        ]
        payload = {
            "slug": slug,
            "title": video["title"],
            "language": info.language,
            "duration": info.duration,
            "segments": segments,
        }
        json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        write_vtt(vtt_path, segments)
        print(f"wrote {vtt_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
