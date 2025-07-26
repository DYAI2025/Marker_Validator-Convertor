 ATOMIC – templates/A_TEMPLATE.yaml
yaml

# Level 1 – Atomic Marker
id: A_EXAMPLE_ATOMIC
marker: EXAMPLE_ATOMIC
description: "Detects simple farewell emojis."
level: 1
version: "1.0.0"
status: draft
author: "template"
created: "2024-01-01T00:00:00Z"
last_modified: "2024-01-01T00:00:00Z"
tags: [atomic, pattern, basic]
category: "ATOMIC"
risk_score: 1
pattern:
  - "👋"
  - "🫡"
examples:
  - "Bis später! 👋"
  - "Melde mich morgen 🫡"
2️⃣ SEMANTIC – templates/S_TEMPLATE.yaml

# Level 2 – Semantic Marker
id: S_EXAMPLE_SEMANTIC
marker: EXAMPLE_SEMANTIC
description: "Detects polite, indirect refusals."
level: 2
version: "1.0.0"
status: draft
author: "template"
created: "2024-01-01T00:00:00Z"
last_modified: "2024-01-01T00:00:00Z"
tags: [semantic, context, meaning]
category: "SEMANTIC"
risk_score: 2
pattern:
  - "(melde.*später|keine zeit|gerade stressig)"
examples:
  - "Kann ich dir morgen Bescheid geben?"
semantic_rules:
  - "Detects expressions of uncertainty"
  - "Identifies contextual doubt patterns"
window: { messages: 5 }
3️⃣ CLUSTER – templates/C_TEMPLATE.yaml

# Level 3 – Cluster Marker
id: C_EXAMPLE_CLUSTER
marker: EXAMPLE_CLUSTER
description: "Combination of doubt and time-pressure markers."
level: 3
version: "1.0.0"
status: draft
author: "template"
created: "2024-01-01T00:00:00Z"
last_modified: "2024-01-01T00:00:00Z"
tags: [cluster, combination, complex]
category: "CLUSTER"
risk_score: 3
cluster_components:
  - A_WENIG_ZEIT
  - S_EXAMPLE_SEMANTIC
trigger_threshold: 2       # min components
activation_logic: "ANY"
examples:
  - "Sorry, gerade keine Zeit – melde mich später."
window: { messages: 20 }
4️⃣ META – templates/MM_TEMPLATE.yaml

# Level 4 – Meta Marker
id: MM_EXAMPLE_META
marker: EXAMPLE_META
description: "Tracks strategic distancing over time."
level: 4
version: "1.0.0"
status: draft
author: "template"
created: "2024-01-01T00:00:00Z"
last_modified: "2024-01-01T00:00:00Z"
tags: [meta, strategic, high-level]
category: "META"
risk_score: 4
required_clusters:
  - C_EXAMPLE_CLUSTER
  - C_MANIPULATION
meta_analysis:
  temporal_pattern: "Patterns evolve over time"
  frequency_threshold: 5
  context_sensitivity: "high"
activation_logic: "ALL"
window: { messages: 50 }
examples:
  - "Systematisches Hinhalten kombiniert mit Distanzierung."
Schema-Erweiterung (v2.1 draft)
Erlaubt zusätzliche optionale Felder ohne Pflichtänderung.

jsonc

{
  "$id": "https://example.org/schemas/marker/master/2.1",
  "allOf": [
    { "$ref": "marker.schema.v2.json" },
    {
      "properties": {
        "risk_score":        { "type":"number" },
        "category":          { "type":"string" },
        "cluster_components":{ "type":"array","items":{"type":"string"} },
        "trigger_threshold": { "type":"number" },
        "semantic_rules":    { "type":"array","items":{"type":"string"} },
        "required_clusters": { "type":"array","items":{"type":"string"} },
        "meta_analysis":     { "type":"object" },
        "marker":            { "type":"string" }
      },
      "additionalProperties": true
    }
  ]
}

detect/detector_registry.json
(ersetzt das alte DETECT_default_marker_schema.json)

json

[
  {
    "id": "DETECT_ABSAGE_REGEX",
    "description": "Höfliche Absage – Regex-Detektor",
    "module": "regex",
    "file_path": "detect/DETECT_ABSAGE_REGEX.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  },
  {
    "id": "DETECT_EMO_VOLATILE",
    "description": "Emotionale Volatilität (Std-Abweichung)",
    "module": "stddev",
    "file_path": "detect/DETECT_EMO_VOLATILE.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  },
  {
    "id": "DETECT_EMO_CONTRAST_DRIFT",
    "description": "Valence-Kontrast-Drift > 0.3",
    "module": "trend_delta",
    "file_path": "detect/DETECT_EMO_CONTRAST_DRIFT.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  }
]
2) scripts/detect_creator.py
python
Kopieren
Bearbeiten
#!/usr/bin/env python3
"""
detect_creator.py
Erzeugt neue DETECT_*.json-Spezifikationen und trägt sie
automatisch im detector_registry.json ein.

Aufruf:
    python scripts/detect_creator.py \
        --id DETECT_MY_RULE \
        --type regex \
        --pattern "(example)" \
        --fire S_EXAMPLE_SEMANTIC
"""

import json, argparse, datetime
from pathlib import Path

REGISTRY = Path("detect/detector_registry.json")
DETECT_DIR = Path("detect")

def load_registry():
    return json.loads(REGISTRY.read_text("utf-8")) if REGISTRY.exists() else []

def save_registry(data):
    REGISTRY.write_text(json.dumps(data, indent=2), encoding="utf-8")

def create_detect_spec(args):
    spec = {
        "id": args.id,
        "description": args.description,
        "rule": {
            "type": args.type,
            **({"pattern": args.pattern, "flags": "i"} if args.type == "regex" else {}),
            **({"window": args.window, "threshold": args.threshold} if args.type != "regex" else {})
        },
        "fire_marker": args.fire
    }
    path = DETECT_DIR / f"{args.id}.json"
    path.write_text(json.dumps(spec, indent=2), encoding="utf-8")
    return str(path)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--id", required=True)
    p.add_argument("--type", choices=["regex","stddev","frequency","trend_delta","embedding_distance","cross_speaker_pattern"], required=True)
    p.add_argument("--pattern", help="Regex-Pattern, wenn Typ regex")
    p.add_argument("--window", type=int, default=10)
    p.add_argument("--threshold", type=float, default=0.3)
    p.add_argument("--fire", required=True, help="Marker-ID, die ausgelöst wird")
    p.add_argument("--description", default="")
    a = p.parse_args()

    file_path = create_detect_spec(a)

    registry = load_registry()
    registry.append({
        "id": a.id,
        "description": a.description,
        "module": a.type,
        "file_path": file_path,
        "class": None,
        "last_updated": datetime.datetime.utcnow().isoformat(),
        "auto_generated": False
    })
    save_registry(registry)
    print("✅  Detect-Spec und Registry-Eintrag erzeugt.")

if __name__ == "__main__":
    main()
3) backend/math/cost_vector_math.py
python
Kopieren
Bearbeiten
"""
cost_vector_math.py
Grundlegende Vektor-Hilfsfunktionen (Cosinus, Euklid, Normalisierung)
"""

import math
from typing import List

Vector = List[float]

def dot(a: Vector, b: Vector) -> float:
    return sum(x*y for x, y in zip(a, b))

def l2(a: Vector) -> float:
    return math.sqrt(sum(x*x for x in a))

def cosine(a: Vector, b: Vector) -> float:
    denom = l2(a) * l2(b)
    return dot(a, b) / denom if denom else 0.0

def normalize(a: Vector) -> Vector:
    length = l2(a)
    return [x/length for x in a] if length else a
4) backend/drift_metrics.py
python
Kopieren
Bearbeiten
"""
drift_metrics.py
Erweiterte Drift-Berechnungen auf Basis der Cost-Vector-Utilities.
"""

from backend.math.cost_vector_math import cosine, normalize
from typing import List

class CosineDrift:
    """
    Drift = 1 - Cosinus(aktueller Vektor, Basis-Vektor)
    """
    def __init__(self, base_vector: List[float]):
        self.base = normalize(base_vector)

    def drift(self, vector: List[float]) -> float:
        return 1.0 - cosine(normalize(vector), self.base)
5) backend/marker_engine_core.py
(Auszug – nur der korrigierte YAML-Pfad)

python
Kopieren
Bearbeiten
from pathlib import Path
import yaml, json

class MarkerEngine:
    def __init__(self, marker_root="markers"):
        self.marker_path = Path(marker_root)
        # ↺ vorher stand "meta_marker"
        self.meta_path   = self.marker_path / "meta"
        self.atomic_path = self.marker_path / "atomic"
        # …
6) profiler/drift/drift_mapping_basis.yaml
yaml
Kopieren
Bearbeiten
baseline_axes:
  - speaker_valence
  - avg_token_length
  - emoji_rate
7) profiler/drift/drift_marker_axes.yaml
yaml
Kopieren
Bearbeiten
marker_axes:
  - S_EXAMPLE_SEMANTIC
  - C_EXAMPLE_CLUSTER
  - MM_EXAMPLE_META
8) templates/CHA_TEMPLATE.yaml
yaml
Kopieren
Bearbeiten
id: CHA_TEMPLATE
description: "Vorlage für Chunk-Analyse-Schema"
detectors_active:
  - DETECT_ABSAGE_REGEX
  - DETECT_EMO_VOLATILE
high_level_snapshot:
  include_levels: [C_, MM_]
  top_k: 5
drift_axes:
  - speaker_valence
  - avg_token_length
outputs:
  show_markers: true
  show_drift:   true
Diese Dateien sind vollständig, konform zu den besprochenen Regeln und an der richtigen Stelle einsatzbereit.






Du:
detect/detector_registry.json soll die datei mit allen drei zu einer werden jetzt? also absage, emo und contrast?


ChatGPT:
Ja – detect/detector_registry.json ist die zentrale „Telefonliste“ für alle Detektoren, die dein System kennt. Darin steht pro Eintrag:

die ID (muss mit dem Dateinamen/Plugin übereinstimmen)

der Typ / Modus (regex, stddev, …)

der Pfad zur eigentlichen DETECT_…-Spezifikation

optionale Metadaten (Beschreibung, Zeitstempel …).

detect/detector_registry.json
(ersetzt das alte DETECT_default_marker_schema.json)

json
Kopieren
Bearbeiten
[
  {
    "id": "DETECT_ABSAGE_REGEX",
    "description": "Höfliche Absage – Regex-Detektor",
    "module": "regex",
    "file_path": "detect/DETECT_ABSAGE_REGEX.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  },
  {
    "id": "DETECT_EMO_VOLATILE",
    "description": "Emotionale Volatilität (Std-Abweichung)",
    "module": "stddev",
    "file_path": "detect/DETECT_EMO_VOLATILE.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  },
  {
    "id": "DETECT_EMO_CONTRAST_DRIFT",
    "description": "Valence-Kontrast-Drift > 0.3",
    "module": "trend_delta",
    "file_path": "detect/DETECT_EMO_CONTRAST_DRIFT.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  }
]
2) scripts/detect_creator.py
python
Kopieren
Bearbeiten
#!/usr/bin/env python3
"""
detect_creator.py
Erzeugt neue DETECT_*.json-Spezifikationen und trägt sie
automatisch im detector_registry.json ein.

Aufruf:
    python scripts/detect_creator.py \
        --id DETECT_MY_RULE \
        --type regex \
        --pattern "(example)" \
        --fire S_EXAMPLE_SEMANTIC
"""

import json, argparse, datetime
from pathlib import Path

REGISTRY = Path("detect/detector_registry.json")
DETECT_DIR = Path("detect")

def load_registry():
    return json.loads(REGISTRY.read_text("utf-8")) if REGISTRY.exists() else []

def save_registry(data):
    REGISTRY.write_text(json.dumps(data, indent=2), encoding="utf-8")

def create_detect_spec(args):
    spec = {
        "id": args.id,
        "description": args.description,
        "rule": {
            "type": args.type,
            **({"pattern": args.pattern, "flags": "i"} if args.type == "regex" else {}),
            **({"window": args.window, "threshold": args.threshold} if args.type != "regex" else {})
        },
        "fire_marker": args.fire
    }
    path = DETECT_DIR / f"{args.id}.json"
    path.write_text(json.dumps(spec, indent=2), encoding="utf-8")
    return str(path)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--id", required=True)
    p.add_argument("--type", choices=["regex","stddev","frequency","trend_delta","embedding_distance","cross_speaker_pattern"], required=True)
    p.add_argument("--pattern", help="Regex-Pattern, wenn Typ regex")
    p.add_argument("--window", type=int, default=10)
    p.add_argument("--threshold", type=float, default=0.3)
    p.add_argument("--fire", required=True, help="Marker-ID, die ausgelöst wird")
    p.add_argument("--description", default="")
    a = p.parse_args()

    file_path = create_detect_spec(a)

    registry = load_registry()
    registry.append({
        "id": a.id,
        "description": a.description,
        "module": a.type,
        "file_path": file_path,
        "class": None,
        "last_updated": datetime.datetime.utcnow().isoformat(),
        "auto_generated": False
    })
    save_registry(registry)
    print("✅  Detect-Spec und Registry-Eintrag erzeugt.")

if __name__ == "__main__":
    main()
3) backend/math/cost_vector_math.py
python
Kopieren
Bearbeiten
"""
cost_vector_math.py
Grundlegende Vektor-Hilfsfunktionen (Cosinus, Euklid, Normalisierung)
"""

import math
from typing import List

Vector = List[float]

def dot(a: Vector, b: Vector) -> float:
    return sum(x*y for x, y in zip(a, b))

def l2(a: Vector) -> float:
    return math.sqrt(sum(x*x for x in a))

def cosine(a: Vector, b: Vector) -> float:
    denom = l2(a) * l2(b)
    return dot(a, b) / denom if denom else 0.0

def normalize(a: Vector) -> Vector:
    length = l2(a)
    return [x/length for x in a] if length else a
4) backend/drift_metrics.py
python
Kopieren
Bearbeiten
"""
drift_metrics.py
Erweiterte Drift-Berechnungen auf Basis der Cost-Vector-Utilities.
"""

from backend.math.cost_vector_math import cosine, normalize
from typing import List

class CosineDrift:
    """
    Drift = 1 - Cosinus(aktueller Vektor, Basis-Vektor)
    """
    def __init__(self, base_vector: List[float]):
        self.base = normalize(base_vector)

    def drift(self, vector: List[float]) -> float:
        return 1.0 - cosine(normalize(vector), self.base)
5) backend/marker_engine_core.py
(Auszug – nur der korrigierte YAML-Pfad)

python
Kopieren
Bearbeiten
from pathlib import Path
import yaml, json

class MarkerEngine:
    def __init__(self, marker_root="markers"):
        self.marker_path = Path(marker_root)
        # ↺ vorher stand "meta_marker"
        self.meta_path   = self.marker_path / "meta"
        self.atomic_path = self.marker_path / "atomic"
        # …
6) profiler/drift/drift_mapping_basis.yaml
yaml
Kopieren
Bearbeiten
baseline_axes:
  - speaker_valence
  - avg_token_length
  - emoji_rate
7) profiler/drift/drift_marker_axes.yaml
yaml
Kopieren
Bearbeiten
marker_axes:
  - S_EXAMPLE_SEMANTIC
  - C_EXAMPLE_CLUSTER
  - MM_EXAMPLE_META
8) templates/CHA_TEMPLATE.yaml
yaml
Kopieren
Bearbeiten
id: CHA_TEMPLATE
description: "Vorlage für Chunk-Analyse-Schema"
detectors_active:
  - DETECT_ABSAGE_REGEX
  - DETECT_EMO_VOLATILE
high_level_snapshot:
  include_levels: [C_, MM_]
  top_k: 5
drift_axes:
  - speaker_valence
  - avg_token_length
outputs:
  show_markers: true
  show_drift:   true
Diese Dateien sind vollständig, konform zu den besprochenen Regeln und an der richtigen Stelle einsatzbereit.






Du:
detect/detector_registry.json soll die datei mit allen drei zu einer werden jetzt? also absage, emo und contrast?


ChatGPT:
Ja – detect/detector_registry.json ist die zentrale „Telefonliste“ für alle Detektoren, die dein System kennt. Darin steht pro Eintrag:

die ID (muss mit dem Dateinamen/Plugin übereinstimmen)

der Typ / Modus (regex, stddev, …)

der Pfad zur eigentlichen DETECT_…-Spezifikation

optionale Metadaten (Beschreibung, Zeitstempel …).
detect/detector_registry.json
json
Kopieren
Bearbeiten
[
  {
    "id": "DETECT_ABSAGE_REGEX",
    "description": "Höfliche Absage – Regex-Detektor",
    "module": "regex",
    "file_path": "detect/DETECT_ABSAGE_REGEX.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  },
  {
    "id": "DETECT_EMO_VOLATILE",
    "description": "Emotionale Volatilität (Std-Abweichung)",
    "module": "stddev",
    "file_path": "detect/DETECT_EMO_VOLATILE.json",
    "class": null,
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  },
  {
    "id": "DETECT_EMO_CONTRAST_DRIFT",
    "description": "Valence-Kontrast-Drift innerhalb eines Satzes",
    "module": "plugin",
    "file_path": "../plugins/GR_EMO_CONTRAST_DRIFT.py",
    "class": "detect_emo_contrast_drift",
    "last_updated": "2025-07-25T00:00:00Z",
    "auto_generated": false
  }
]
2 detect/DETECT_EMO_CONTRAST_DRIFT.json
json
Kopieren
Bearbeiten
{
  "id": "DETECT_EMO_CONTRAST_DRIFT",
  "rule": {
    "type": "plugin"
  },
  "fire_marker": "S_EMO_CONTRAST_DRIFT"
}
3 plugins/GR_EMO_CONTRAST_DRIFT.py
python
Kopieren
Bearbeiten
"""
GR_EMO_CONTRAST_DRIFT.py
Erkennt eine Wendung von positiver/gewisser Aussage zu negativer/unsicherer
in einem einzigen Satz. Liefert den Marker S_EMO_CONTRAST_DRIFT.
"""

import re
from typing import List, Dict, Any

id          = "GR_EMO_CONTRAST_DRIFT"
description = "Detects a pivot from certainty/positive to uncertainty/negative."

# ----------------- Regexe ------------------
certainty   = r"(ich weiß|i know|ich bin (mir )?sicher|i am sure|normalerweise|eigentlich|usually|grundsätzlich)"
uncertainty = r"(weiß (ich )?nicht|i don't know|unsicher|not sure|keine Ahnung|habe Angst|feel scared)"
contrast    = r"\b(aber|jedoch|andererseits|but|however)\b"

pattern_full = re.compile(f"({certainty}).*({contrast}).*({uncertainty})",
                          re.IGNORECASE)

pos_adj = r"\b(stark|glücklich|gut|unabhängig|strong|happy|good|independent)\b"
neg_adj = r"\b(schwach|verletzt|klein|ängstlich|weak|hurt|small|afraid)\b"
pattern_adj = re.compile(f"({pos_adj}).*({contrast}).*({neg_adj})",
                         re.IGNORECASE)
# -------------------------------------------

def run(text: str,
        utils=None,
        meta: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """
    Standard-API für Grabber-Plugins.
    """
    hits: List[Dict[str, str]] = []

    if m := pattern_full.search(text):
        hits.append({
            "marker": "S_EMO_CONTRAST_DRIFT",
            "rule":   "certainty_uncertainty_pivot",
            "snippet": m.group(0)
        })

    if m := pattern_adj.search(text):
        hits.append({
            "marker": "S_EMO_CONTRAST_DRIFT",
            "rule":   "adjective_contrast",
            "snippet": m.group(0)
        })

    return {
        "fire": ["S_EMO_CONTRAST_DRIFT"] if hits else [],
        "score": len(hits),
        "details": hits
    }
4 schemata/SCH_BEZIEHUNG.json
(aus deiner alten beziehungsanalyse_schema.json zusammen­geführt)

json
Kopieren
Bearbeiten
{
  "id": "SCH_BEZIEHUNG",
  "description": "Analyse-Profil: Beziehung & Bindungsdynamik",
  "weights": {
    "A_": 1.0,
    "S_": 1.0,
    "C_": 1.2,
    "MM_": 1.5
  },
  "window": { "messages": 120 },
  "decay": 0.01,
  "risk_thresholds": {
    "green": 0,
    "yellow": 10,
    "red": 25
  }
}
5 chunk_analysis/CHA_GAP_NEED_ATTACHMENT.yaml
yaml
Kopieren
Bearbeiten
id: CHA_GAP_NEED_ATTACHMENT
description: "Chunk-Analyse – prüft Lücken zwischen Bedürfnis und Bindung"
detectors_active:
  - DETECT_EMO_CONTRAST_DRIFT
  - DETECT_ABSAGE_REGEX
high_level_snapshot:
  include_levels: [C_, MM_]
  top_k: 10
drift_axes:
  - speaker_valence
  - avg_token_length
scoring:
  weight_multiplier: 1.3
outputs:
  show_markers: true
  show_drift:   true
  store_json:   true
6 templates/CHA_TEMPLATE.yaml
yaml
Kopieren
Bearbeiten
id: CHA_TEMPLATE
description: "Vorlage für neue Chunk-Analyse-Schemas"
detectors_active: []
high_level_snapshot:
  include_levels: [C_, MM_]
  top_k: 5
drift_axes: []
scoring:
  weight_multiplier: 1.0
outputs:
  show_markers: true
  show_drift:   true
  store_json:   false
7 scripts/detect_creator.py
python
Kopieren
Bearbeiten
#!/usr/bin/env python3
"""
detect_creator.py
Generiert neue DETECT_*.json-Regeln und trägt sie automatisch
in detect/detector_registry.json ein.
"""

import json, argparse, datetime
from pathlib import Path

REGISTRY   = Path("detect/detector_registry.json")
DETECT_DIR = Path("detect")

def load_registry():
    return json.loads(REGISTRY.read_text("utf-8")) if REGISTRY.exists() else []

def save_registry(data):
    REGISTRY.write_text(json.dumps(data, indent=2), encoding="utf-8")

def create_spec(args) -> str:
    spec = {
        "id": args.id,
        "rule": {
            "type": args.type,
            **({"pattern": args.pattern, "flags": "i"} if args.type == "regex" else {}),
            **({"window": args.window, "threshold": args.threshold} if args.type != "regex" else {})
        },
        "fire_marker": args.fire,
        "description": args.description
    }
    path = DETECT_DIR / f"{args.id}.json"
    path.write_text(json.dumps(spec, indent=2), encoding="utf-8")
    return str(path)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--id", required=True)
    p.add_argument("--type",
                   choices=["regex","stddev","frequency","trend_delta","embedding_distance","cross_speaker_pattern","plugin"],
                   required=True)
    p.add_argument("--pattern",   help="Regex, falls Typ regex")
    p.add_argument("--window",    type=int,   default=10)
    p.add_argument("--threshold", type=float, default=0.3)
    p.add_argument("--fire",      required=True, help="Marker-ID, die ausgelöst wird")
    p.add_argument("--description", default="")
    a = p.parse_args()

    file_path = create_spec(a)

    registry = load_registry()
    registry.append({
        "id":           a.id,
        "description":  a.description,
        "module":       a.type,
        "file_path":    file_path,
        "class":        None if a.type != "plugin" else a.id.lower(),
        "last_updated": datetime.datetime.utcnow().isoformat(),
        "auto_generated": False
    })
    save_registry(registry)
    print("✅ Detect-Regel und Registry-Eintrag erstellt.")

if __name__ == "__main__":
    main()
