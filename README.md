# Marker Validator & Converter Tool

Ein umfassendes Tool zur Validierung und Konvertierung von Marker-Dateien in verschiedenen Formaten (YAML/JSON) mit erweiterten Auto-Fix-Funktionen für alle Projekt-Dateitypen.

## 🎯 **Neue Features (v2.0)**

### **Multi-Dateityp-Unterstützung**
Das Tool erkennt und validiert automatisch alle eure Projekt-Dateitypen:

- **Marker** (A_, S_, C_, MM_) - YAML/JSON
- **Schema** (SCH_, MASTER_SCH_) - JSON  
- **Detect** (DETECT_) - JSON
- **Chunk-Analysis** (CHA_) - YAML
- **Score** (SCR_) - JSON
- **Profiler** (PROF_) - Python
- **Grabber** (GR_) - JavaScript/Python

### **Intelligente Auto-Fix-Engine**
Automatische Reparatur von häufigen Fehlern:

#### **Auto-fixbar (sicher):**
- ✅ **Format-Fehler**: Präfix-Korrektur, Array-Normalisierung
- ✅ **Typo-Fehler**: Feldnamen-Korrektur (desciption → description)
- ✅ **Default-Werte**: Fehlende Felder automatisch ergänzen
- ✅ **Datum-Normalisierung**: ISO-Format erzwingen
- ✅ **Array-Konvertierung**: String → Array (pattern, tags, etc.)

#### **Nur melden (inhaltlich):**
- ❌ **Logische Fehler**: Falsche Pattern, inkonsistente Referenzen
- ❌ **Fehlende Pflichtfelder**: Keine description, kein pattern
- ❌ **Datentyp-Fehler**: scoring: string statt object
- ❌ **Zyklische Referenzen**: ID verweist auf sich selbst

## 📦 **Projektstruktur**

```
Marker_validator_convert/
├── config/
│   └── marker-tool.default.json    # Zentrale Konfiguration
├── schemas/                        # JSON-Schemas für alle Dateitypen
│   ├── marker.schema.v2.1.json     # Erweitertes Marker-Schema
│   ├── schema.schema.json          # Schema für SCH_/MASTER_SCH_
│   ├── detect.schema.json          # Schema für DETECT_
│   ├── chunk-analysis.schema.json  # Schema für CHA_
│   ├── score.schema.json           # Schema für SCR_
│   ├── profiler.schema.json        # Schema für PROF_
│   └── grabber.schema.json         # Schema für GR_
├── packages/
│   ├── cli/                        # CLI-Tool
│   └── gui/                        # Web-GUI
├── examples/                       # Beispiel-Dateien
│   ├── schema/
│   ├── detect/
│   └── chunk-analysis/
├── plugins/                        # Plugin-System
└── templates/                      # Vorlagen für alle Dateitypen
```

## 🚀 **Erste Schritte**

```bash
# Repository klonen
git clone https://github.com/DYAI2025/Marker_Validator-Convertor.git
cd Marker_Validator-Convertor

# Dependencies installieren
pnpm install

# CLI testen
node packages/cli/bin/cli.js info
```

## 🛠️ **CLI-Befehle**

### **Dateityp-Erkennung**
```bash
# Dateityp einer Datei erkennen
node packages/cli/bin/cli.js detect examples/schema/SCH_BEZIEHUNG.json

# Ausgabe:
# Type: schemas
# Schema: schema
# Confidence: high
# Prefix: SCH_
```

### **Validierung**
```bash
# Einzelne Datei validieren
node packages/cli/bin/cli.js validate examples/schema/SCH_BEZIEHUNG.json

# Alle Dateien im Projekt validieren
node packages/cli/bin/cli.js validate-all

# Mit verbose-Ausgabe
node packages/cli/bin/cli.js validate-all -v
```

### **Auto-Reparatur**
```bash
# Einzelne Datei reparieren (dry-run)
node packages/cli/bin/cli.js repair examples/bad/needs_repair_schema.json --dry-run

# Mit verbose-Ausgabe
node packages/cli/bin/cli.js repair examples/bad/needs_repair_schema.json --dry-run -v

# Alle Dateien im Projekt reparieren
node packages/cli/bin/cli.js repair-all --dry-run

# Echte Reparatur (ohne dry-run)
node packages/cli/bin/cli.js repair-all
```

### **Konvertierung**
```bash
# YAML ↔ JSON Konvertierung
node packages/cli/bin/cli.js convert examples/markers/A_EXAMPLE.yaml

# Batch-Konvertierung
node packages/cli/bin/cli.js convert "examples/**/*.yaml"
```

## 🌐 **Web-GUI**

```bash
# GUI starten
./start_gui.command

# Oder manuell
cd packages/gui && pnpm start
```

Die Web-GUI unterstützt:
- **Drag & Drop** für alle Dateitypen
- **Dateityp-Erkennung** automatisch
- **Validierung** mit detaillierten Fehlermeldungen
- **Auto-Reparatur** mit Vorschau
- **Batch-Verarbeitung** mehrerer Dateien

## ⚙️ **Konfiguration**

Die zentrale Konfiguration in `config/marker-tool.default.json`:

```json
{
  "fileTypes": {
    "markers": {
      "prefixes": ["A_", "S_", "C_", "MM_"],
      "extensions": [".yaml", ".yml", ".json"],
      "folders": ["markers/atomic", "markers/semantic", "markers/cluster", "markers/meta"],
      "schema": "marker"
    },
    "schemas": {
      "prefixes": ["SCH_", "MASTER_SCH_"],
      "extensions": [".json"],
      "folders": ["schemata"],
      "schema": "schema"
    }
    // ... weitere Dateitypen
  },
  "repair": {
    "autoFixTypos": true,
    "autoFixDates": true,
    "autoMigratePrefix": true,
    "normalizePatterns": true,
    "autoFixArrays": true,
    "autoFixDefaults": true,
    "autoFixRiskThresholds": true,
    "autoFixWindowDefaults": true
  }
}
```

## 🔌 **Plugin-System**

Das Plugin-System unterstützt:
- **Hook-System**: beforeValidation, afterValidation, beforeRepair, afterRepair
- **Dateityp-spezifische Plugins**: Für jeden Dateityp eigene Plugins
- **Auto-Loading**: Plugins werden automatisch geladen

### **Mitgelieferte Plugins**
1. **Kimi Suggest Plugin**: Schlägt automatisch Tags basierend auf Marker-Inhalt vor
2. **Timestamp Plugin**: Fügt Verarbeitungs-Zeitstempel zu Markern hinzu

## 📋 **Validierungsregeln**

### **Marker-Dateien (A_, S_, C_, MM_)**
- ✅ **Pflichtfelder**: id, marker, description, level, version, status, author, created, last_modified, tags, category
- ✅ **ID-Format**: Muss Präfix entsprechend Level haben (A_, S_, C_, MM_)
- ✅ **Beschreibung**: Mindestens 10 Zeichen
- ✅ **Beispiele**: Mindestens 2 Beispiele pro Marker
- ✅ **Tags**: Mindestens 1 Tag

### **Schema-Dateien (SCH_, MASTER_SCH_)**
- ✅ **Pflichtfelder**: id, weights, window
- ✅ **Risk-Thresholds**: green, yellow, red Werte
- ✅ **Window-Konfiguration**: messages oder seconds

### **Detect-Dateien (DETECT_)**
- ✅ **Pflichtfelder**: id, rule, fire_marker
- ✅ **Rule-Typ**: regex, stddev, frequency, trend_delta, etc.
- ✅ **Fire-Marker**: Muss gültige Marker-ID referenzieren

### **Chunk-Analysis-Dateien (CHA_)**
- ✅ **Pflichtfelder**: id, description, detectors_active, high_level_snapshot, drift_axes, outputs
- ✅ **Detectors**: Muss gültige DETECT_-IDs referenzieren
- ✅ **Snapshot-Konfiguration**: include_levels, top_k

## 🎯 **Auto-Fix-Beispiele**

### **Typo-Korrektur**
```yaml
# Vorher
desciption: "Test description"
weghts: { "A_": 1.0 }

# Nachher (Auto-Fix)
description: "Test description"
weights: { "A_": 1.0 }
```

### **Präfix-Migration**
```yaml
# Vorher
id: "TEST_MARKER"
level: 2

# Nachher (Auto-Fix)
id: "S_TEST_MARKER"
level: 2
x_migrated_from: "TEST_MARKER"
x_migration_ts: "2024-01-01T00:00:00Z"
```

### **Array-Normalisierung**
```yaml
# Vorher
pattern: "test pattern"
tags: "test, tag"

# Nachher (Auto-Fix)
pattern: ["test pattern"]
tags: ["test", "tag"]
```

### **Default-Werte**
```yaml
# Vorher
id: "A_TEST"
description: "Test marker"

# Nachher (Auto-Fix)
id: "A_TEST"
description: "Test marker"
status: "draft"
risk_score: 1
author: "auto_import"
created: "2024-01-01T00:00:00Z"
last_modified: "2024-01-01T00:00:00Z"
```

## 🚨 **Nicht-Auto-Fixbare Fehler**

Diese Fehler werden nur gemeldet, nie automatisch repariert:

### **Inhaltliche Fehler**
```yaml
# ❌ Falsche Pattern-Logik
pattern: ["invalid regex [unclosed"]

# ❌ Inkonsistente Referenzen
composed_of:
  - marker_ids: ["NONEXISTENT_MARKER"]
```

### **Fehlende Pflichtfelder**
```yaml
# ❌ Keine Beschreibung
id: "A_TEST"
# description: fehlt komplett

# ❌ Keine Pattern
id: "A_TEST"
description: "Test"
# pattern: fehlt komplett
```

### **Datentyp-Fehler**
```yaml
# ❌ Falscher Datentyp
scoring: "invalid string instead of object"
```

## 📊 **Reporting**

Das Tool generiert detaillierte Berichte:

```bash
# Validierung mit Zusammenfassung
node packages/cli/bin/cli.js validate-all

# Ausgabe:
# SCHEMAS: 5 valid, 2 invalid
# MARKERS: 12 valid, 1 invalid
# DETECTS: 3 valid, 0 invalid
# Overall: 20 valid, 3 invalid
```

## 🔧 **Entwicklung**

### **Neue Dateitypen hinzufügen**
1. Schema in `schemas/` erstellen
2. Konfiguration in `config/marker-tool.default.json` erweitern
3. Repair-Logik in `packages/cli/src/repair.js` implementieren
4. Tests erstellen

### **Neue Auto-Fix-Regeln**
1. Regel in `packages/cli/src/repair.js` implementieren
2. Konfiguration erweitern
3. Tests erstellen

## 📝 **Changelog**

### **v2.0.0** - Multi-Dateityp-Unterstützung
- ✅ **Neue Dateitypen**: Schema, Detect, Chunk-Analysis, Score, Profiler, Grabber
- ✅ **Intelligente Erkennung**: Automatische Dateityp-Erkennung
- ✅ **Erweiterte Auto-Fix**: Dateityp-spezifische Reparatur-Regeln
- ✅ **Neue CLI-Befehle**: detect, validate-all, repair-all
- ✅ **Verbesserte Validierung**: Referenz-Validierung, Struktur-Validierung
- ✅ **Detaillierte Berichte**: Gruppierte Ergebnisse nach Dateityp

### **v1.0.0** - Grundfunktionen
- ✅ **Marker-Validierung**: YAML/JSON Marker-Dateien
- ✅ **Konvertierung**: YAML ↔ JSON
- ✅ **Auto-Reparatur**: Typo-Korrektur, Präfix-Migration
- ✅ **Web-GUI**: Drag & Drop Interface
- ✅ **Plugin-System**: Erweiterbare Architektur

## 🤝 **Beitragen**

1. Fork erstellen
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## 📄 **Lizenz**

ISC License - siehe [LICENSE](LICENSE) Datei für Details.

---

**Entwickelt mit ❤️ für die Marker-Engine Community** 