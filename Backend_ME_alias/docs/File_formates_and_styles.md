1. Marker-Dateien (YAML/JSON)
Ordner:

/markers/atomic/ (A_)

/markers/semantic/ (S_)

/markers/cluster/ (C_)

/markers/meta/ (MM_)

Validierungskriterien für Marker (alle Level):
Pflichtfelder:

id (z. B. A_LATE_RESPONSE)

marker (Name/Label, englisch, CAPS, _ statt Leerzeichen)

level (1=atomic, 2=semantic, 3=cluster, 4=meta)

version

status (draft, active, archived)

author

created (ISO)

last_modified (ISO)

description (klar und ausreichend)

tags (mind. 1 Tag)

category (passend zur Ebene)

pattern (array, außer bei reinen Meta-Markern)

examples (mind. 2–3 pro Marker)

Optional, aber empfohlen:

risk_score (numeric, default 1–4)

window (object mit messages oder seconds, falls relevant)

scoring (object mit weight, impact, etc.)

Spezifisch für Level:

Atomic (A_): Nur einfache Pattern (Regex, String, Emoji), keine composed_of.

Semantic (S_): composed_of (List von Marker-IDs, meist A_ und/oder S_), activation_logic (Boolean/Expression), ggf. semantic_rules.

Cluster (C_): composed_of (List von S_/A_), trigger_threshold (min. Anzahl), activation_logic, ggf. cluster_components.

Meta (MM_): required_clusters (List von C_/S_), meta_analysis, activation_logic.

Präfix muss stimmen:

Atomic: A_, Semantic: S_, Cluster: C_, Meta: MM_

id und Dateiname stimmen überein.

Dateiformat:

Marker = YAML (empfohlen), JSON (Mongo-kompatibel)

YAML muss zu JSON konvertierbar sein, keine Felder doppelt oder illegal.

2. Schemata
Ordner: /schemata/

Schema-Profil: (SCH_)

z. B. SCH_BEZIEHUNG.json, SCH_FRAUD.json

Master-Schema: (MASTER_SCH_)

z. B. MASTER_SCH_CORE.json

Validierungskriterien für Schemata:
Pflichtfelder:

id (SCH_ oder MASTER_SCH_)

Schema:

weights (Mapping Marker-IDs → Faktor)

window (messages/seconds)

decay (optional, float)

risk_thresholds (map mit z. B. green, yellow, red)

ggf. drift_axes, fusion etc.

Master:

active_schemata (List von SCH_)

priority (Map: SCH_ → 0–1)

fusion (z. B. multiply, sum)

Dateiformat: JSON

Präfix: immer SCH_ bzw. MASTER_SCH_

3. Detektoren (DETECT_)
Ordner: /detect/

z. B. DETECT_ABSAGE_REGEX.json, DETECT_EMO_VOLATILE.json, Registry: detect/detector_registry.json

Validierungskriterien für Detektoren:
Pflichtfelder (in Einzel-Detect):

id

rule (object mit Typ, Parametern – z. B. Regex, Window)

fire_marker (Marker-ID)

Im Registry-File:

id, description, module (regex, stddev...), file_path, Zeitstempel

Dateiformat: JSON

Präfix: immer DETECT_

Registry-Liste: keine Dopplungen, alle Files müssen existieren

4. Chunk-Analyse-Schema (CHA_)
Ordner: /chunk_analysis/

z. B. CHA_GAP_NEED_ATTACHMENT.yaml, CHA_FRAUD_OVERVIEW.yaml

Validierungskriterien:
Pflichtfelder:

id (CHA_)

description

detectors_active (Liste DETECT_-IDs)

high_level_snapshot (Settings für Level/Top K)

drift_axes (List)

outputs (Mind. show_markers, show_drift)

Dateiformat: YAML, konvertierbar zu JSON

5. Score-Profile (SCR_) & Calculate/Baseline (CAL_)
Ordner: /scores/ (SCR_), /calculate/ (CAL_)

z. B. SCR_FLIRT_ESCALATION.json, CAL_BASELINE_PROFILE.py

Validierungskriterien:
SCR_:

id

target_markers[]

window

aggregation (sum, mean...)

CAL_:

Script mit klarer Funktion (produce_baseline()), gibt JSON aus, oder JSON mit passender Struktur

Präfix: immer SCR_ oder CAL_

6. Driftachsen & Profiler (PROF_)
Ordner: /profiler/, /profiler/drift/

z. B. drift_mapping_basis.yaml, drift_marker_axes.yaml, PROF_EWMA_DRIFT.py

Validierungskriterien:
Driftachsen: YAML, List mit IDs/Achsen

Profiler: Python-Script mit update(), ggf. drifted()

7. Grabber/Plugins (GR_)
Ordner: /grabber_meta/, /plugins/

z. B. GR_SEM_ABSAGE.json, sample-plugin.js, GR_KIMI_SUGGEST.py

Validierungskriterien:
Meta: JSON mit id, description, Exportfunktion

Plugin: Funktionsname (run()), Return-Value dokumentiert

8. Tests & Examples
Ordner: /tests/good/, /tests/bad/, /examples/

Validierungskriterien:
YAML/JSON mit mind. 1 gültigem, 1 ungültigen Beispiel pro Markerklasse und Analyseschema

Muss als Linter-Test automatisiert laufen

9. Utils, Models, Scripts
Sonstige Tools:

Python-Utilities, Loader, Matcher, Engine, Math-Module (liegen im passenden Backend-Ordner, nicht bei Markern!)

Scripte müssen eine klar dokumentierte Hauptfunktion haben, keine Felder doppelt, lesbarer Header, Typen deklariert.

Zusammenfassend:
Jede Datei muss…

ihrem Typen-Template 100% entsprechen (siehe oben, Präfix, Felder, Pflichtfelder, Typen).

keinen „illegalen“ Zusatz oder fehlende Pflichtfelder haben.

für YAML: immer zu JSON konvertierbar sein, ohne Datenverlust.

für Schemata: mit allen referenzierten Marker/Detect-Files kompatibel sein.

Pfade/IDs konsistent (Präfix, CamelCase, Ordnerstruktur).