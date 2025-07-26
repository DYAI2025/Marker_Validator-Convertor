/                                   # ───── Repository Root ─────
│
├─ markers/                         # 4 Ebenen; YAML ist Master
│   ├─ atomic/                      #   Level-1   (A_)
│   │    └─ A_FAREWELL_EMOJI.yaml   #   + weitere A_*.yaml
│   ├─ semantic/                    #   Level-2   (S_)
│   │    └─ S_EXAMPLE_SEMANTIC.yaml
│   ├─ cluster/                     #   Level-3   (C_)
│   │    └─ C_EXAMPLE_CLUSTER.yaml
│   └─ meta/                        #   Level-4   (MM_)
│        └─ MM_EXAMPLE_META.yaml
│
├─ json_export/                     # auto-generiert (hook)
│   └─ … mirrort markers/*/*.json
│
├─ schemata/                        # **Plural „schemata“**
│   ├─ marker.schema.v2.json        #   Kern-Schema
│   ├─ marker.schema.v2.1.json      #   + optionale Felder
│   ├─ SCH_DEFAULT.json             #   Profil-Schemata (Gewichtung)
│   ├─ SCH_BEZIEHUNG.json
│   ├─ SCH_FRAUD.json
│   └─ MASTER_SCH_CORE.json         #   Router für aktive SCH_
│
├─ detect/                          # regel-basierte Trigger-Specs
│   ├─ DETECT_ABSAGE_REGEX.json
│   └─ DETECT_EMO_VOLATILE.json
│
├─ grabber_meta/                    # Meta-Dokumente der Grabber
│   ├─ GR_META_BOUNDARY_SEM_a4f2.json
│   └─ GR_META_AUTO_SEM_b81c.json
│
├─ plugins/                         # Laufzeit-Code (JS / PY)
│   ├─ GR_SEM_BOUNDARY.js
│   └─ GR_KIMI_SUGGEST.py
│
├─ semantic_rules/                  # Auto-Generierungsregeln
│   └─ semantic_grabber_rules.yaml
│
├─ scores/                          # Fenster-Aggregationen
│   └─ SCR_FLIRT_ESCALATION.json
│
├─ calculate/                       # Baseline-Generatoren
│   └─ CAL_BASELINE_PROFILE.py
│
├─ profiler/                        # Drift- & Trend-Tracker
│   └─ PROF_EWMA_DRIFT.py
│
├─ config/
│   └─ marker-tool.default.json     # 🔧 zentrale Konfiguration
│
├─ templates/                       # **Vorlagen für neue Dateien**
│   ├─ A_TEMPLATE.yaml
│   ├─ S_TEMPLATE.yaml
│   ├─ C_TEMPLATE.yaml
│   ├─ MM_TEMPLATE.yaml
│   ├─ SCH_TEMPLATE.json
│   ├─ MASTER_SCH_TEMPLATE.json
│   ├─ DETECT_TEMPLATE.json
│   ├─ GR_TEMPLATE.js
│   ├─ SCR_TEMPLATE.json
│   ├─ CAL_TEMPLATE.py
│   └─ PROF_TEMPLATE.py
│
├─ scripts/                         # Hilfs- & Migrations-Skripte
│   └─ migrate_grabber_library.py
│
├─ interface/                       # Electron/Tauri GUI-Quellcode
│
├─ output/                          # OUT_ Berichte / Exporte
│
├─ tests/                           # Validierungs-Samples
│   ├─ good/   (5 valide Marker)
│   └─ bad/    (5 fehlerhafte Marker)
│
└─ docs/
    └─ ARCHITECTURE-v1.2.md         # ausführliche Spezifikation
