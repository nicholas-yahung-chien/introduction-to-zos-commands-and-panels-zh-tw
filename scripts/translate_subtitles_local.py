import argparse
import json
import re
from pathlib import Path

import torch
from opencc import OpenCC
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPT_DIR = ROOT / "data" / "transcripts"
SUBTITLE_DIR = ROOT / "docs" / "public" / "subtitles"

PROTECTED_TERMS = [
    "IBM Z",
    "z/OS",
    "Sysplex",
    "HMC",
    "SE",
    "IPL",
    "IOCDS",
    "RACF",
    "Crypto Express",
    "Millicode",
    "MVS",
    "LPAR",
    "PR/SM",
]


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


def protect_terms(text: str) -> tuple[str, dict[str, str]]:
    placeholders = {}
    protected = text
    for term in PROTECTED_TERMS:
        pattern = re.compile(re.escape(term), re.IGNORECASE)

        def replace(match):
            placeholder = f"ZXTERM{len(placeholders)}ZX"
            placeholders[placeholder] = match.group(0)
            return placeholder

        protected = pattern.sub(replace, protected)
    return protected, placeholders


def restore_terms(text: str, placeholders: dict[str, str]) -> str:
    restored = text
    for placeholder, term in placeholders.items():
        variants = {
            placeholder,
            placeholder.lower(),
            placeholder.upper(),
            placeholder.replace("ZX", " Z X "),
        }
        for variant in variants:
            restored = restored.replace(variant, term)
    return restored


def translate_batch(tokenizer, model, batch: list[str], max_new_tokens: int) -> list[str]:
    inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            num_beams=4,
            early_stopping=True,
        )
    return tokenizer.batch_decode(outputs, skip_special_tokens=True)


def main():
    parser = argparse.ArgumentParser(description="Translate English transcripts to zh-Hant-TW VTT with a local model.")
    parser.add_argument("--model", default="Helsinki-NLP/opus-mt-en-zh", help="Hugging Face seq2seq translation model")
    parser.add_argument("--slug", default="", help="Translate one video slug")
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--max-new-tokens", type=int, default=160)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    transcript_files = sorted(TRANSCRIPT_DIR.glob("*.en.json"))
    if args.slug:
        transcript_files = [TRANSCRIPT_DIR / f"{args.slug}.en.json"]

    SUBTITLE_DIR.mkdir(parents=True, exist_ok=True)
    converter = OpenCC("s2twp")

    print(f"loading {args.model}...")
    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForSeq2SeqLM.from_pretrained(args.model)
    model.eval()

    for transcript_file in transcript_files:
        payload = json.loads(transcript_file.read_text(encoding="utf-8"))
        slug = payload["slug"]
        output = SUBTITLE_DIR / f"{slug}.zh-Hant-TW.vtt"
        if output.exists() and not args.force:
            print(f"skip {slug}: zh-Hant-TW subtitle already exists")
            continue

        print(f"translating {slug}...")
        segments = payload["segments"]
        protected_texts = []
        placeholder_sets = []
        for segment in segments:
            protected, placeholders = protect_terms(segment["text"])
            protected_texts.append(protected)
            placeholder_sets.append(placeholders)

        translated_segments = []
        for start in range(0, len(protected_texts), args.batch_size):
            batch = protected_texts[start : start + args.batch_size]
            results = translate_batch(tokenizer, model, batch, args.max_new_tokens)
            for offset, result in enumerate(results):
                zh = converter.convert(result)
                zh = restore_terms(zh, placeholder_sets[start + offset])
                translated_segments.append({**segments[start + offset], "zh": zh})

        write_vtt(output, translated_segments)
        print(f"wrote {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
