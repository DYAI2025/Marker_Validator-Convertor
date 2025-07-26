"""
GR_EMO_CONTRAST_DRIFT.py
Erkennt Valence-Kontrast innerhalb eines Satzes.

• liefert Marker-ID 'S_EMO_CONTRAST_DRIFT'
• nutzt dieselbe Logik wie dein ursprüngliches Snippet
"""

import re
from typing import List, Dict, Any

id          = "GR_EMO_CONTRAST_DRIFT"
description = "Detects a pivot from certainty/positive to uncertainty/negative within one sentence."

# --- Kompilierte Regexe ---------------------------------------
certainty  = r"(ich weiß|i know|ich bin (mir )?sicher|i am sure|normalerweise|eigentlich|usually|grundsätzlich)"
uncertainty= r"(weiß (ich )?nicht|i don't know|unsicher|not sure|keine Ahnung|habe Angst|feel scared)"
contrast   = r"\b(aber|jedoch|andererseits|but|however)\b"
pattern_full = re.compile(f"({certainty}).*({contrast}).*({uncertainty})", re.IGNORECASE)

pos_adj = r"\b(stark|glücklich|gut|unabhängig|strong|happy|good|independent)\b"
neg_adj = r"\b(schwach|verletzt|klein|ängstlich|weak|hurt|small|afraid)\b"
pattern_adj = re.compile(f"({pos_adj}).*({contrast}).*({neg_adj})", re.IGNORECASE)
# --------------------------------------------------------------

def run(text: str, utils=None, meta: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """
    Pflicht-Signatur für Grabber-Plugins.
    Gibt dict mit 'fire' (Liste Marker-IDs) und 'score' zurück.
    """
    matches: List[Dict[str, str]] = []

    m1 = pattern_full.search(text)
    if m1:
        matches.append({
            "marker": "S_EMO_CONTRAST_DRIFT",
            "rule": "certainty_uncertainty_pivot",
            "snippet": m1.group(0)
        })

    m2 = pattern_adj.search(text)
    if m2:
        matches.append({
            "marker": "S_EMO_CONTRAST_DRIFT",
            "rule": "adjective_contrast",
            "snippet": m2.group(0)
        })

    return {
        "fire": ["S_EMO_CONTRAST_DRIFT"] if matches else [],
        "score": len(matches),          # Anzahl Treffer als einfacher Score
        "details": matches
    }
