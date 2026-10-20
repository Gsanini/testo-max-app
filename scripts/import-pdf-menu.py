"""Extract the 120-day table from Cardapio_120_Dias_Proteina_Animal.pdf.

Usage: python scripts/import-pdf-menu.py input.pdf src/content/pdf-menu.json
The PDF is the source of the meal names and portion descriptions.
"""

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def ingredients(portions: str) -> list[dict]:
    # The document sometimes places dessert or onion after a full stop.
    parts = (
        portions.replace(". Sobremesa: ", "; ")
        .replace(". Cebola ", "; Cebola ")
        .replace(" + ", "; ")
        .replace(". Misture os 3 primeiros e doure.", ".")
        .rstrip(".")
        .split("; ")
    )
    parsed = []
    for part in parts:
        egg = re.fullmatch(r"(\d+) ovos?(?: cozidos)? \((\d+) g\)", part)
        if egg:
            parsed.append({"name": "Ovos", "quantity": int(egg[1]), "unit": "un"})
            continue
        food = re.fullmatch(r"(.+?) (\d+) (g|mL)( no total)?", part)
        if food:
            name = food[1].lower()
            if food[4]:
                name += " (no total)"
            parsed.append({"name": name, "quantity": int(food[2]), "unit": food[3]})
            continue
        raise ValueError(f"Unparsed ingredient: {part!r} in {portions!r}")
    return parsed


def main() -> None:
    reader = PdfReader(sys.argv[1])
    days = []
    for page in reader.pages[2:22]:
        lines = page.extract_text(extraction_mode="layout").splitlines()
        header = next(line for line in lines if "Dia" in line and "Janta" in line)
        breakfast_start = header.index("Café")
        lunch_start = header.index("Almoço")
        dinner_start = header.index("Janta")
        rows = []
        current = None
        for line in lines:
            match = re.match(r"^\s{2}(\d{3})\s+", line)
            if match:
                current = {"day": int(match.group(1)), "cells": [[], [], []]}
                rows.append(current)
            if current is None or not line.strip():
                continue
            if "CARDÁPIO DE 120 DIAS" in line:
                break
            for column, fragment in enumerate(
                (line[breakfast_start:lunch_start], line[lunch_start:dinner_start], line[dinner_start:])
            ):
                fragment = clean(fragment)
                if fragment and not (column == 0 and fragment.isdigit()):
                    current["cells"][column].append(fragment)
        for row in rows:
            meals = {}
            for slot, cell in zip(("breakfast", "lunch", "dinner"), row["cells"]):
                if len(cell) < 2:
                    raise ValueError(f"Day {row['day']} {slot}: incomplete cell: {cell}")
                portions = clean(" ".join(cell[1:]))
                meals[slot] = {"name": cell[0], "portions": portions, "ingredients": ingredients(portions)}
            days.append({"day": row["day"], "meals": meals})
    if [day["day"] for day in days] != list(range(1, 121)):
        raise ValueError(f"Expected days 1-120, got {[day['day'] for day in days]}")
    Path(sys.argv[2]).write_text(json.dumps(days, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(days)} days and {sum(len(day['meals']) for day in days)} meals")


if __name__ == "__main__":
    main()
