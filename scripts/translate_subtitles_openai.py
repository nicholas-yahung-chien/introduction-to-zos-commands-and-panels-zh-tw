import argparse
import json
import os
import re
import sys
from pathlib import Path

from openai import OpenAI


ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPT_DIR = ROOT / "data" / "transcripts"
SUBTITLE_DIR = ROOT / "docs" / "public" / "subtitles"
GLOSSARY_REVIEW = ROOT / "docs" / "glossary" / "review.md"


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
        lines.append(segment["zh"].strip())
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def chunked(items, size):
    for index in range(0, len(items), size):
        yield items[index : index + size]


def resolve_openai_api_key() -> str:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key

    if sys.platform == "win32":
        try:
            import winreg

            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as env_key:
                value, _ = winreg.QueryValueEx(env_key, "OPENAI_API_KEY")
                key = str(value).strip()
                if key:
                    os.environ["OPENAI_API_KEY"] = key
                    return key
        except OSError:
            pass

    return ""


def parse_json_array(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        start = text.find("[")
        end = text.rfind("]")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise


def align_translations(cues, result):
    by_id = {
        item["id"]: item["zh"]
        for item in result
        if isinstance(item, dict) and "id" in item and "zh" in item
    }
    if all(index in by_id for index in range(len(cues))):
        return [by_id[index] for index in range(len(cues))]

    ordered = [
        item["zh"]
        for item in result
        if isinstance(item, dict) and "zh" in item
    ]
    if len(ordered) == len(cues):
        return ordered

    missing = [index for index in range(len(cues)) if index not in by_id]
    raise ValueError(f"Translation response did not include all cues; missing ids: {missing[:8]}")


def validate_translations(translations):
    empty = [index for index, text in enumerate(translations) if not str(text).strip()]
    if empty:
        raise ValueError(f"Translation response included empty subtitles for ids: {empty[:8]}")
    return translations


def translate_cues(client, model: str, glossary: str, cues):
    request = {
        "glossary": glossary,
        "rules": [
            "Translate into Traditional Chinese used in Taiwan.",
            "Keep IBM product names, z/OS, IBM Z, Sysplex, HMC, SE, IPL, IOCDS, RACF, and Crypto Express in English unless the glossary says otherwise.",
            "Keep each cue concise enough for subtitles.",
            "Return JSON only: an array of objects with id and zh.",
            "Return exactly one object for every cue id in the input."
        ],
        "cues": [
            {"id": index, "en": cue["text"]}
            for index, cue in enumerate(cues)
        ]
    }

    last_error = None
    for attempt in range(1, 4):
        response = client.responses.create(
            model=model,
            input=[
                {
                    "role": "system",
                    "content": "You are translating IBM Z course subtitles for Taiwan learners. Return valid JSON only."
                },
                {
                    "role": "user",
                    "content": json.dumps(request, ensure_ascii=False)
                }
            ]
        )
        try:
            return validate_translations(align_translations(cues, parse_json_array(response.output_text)))
        except (json.JSONDecodeError, ValueError) as exc:
            last_error = exc
            print(f"retrying chunk after malformed response (attempt {attempt}/3): {exc}", flush=True)

    if len(cues) > 1:
        print(f"falling back to single-cue translation for {len(cues)} cue(s)", flush=True)
        translated = []
        for cue in cues:
            translated.extend(translate_cues(client, model, glossary, [cue]))
        return translated

    raise RuntimeError(f"Could not translate chunk after retries: {last_error}") from last_error


def main():
    parser = argparse.ArgumentParser(description="Translate English transcript JSON files to zh-Hant-TW VTT.")
    parser.add_argument("--model", default="gpt-4.1-mini", help="OpenAI translation model")
    parser.add_argument("--slug", default="", help="Translate one video slug")
    parser.add_argument("--chunk-size", type=int, default=35, help="Subtitle cues per API call")
    parser.add_argument("--force", action="store_true", help="Overwrite existing zh-Hant-TW VTT")
    args = parser.parse_args()

    if not resolve_openai_api_key():
        raise SystemExit("OPENAI_API_KEY is required for subtitle translation.")

    client = OpenAI()
    glossary = GLOSSARY_REVIEW.read_text(encoding="utf-8") if GLOSSARY_REVIEW.exists() else ""
    transcript_files = sorted(TRANSCRIPT_DIR.glob("*.en.json"))
    if args.slug:
      transcript_files = [TRANSCRIPT_DIR / f"{args.slug}.en.json"]

    SUBTITLE_DIR.mkdir(parents=True, exist_ok=True)

    for transcript_file in transcript_files:
        payload = json.loads(transcript_file.read_text(encoding="utf-8"))
        slug = payload["slug"]
        output = SUBTITLE_DIR / f"{slug}.zh-Hant-TW.vtt"
        if output.exists() and not args.force:
            print(f"skip {slug}: zh-Hant-TW subtitle already exists")
            continue

        translated = []
        for cues in chunked(payload["segments"], args.chunk_size):
            translations = translate_cues(client, args.model, glossary, cues)
            for index, cue in enumerate(cues):
                translated.append({**cue, "zh": translations[index]})

        write_vtt(output, translated)
        print(f"wrote {output.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    main()
