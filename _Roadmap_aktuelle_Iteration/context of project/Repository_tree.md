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
/profiler/
    └─ PROF_EWMA_DRIFT.py      # Beispiel  
│
/templates/
    └─ PROF_TEMPLATE.py        # Vorlage-Dateien
├─ interface/                    # GUI-Quellcode
├─ output/                       # OUT_ Berichte
└─ docs/
