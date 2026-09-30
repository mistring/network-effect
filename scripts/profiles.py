#!/usr/bin/env python3
"""Validate profile files and rebuild data/people.json.

Usage:
  python scripts/profiles.py validate
  python scripts/profiles.py build
  ISSUE_BODY=... ISSUE_AUTHOR=... python scripts/profiles.py accept-issue
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PEOPLE_DIR = ROOT / "data" / "people"
VOCAB_PATH = ROOT / "data" / "vocab.json"
AGGREGATE_PATH = ROOT / "data" / "people.json"
EDGES_PATH = ROOT / "data" / "edges.json"

REQUIRED = ("github", "name", "interests", "learning", "askMeAbout", "industries")
OPTIONAL = ("languages",)
GITHUB_RE = re.compile(r"^[A-Za-z0-9-]{1,39}$")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b")

LIMITS = {
    "interests": (1, 3, "interests"),
    "languages": (0, 5, "languages"),
    "learning": (1, 2, "topics"),
    "askMeAbout": (1, 3, "topics"),
    "industries": (1, 3, "industries"),
}


def load_json(path: Path):
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except json.JSONDecodeError as exc:
        raise ValueError(f"{path.relative_to(ROOT)} is not valid JSON ({exc})") from exc


def profile_paths() -> list[Path]:
    return sorted(
        path
        for path in PEOPLE_DIR.glob("*.json")
        if path.name != "template.json"
    )


def check_text(label: str, value: str, errors: list[str]) -> None:
    if EMAIL_RE.search(value) or PHONE_RE.search(value):
        errors.append(f"{label} looks like an email or phone number; leave those out")


def validate_profile(path: Path, vocab: dict) -> list[str]:
    errors: list[str] = []
    try:
        data = load_json(path)
    except ValueError as exc:
        return [str(exc)]

    if not isinstance(data, dict):
        return [f"{path.name} must be a JSON object"]

    allowed = set(REQUIRED) | set(OPTIONAL)
    extra = sorted(set(data) - allowed)
    missing = [key for key in REQUIRED if key not in data]
    if extra:
        errors.append(f"{path.name} has unexpected fields: {', '.join(extra)}")
    if missing:
        errors.append(f"{path.name} is missing: {', '.join(missing)}")
        return errors

    github = data["github"]
    if not isinstance(github, str) or not GITHUB_RE.match(github):
        errors.append(f"{path.name} github must be 1–39 letters, numbers, or hyphens")
    elif path.stem.lower() != github.lower():
        errors.append(
            f"{path.name} filename must match github username '{github}' "
            f"(expected {github.lower()}.json)"
        )

    name = data["name"]
    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 80:
        errors.append(f"{path.name} name must be 1–80 characters")
    elif isinstance(name, str):
        check_text(f"{path.name} name", name, errors)

    for field, (low, high, vocab_key) in LIMITS.items():
        if field not in data:
            continue
        values = data[field]
        if not isinstance(values, list) or any(not isinstance(item, str) for item in values):
            errors.append(f"{path.name} {field} must be a list of strings")
            continue
        if not low <= len(values) <= high:
            errors.append(f"{path.name} {field} must have {low}–{high} items")
        allowed_values = set(vocab[vocab_key])
        unknown = [item for item in values if item not in allowed_values]
        if unknown:
            errors.append(
                f"{path.name} {field} has values not in the list: {', '.join(unknown)}"
            )
        if len(set(values)) != len(values):
            errors.append(f"{path.name} {field} has duplicates")
        for item in values:
            check_text(f"{path.name} {field}", item, errors)

    return errors


def validate_edges(people: list[dict]) -> list[str]:
    if not EDGES_PATH.exists():
        return []
    try:
        edges = load_json(EDGES_PATH)
    except ValueError as exc:
        return [str(exc)]
    if not isinstance(edges, list):
        return ["data/edges.json must be a list"]
    known = {person["github"].lower() for person in people}
    errors = []
    for index, edge in enumerate(edges, start=1):
        if not isinstance(edge, dict):
            errors.append(f"edge {index} must be an object")
            continue
        for key in ("from", "to", "context"):
            if not isinstance(edge.get(key), str) or not edge[key].strip():
                errors.append(f"edge {index} needs a non-empty {key}")
        source = str(edge.get("from", "")).lower()
        target = str(edge.get("to", "")).lower()
        if source and source not in known:
            errors.append(f"edge {index} from '{edge.get('from')}' has no profile")
        if target and target not in known:
            errors.append(f"edge {index} to '{edge.get('to')}' has no profile")
        if source and source == target:
            errors.append(f"edge {index} cannot connect someone to themselves")
    return errors


def collect(vocab: dict) -> tuple[list[dict], list[str]]:
    people = []
    errors = []
    seen = {}
    for path in profile_paths():
        errors.extend(validate_profile(path, vocab))
        try:
            data = load_json(path)
        except ValueError:
            continue
        if isinstance(data, dict) and isinstance(data.get("github"), str):
            key = data["github"].lower()
            if key in seen:
                errors.append(
                    f"duplicate github '{data['github']}' in {path.name} and {seen[key]}"
                )
            else:
                seen[key] = path.name
            people.append(data)
    errors.extend(validate_edges(people))
    people.sort(key=lambda person: person.get("name", "").lower())
    return people, errors


def validate() -> int:
    vocab = load_json(VOCAB_PATH)
    _, errors = collect(vocab)
    if errors:
        print("Profile check failed:")
        for error in errors:
            print(f"  - {error}")
        return 1
    print(f"Validated {len(profile_paths())} profile(s).")
    return 0


def build() -> int:
    vocab = load_json(VOCAB_PATH)
    people, errors = collect(vocab)
    if errors:
        print("Refusing to build people.json:")
        for error in errors:
            print(f"  - {error}")
        return 1
    text = json.dumps(people, indent=2, ensure_ascii=False) + "\n"
    AGGREGATE_PATH.write_text(text, encoding="utf-8")
    print(f"Wrote {AGGREGATE_PATH.relative_to(ROOT)} ({len(people)} people).")
    return 0


PROFILE_FENCE = re.compile(r"```profile\s*(.*?)```", re.DOTALL)


def set_output(key: str, value: str) -> None:
    print(f"{key}={value}")
    path = os.environ.get("GITHUB_OUTPUT")
    if not path:
        return
    with open(path, "a", encoding="utf-8") as handle:
        handle.write(f"{key}={value}\n")


def accept_issue() -> int:
    """Save a profile issue directly. Skip issues that are not profiles."""
    body = os.environ.get("ISSUE_BODY", "")
    author = os.environ.get("ISSUE_AUTHOR", "").strip().lower()
    match = PROFILE_FENCE.search(body)
    if not match:
        set_output("added", "false")
        set_output("status", "skip")
        return 0

    if not GITHUB_RE.match(author):
        set_output("added", "false")
        set_output("status", "invalid")
        set_output("detail", "The GitHub account name could not be used as a profile filename.")
        return 0

    try:
        data = json.loads(match.group(1))
    except json.JSONDecodeError:
        set_output("added", "false")
        set_output("status", "invalid")
        set_output("detail", "The profile JSON could not be read.")
        return 0
    if not isinstance(data, dict):
        set_output("added", "false")
        set_output("status", "invalid")
        set_output("detail", "The profile JSON could not be read.")
        return 0

    data["github"] = author
    path = PEOPLE_DIR / f"{author}.json"
    if path.exists():
        set_output("added", "false")
        set_output("status", "exists")
        set_output("detail", "This GitHub account is already on the network.")
        return 0

    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    errors = validate_profile(path, load_json(VOCAB_PATH))
    if errors:
        path.unlink()
        set_output("added", "false")
        set_output("status", "invalid")
        set_output("detail", " ".join(errors))
        return 0

    if build() != 0:
        path.unlink()
        set_output("added", "false")
        set_output("status", "invalid")
        set_output("detail", "The profile did not pass the check.")
        return 0

    set_output("added", "true")
    set_output("status", "added")
    set_output("detail", f"Added @{author}.")
    return 0


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in {"validate", "build", "accept-issue"}:
        print("Usage: python scripts/profiles.py validate|build|accept-issue", file=sys.stderr)
        return 2
    if sys.argv[1] == "validate":
        return validate()
    if sys.argv[1] == "build":
        return build()
    return accept_issue()


if __name__ == "__main__":
    sys.exit(main())
