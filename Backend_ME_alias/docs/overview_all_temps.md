/
├─ markers/                      # A_ / S_ / C_ / MM_  (YAML)
│
/
├─ schemata/                    # ← früher “schemas/”
│    ├─ marker.schema.v2.json
│    ├─ marker.schema.v2.1.json
│    ├─ SCH_DEFAULT.json
│    ├─ SCH_BEZIEHUNG.json
│    ├─ SCH_FRAUD.json
│    └─ MASTER_SCH_CORE.json
├─ config/
│    └─ marker-tool.default.json
...

├─ detect/                       # DETECT_*.json
│
├─ grabber_meta/                 # GR_META_*.json   ← NEU klar erwähnt
│
├─ plugins/                      # GR_*.js  |  GR_*.py
│
├─ scores/                       # SCR_*.json
├─ calculate/                    # CAL_*.py|json
├─ profiler/                     # PROF_*.py|json
│
├─ config/                       # ▼ Hier liegt die Datei
│   └─ marker-tool.default.json  # zentrale Konfig
│
├─ templates/                    # alle Vorlage-Dateien
├─ interface/                    # GUI-Quellcode
├─ output/                       # OUT_ Berichte
└─ docs/

JSON auto-mirror
A pre-commit hook converts every *.yaml in markers/ to /json_export/…/*.json so MongoDB and CI always see JSON.

2 · Marker templates – authoring in YAML
2.1 Atomic (A_) templates/A_TEMPLATE.yaml
yaml
Kopieren
Bearbeiten
id: "A_FAREWELL_EMOJI"      # Prefix A_
level: 1
name: "FAREWELL_EMOJI"
description: "Abschieds-Emoji (👋,🫡,🙋) signalisiert Gesprächsende."
pattern:
  - "👋"
  - "🫡"
  - "🙋‍♂️|🙋‍♀️"
examples:
  - "Bis später! 👋"
tags: ["farewell", "emoji"]
version: "1.0"
status: "active"
2.2 Semantic (S_) templates/S_TEMPLATE.yaml
yaml
Kopieren
Bearbeiten
id: "S_ABSAGE_INDIR"        # Prefix S_
level: 2
name: "INDIREKTE_ABSAGE"
description: "Kombiniert wenig-Zeit + unsicher → höfliche Absage."
composed_of:
  - type: atomic
    marker_ids: ["A_WENIG_ZEIT", "A_NICHT_SICHER"]
activation_logic: "ANY"     # ANY | ALL | BOOL expression
window: { messages: 5 }
examples:
  - "Melde mich später, ok?"
  - "Ich bin grad im Stress."
tags: ["absage", "indirekt"]
version: "1.0"
status: "active"
2.3 Cluster (C_) templates/C_TEMPLATE.yaml
yaml
Kopieren
Bearbeiten
id: "C_SOFT_COMMITMENT"     # Prefix C_
level: 3
name: "SOFT_COMMITMENT"
description: "Verbindliche Aussagen mit Hintertürchen."
composed_of:
  - type: semantic
    marker_ids: ["S_ABSAGE_INDIR", "S_WOHWOHL_ZUGESTAENDNIS"]
activation_logic: "ALL"
scope: "conversation"
window: { messages: 20 }
scoring: { weight: 1.2, decay: 0.01 }
examples:
  - "Ich würde ja gern, aber…"
tags: ["commitment", "ambivalent"]
2.4 Meta (MM_) templates/MM_TEMPLATE.yaml
yaml
Kopieren
Bearbeiten
id: "MM_RELATIONSHIP_DISTANCE"   # Prefix MM_
level: 4
name: "RELATIONSHIP_DISTANCE"
description: "Cluster von Mustern, die emotionale Distanz aufbauen."
composed_of:
  - type: cluster
    marker_ids: ["C_SOFT_COMMITMENT"]
  - type: semantic
    marker_ids: ["S_EMOTION_SUPPRESSION"]
activation_logic: "(C_SOFT_COMMITMENT AND S_EMOTION_SUPPRESSION)"
trigger_threshold: 2
window: { messages: 50 }
scoring: { weight: 2.0 }
examples:
  - "Du verstehst mich einfach nicht mehr."
tags: ["meta", "relationship"]
3 · Schema templates (schemas/)
3.1 Profile templates/SCH_TEMPLATE.json
json
Kopieren
Bearbeiten
{
  "id": "SCH_BEZIEHUNG",
  "weights": {
    "A_": 1.0,
    "S_": 1.0,
    "C_": 1.2,
    "MM_": 1.5
  },
  "window": { "messages": 100 },
  "decay": 0.005,
  "notes": "Beziehungsanalyse – Meta-Marker stärker gewichten."
}
3.2 Master router templates/MASTER_SCH_TEMPLATE.json
json
Kopieren
Bearbeiten
{
  "id": "MASTER_SCH_CORE",
  "active_schemas": [
    "SCH_DEFAULT.json",
    "SCH_BEZIEHUNG.json",
    "SCH_FRAUD.json"
  ],
  "priority": {
    "SCH_FRAUD.json":      0.9,
    "SCH_BEZIEHUNG.json":  0.7,
    "SCH_DEFAULT.json":    0.5
  },
  "fusion": "multiply"  // later: sum | max
}
4 · Detect spec template (detect/DETECT_TEMPLATE.json)
json
Kopieren
Bearbeiten
{
  "id": "DETECT_ABSAGE_REGEX",
  "description": "Sucht nach höflichen Absagen.",
  "rule": {
    "type": "regex",
    "pattern": "(melde.*später|keine zeit|grad.*stressig)",
    "flags": "i"
  },
  "fire_marker": "A_NICHT_SICHER"
}
5 · Grabber template (plugins/GR_TEMPLATE.js)
js
Kopieren
Bearbeiten
export const id          = "GR_SEM_ABSAGE";
export const description = "Semantic embedding matcher for polite refusals";

/**
 * @param text   {string}
 * @param utils  {object}  // embed(textArray) → Float32Array, log(), …
 * @returns {Promise<{fire:string[], score:number, notes?:string}>}
 */
export async function run(text, utils) {
  const sim = await utils.cosine(
    await utils.embed([text]),
    await utils.embed([
      "Kann ich dir morgen Bescheid geben?",
      "Gerade stressig, melde mich später."
    ])
  );
  if (sim > 0.82) {
    return { fire: ["S_ABSAGE_INDIR"], score: sim.toFixed(2) };
  }
  return { fire: [], score: sim.toFixed(2) };
}
6 · Workflow / Order of execution
Step	Component	Consumes	Produces
1	Detect-Runner	DETECT_*.json	initial A/S marker-IDs
2	Marker-Rules	markers/ YAML	evaluates pattern[] & activation_logic, emits further A/S/C/MM
3	Semantic Grabber(s)	`plugins/GR_*.js	py`
4	Schema-Processor	MASTER_SCH_*.json → loads each SCH_*.json	multiplies score × priority
5	Score tracker (SCR_)	weighted hits	windowed aggregates
6	Profiler (PROF_)	score stream	drift alerts
7	GUI / Extension	final hits, scores, suggestions	highlights, tool-tips, reports


Wie fügt sich das in den Workflow ein?
javascript
Kopieren
Bearbeiten
Detect ─► Marker-Rules ─► Grabber-Loader
                                 │
                ┌──────── queries meta + dynamic import
                ▼
        (meta JSON)            (plugin JS/PY)
        grabber_meta/          plugins/
Marker hat Feld semantic_grabber_id: GR_META_BOUNDARY_SEM_a4f2.

Grabber-Loader

holt Meta-JSON (fast Lookup / Mongo index),

import() das Plugin (plugin-Key),

übergibt meta + utils.

Plugin liefert Marker-Hits oder nur Score → geht in Schema-Pipeline.

Wenn neuer Marker kein Grabber hat, Auto-Engine (gemäß semantic_grabber_rules.yaml)

sucht ähnlichen Meta-Eintrag (≥ 0.72) → verlinkt,

sonst erzeugt neuen GR_META_AUTO_SEM_… und legt Embedding ab.

4 · Migration / Übergang
Schritt	Aktion
1	Konvertiere jede Section in semantic_grabber_library.yaml nach Meta-JSON.
2	Lege pro Grabber-Typ ein passendes Plugin-File an (JS für GUI, PY für Backend).
3	Update Marker-YAML: ersetze semantische_grabber_id: Werte durch neue GR_META_ … IDs.
4	Passe Auto-Regeln in semantic_grabber_rules.yaml an, damit sie Meta-JSON schreiben/lesen.

Das alte monolithische YAML bleibt als cold archive für Traceability.

5 · Warum eleganter?
Merge-Konflikte minimiert – jeder Grabber hat eigene Meta-Datei.

Hot-reload-fähig – Plugin-Code kann live nachgeladen werden.

Gleicher Pfad für Electron-GUI und Backend-CLI: beide greifen auf dieselbe Meta-Collection + Plugin-Folder zu.

Mongo-Friendly – Meta-JSON ≙ 1-zu-1 DB-Dokument, Embeddings können als Binär oder Base64 gespeichert werden.

6 · Template-Ordner (neu)
bash
Kopieren
Bearbeiten
/grabber_meta/      # GR_META_*.json
/plugins/           # GR_*.js  |  GR_*.py
/semantic_rules/    # semantic_grabber_rules.yaml  (bleibt)
marker-tool.default.json bekommt:

jsonc
Kopieren
Bearbeiten
"grabber": {
  "meta_path":   "grabber_meta/",
  "plugin_path": "plugins/",
  "auto_rules":  "semantic_rules/semantic_grabber_rules.yaml"
}

mermaid
Kopieren
Bearbeiten
flowchart LR
    A(Text) --> B(Detect)
    B --> C(Marker Rules)
    C --> D(Grabber GR_)
    D --> E(Schema Fusion)
    E --> F(SCR Window)
    F --> G(PROF Drift)
    E --> H[[GUI]]
Grabbers run after basic rule evaluation so they can decide with full context; they never overwrite files, only return suggestions.

7 · MongoDB schema (mirrors the files)
bash
Kopieren
Bearbeiten
markers        { _id: "A_FAREWELL_EMOJI", ... }
schemas        { _id: "SCH_BEZIEHUNG",     ... }
master_schema  { _id: "MASTER_SCH_CORE",   ... }
detect_specs   { _id: "DETECT_ABSAGE_REGEX", ... }
plugins        { _id: "GR_SEM_ABSAGE", meta:{lang:"js"} }
8 · Outstanding items (for next sprint)
Full YAML templates for S_ / C_ / MM_ now included – ensure they move into /templates/.

Schema prefix SCH_ now used everywhere.

Provide good / bad sample markers under /tests/ to exercise CI.

Finalise detect_runner.py (generic evaluator for regex/stddev/trend Δ).

Wire Kimi K2 as GR_KIMI_SUGGEST.py (suggest-only).