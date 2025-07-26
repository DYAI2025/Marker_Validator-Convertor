1 · Zweck dieses Repos
Dieses Repository enthält die gesamte Backend-Logik der Marker-Engine:

Ordner- und Dateistruktur

Klassen-Konventionen (A_, S_, C_, MM_, SCH_, DETECT_, GR_ …)

Validierungs- und Umwandlungsregeln

Synchronisations­mechanismus zum GUI-/Tool-Repo

Damit kann jedes Teammitglied neue Marker, Detektoren, Grabber oder Chunk-Analysen hinzufügen, ohne bestehende Strukturen zu beschädigen oder zu duplizieren.

2 · Repository-Aufbau (Top-Level)
bash
Kopieren
Bearbeiten
/                           # Repo-Root (Submodul im Tool-Repo)
/markers/                   # YAML-Quelle A_/S_/C_/MM_
/json_export/               # auto-generiertes JSON (pre-commit-Hook)
/schemata/                  # SCH_… & MASTER_SCH_…
/detect/                    # DETECT_*.json (Metadaten)
/plugins/                   # GR_*.py / .js  (ausführbarer Code)
/grabber_meta/              # GR_META_*.json
/chunk_analysis/            # CHA_*.yaml (Runtime)
/templates/                 # *einzige* Stelle für Vorlagen
/scripts/                   # Migrations- & Generator-Skripte
/backend/                   # Laufzeit-Engine & Hilfs-Libs
/profiler/                  # Drift-/Trend-Module
/config/                    # marker-tool.default.json
/docs/                      # Architektur- und API-Docs
/tests/                     # Positiv/Negativ-Samples
Regel: Vorlagen liegen ausschließlich in /templates/, niemals in Funktions­ordnern.

3 · Klassen & Pflichtfelder
Klasse	Präfix	Ordner	Pflichtfelder
Atomic Marker	A_	markers/atomic/	id, level, name, description, pattern[], examples[]
Semantic Marker	S_	markers/semantic/	plus composed_of[], activation_logic
Cluster Marker	C_	markers/cluster/	plus cluster_components[], trigger_threshold
Meta Marker	MM_	markers/meta/	plus required_clusters[], window
Schema-Profil	SCH_	schemata/	id, weights{A_/S_/C_/MM_}, window, decay
Master-Schema	MASTER_SCH_	schemata/	active_schemata[], priority{}, fusion
Detektor	DETECT_	detect/	id, rule{type…}, fire_marker, plugin?
Grabber-Meta	GR_META_	grabber_meta/	id, description, examples[], plugin
Grabber-Plugin	GR_	plugins/	id, description, run(text,utils,meta)
Score-Profil	SCR_	scores/	id, target_markers[], window, aggregation.method
Baseline-Calc	CAL_	calculate/	produce_baseline() (Py) oder method (JSON)
Profiler	PROF_	profiler/	Klasse mit update()
Chunk-Analyse	CHA_	chunk_analysis/	detectors_active[], drift_axes[], outputs

Alle YAML/JSON-Klassen werden über schemata/marker.schema.v2.1.json validiert; zusätzliche Custom-Checks liegen in scripts/validate_repo.py.

4 · Workflow (End-to-End)
Marker-Bearbeitung

YAML anlegen/ändern → pre-commit-Hook konvertiert zu /json_export/.

Detektor anlegen

scripts/detect_creator.py ausführen → erzeugt DETECT_-JSON und aktualisiert Registry.

Optional Plugin-Code in /plugins/.

Validierung

scripts/validate_repo.py prüft alle Dateien (CI oder lokal).

Engine-Laufzeit (backend/marker_engine_core.py)

Lädt Marker → Detektoren → Grabber → Schemas

Berechnet Scores & Ampel.

Chunk-Analyse

CHA_-Schema listet aktive Detektoren + Drift-Achsen.

Ergebnisse landen als JSON unter /output/analysis/….

Submodule-Sync

Im GUI-/Tool-Repo ist dieses Backend-Repo als Submodul subrepo/ eingebunden.

Änderungen hier → git commit && git push → im Tool-Repo git submodule update --remote.

5 · Synchronisations-Regeln (Tool ↔ Backend)
Aktion im Tool-Repo	Schritt für Konsistenz
Neue Marker-YAML speichern	git submodule update --remote im Tool-Repo ausführen oder über CI automatisiert.
Gewichte / Scores ändern	gleiche Vorgehensweise; Backend-Repo bleibt Source of Truth.
Neue Detektoren / Plugins	Nur hier im Backend-Repo anlegen, dann Submodul-Update im Tool ausführen.
Änderungen nur am Tool-Code (UI etc.)	keine Backend-Änderung nötig.

6 · CI-Pipelines
Backend-Repo

YAML/JSON-Lint

scripts/validate_repo.py

scripts/build_detector_registry.py

Tool-Repo

Submodul-Check: git diff --submodule darf leer sein.

UI-Tests.

7 · Schritt-für-Schritt-Beispiel: Neuen Cluster-Marker + Detektor hinzufügen
bash
Kopieren
Bearbeiten
# 1. Atomic & Semantic existieren bereits…

# 2. Cluster-YAML anlegen
cp templates/C_TEMPLATE.yaml markers/cluster/C_MY_NEW_CLUSTER.yaml
vi markers/cluster/C_MY_NEW_CLUSTER.yaml   # ids, patterns eintragen

# 3. Detektor erzeugen
python scripts/detect_creator.py \
   --id DETECT_MY_NEW_CLUSTER \
   --type regex \
   --pattern "(my.*regex)" \
   --fire C_MY_NEW_CLUSTER \
   --description "Erkennt neue Cluster-Kombi"

# 4. Validieren & Registry bauen
python scripts/validate_repo.py
python scripts/build_detector_registry.py

# 5. Commit + Push
git add .
git commit -m "feat: neuer Cluster-Marker & Detektor"
git push
Im Tool-Repo:

bash
Kopieren
Bearbeiten
git submodule update --remote subrepo
npm run dev   # UI zeigt neuen Marker
8 · Wichtige Skripte
Script	Zweck
scripts/validate_repo.py	YAML/JSON-Schema-Checks + Custom-Rules
scripts/build_detector_registry.py	Registry aus DETECT_*.json generieren
scripts/migrate_grabber_library.py	Alte Grabber-YAML → Meta/Plugin
scripts/detect_creator.py	Detektor-JSON + Registry-Eintrag interaktiv erzeugen

9 · Grundsatz­regeln
Vorlagen nur unter /templates/.

Keine manuelle Bearbeitung von detector_registry.json; immer Script laufen lassen.

Marker-IDs sind global eindeutig; keine Dopplung über Level hinweg.

Alle Marker-Re­ferenzen in Detektoren, Grabbern, Schemas müssen existieren (Custom-Validator prüft das).

Submodul-Pflege: Änderungen immer zuerst hier im Backend-Repo committen.

Backend-Flow (High Level)

┌─[YAML/JSON Marker files]──┐
│  prefix A_/S_/C_/MM_      │
└───────────────────────────┘
          │  (Converter-GUI: YAML⇌JSON, Validation, Repair)
          ▼
  /markers/clean/{yaml,json}
          │
          ├─» Chrome-Extension (Task 2)
          └─» Python Runtime CLI  (option)
                 ↓
           detect-python(s)
                 ↓
             Schema (SCH_)  ➜ Gewichtung / Fenster
