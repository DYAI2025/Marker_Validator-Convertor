# Marker Validator & Converter Tool

Ein Desktop/Web-Tool zum Validieren, Konvertieren und Reparieren von YAML- und JSON-Marker-Dateien.

## 🎯 Ziel

Dieses Tool ermöglicht es, Marker-Dateien (≤ 100 pro Batch) einzulesen, automatisch zwischen YAML und JSON zu konvertieren, gegen ein definiertes Schema zu validieren und bei Bedarf zu reparieren.

## 📋 Features

- **Multi-Import**: Drag-and-Drop oder Dateidialog für gemischte YAML/JSON-Uploads
- **Bidirektionale Konvertierung**: YAML ⇌ JSON mit Erhaltung der Reihenfolge
- **Schema-Validierung**: Prüfung gegen `marker.schema.v2.json` mit Präfix-Regex
- **Auto-Repair**: Automatische Migration fehlender Präfixe und Normalisierung
- **Interaktive Reparatur**: Vorschau und selektive Anwendung von Fixes
- **Schema Hot-Swap**: Dynamisches Wechseln zwischen verschiedenen Schemas
- **Konfigurations-Management**: Persistente Einstellungen pro Benutzer
- **Plugin-System**: Erweiterbar durch JavaScript-Plugins
- **Dual-Export**: Ausgabe sowohl als YAML als auch JSON
- **GUI & CLI**: Sowohl grafische Oberfläche als auch Kommandozeilen-Tool

## 🏗️ Projekt-Struktur

```
Marker_validator_convert/
├── packages/
│   ├── cli/                 # CLI-Tool
│   │   ├── bin/            # Ausführbare Dateien
│   │   └── src/            # Source Code
│   └── gui/                # Electron/React GUI
│       ├── electron/       # Electron Main-Prozess
│       ├── src/           # React-App
│       └── public/        # Statische Assets
├── schemas/                # JSON-Schema Definitionen
│   ├── marker.schema.v2.json
│   └── fraud-markers.schema.json
├── templates/              # Marker-Templates
│   ├── ATOMIC.yaml
│   ├── SEMANTIC.yaml
│   ├── CLUSTER.yaml
│   └── META.yaml
├── examples/               # Beispiel-Dateien
│   ├── good/              # Valide Beispiele
│   └── bad/               # Fehlerhafte Beispiele
├── config/                # Konfigurationsdateien
├── plugins/               # Plugin-Verzeichnis
│   ├── kimi-suggest-plugin.js
│   └── timestamp-plugin.js
└── pnpm-workspace.yaml    # Monorepo-Konfiguration
```

## 🚀 Installation

```bash
# Repository klonen
git clone https://github.com/DYAI2025/Marker_Validator-Convertor.git
cd Marker_Validator-Convertor

# Dependencies installieren
pnpm install

# CLI global verfügbar machen (optional)
cd packages/cli
pnpm link --global
```

## 🖥️ GUI-Nutzung

### GUI starten

```bash
# Einfachste Methode - verwende das Start-Script
./start_gui.command

# Oder manuell
cd packages/gui
pnpm start
```

### GUI-Features

- **Drag & Drop**: Ziehe Marker-Dateien direkt in die Drop-Zone
- **Datei-Browser**: Klicke "Browse Files" um Dateien auszuwählen
- **Command-Auswahl**: Wähle zwischen Convert, Validate und Repair
- **Schema-Auswahl**: Wechsle dynamisch zwischen verfügbaren Schemas
- **Batch-Verarbeitung**: Verarbeite bis zu 100 Dateien gleichzeitig
- **Echtzeit-Status**: Siehe den Status jeder Datei während der Verarbeitung
- **Ergebnis-Tabelle**: Übersichtliche Darstellung aller Ergebnisse
- **Settings-Dialog**: Konfiguriere alle Aspekte des Tools

#### Interaktiver Reparatur-Modus

Bei der Auswahl des "Repair" Commands kannst du den **Interactive Mode** aktivieren:

1. **Repair-Preview**: Zeigt alle gefundenen Probleme vor der Anwendung
2. **Selektive Fixes**: Wähle individuell, welche Reparaturen angewendet werden sollen
3. **Diff-Ansicht**: Side-by-Side Vergleich von Original und reparierter Version
4. **Syntax-Highlighting**: YAML-Code wird farblich hervorgehoben
5. **Fix-Kategorien**: Visuelle Gruppierung nach Typ (Typos, Präfixe, Defaults, etc.)

#### Settings & Konfiguration

Über das ⚙️ Symbol im Header gelangst du zu den Einstellungen:

**General Tab:**
- Output-Verzeichnisse für JSON/YAML/Backups konfigurieren
- Batch-Größe und Verarbeitungsoptionen
- Backup-Erstellung ein/ausschalten

**Schemas Tab:**
- Verfügbare Schemas anzeigen
- Custom Schemas hinzufügen
- Schema-Validierung beim Import

**Repair Tab:**
- Auto-Fix Optionen einzeln steuern
- Fallback-Autor definieren
- Migration-Metadaten konfigurieren

**Export Tab:**
- Pretty-Print Optionen
- Indent-Einstellungen für YAML/JSON
- Key-Sortierung

**Plugins Tab:**
- Plugin-System aktivieren/deaktivieren
- Verfügbare Plugins verwalten
- Plugin-Verzeichnis konfigurieren

Alle Einstellungen werden automatisch gespeichert und beim nächsten Start wiederhergestellt.

### GUI bauen

```bash
# Für Produktion bauen
cd packages/gui
pnpm run dist

# Die gebaute App findest du in packages/gui/dist/
```

## 💻 CLI-Nutzung

```bash
# Hilfe anzeigen
marker-convert --help

# Dateien konvertieren und validieren
marker-convert convert examples/good/*.yaml -o output/

# Nur validieren (ohne Konvertierung)
marker-convert validate examples/good/*.yaml

# Dateien reparieren
marker-convert repair examples/bad/*.yaml -o output/repaired

# Mit spezifischem Schema
marker-convert convert file.yaml --schema fraud

# Mit custom Config
marker-convert convert file.yaml -c ./my-config.json

# Konfiguration anzeigen
marker-convert info
```

### CLI-Befehle

#### `convert` - Dateien konvertieren
```bash
marker-convert convert <files...> [options]
```
Optionen:
- `-o, --output <dir>`: Ausgabeverzeichnis (Standard: `out`)
- `-s, --schema <type>`: Schema-Typ (default|fraud|custom)
- `-c, --config <path>`: Pfad zur Konfigurationsdatei
- `--dry-run`: Zeigt was getan würde, ohne es auszuführen
- `--no-repair`: Auto-Repair deaktivieren
- `--no-backup`: Backup-Erstellung deaktivieren

#### `validate` - Dateien validieren
```bash
marker-convert validate <files...> [options]
```
Optionen:
- `-s, --schema <type>`: Schema-Typ (default|fraud|custom)
- `-c, --config <path>`: Pfad zur Konfigurationsdatei
- `--strict`: Strenge Validierung aktivieren
- `--repair`: Vor Validierung reparieren

#### `repair` - Dateien reparieren
```bash
marker-convert repair <files...> [options]
```
Optionen:
- `-o, --output <dir>`: Ausgabeverzeichnis (Standard: `out/repaired`)
- `-c, --config <path>`: Pfad zur Konfigurationsdatei
- `--dry-run`: Zeigt was repariert würde
- `--no-backup`: Backup-Erstellung deaktivieren

### Globale Optionen

- `-c, --config <path>`: Pfad zur Konfigurationsdatei
- `-v, --verbose`: Ausführliche Ausgabe
- `--no-color`: Farbige Ausgabe deaktivieren

## 🔧 Auto-Repair Funktionen

Die Repair-Engine kann folgende Probleme automatisch beheben:

### Feldnamen-Korrekturen
- `beschreibung` → `description`
- `beispiele` → `examples`
- `risk` → `risk_score`
- Weitere deutsche/falsche Feldnamen

### Standardwerte
- `version`: "1.0.0"
- `status`: "draft"
- `author`: "auto_import"
- `created`: Aktueller Zeitstempel
- `last_modified`: Gleich wie `created`

### Normalisierungen
- **Datums-Format**: Konvertiert verschiedene Formate zu ISO 8601
- **Pattern-Feld**: String → Array
- **Tags**: String (kommagetrennt) → Array
- **Examples**: Einzelwert → Array

### Präfix-Migration
Automatische Korrektur der ID-Präfixe basierend auf Level:
- Level 1 → `A_` (Atomic)
- Level 2 → `S_` (Semantic)
- Level 3 → `C_` (Cluster)
- Level 4 → `MM_` (Meta)

Bei Migration werden Metadaten hinzugefügt:
- `x_migrated_from`: Original-ID
- `x_migration_ts`: Zeitstempel der Migration

## 📐 Schema-Definition

### Marker Schema v2.0

Das Haupt-Schema (`marker.schema.v2.json`) definiert:

- **Pflichtfelder**: `id`, `marker`, `description`, `level`, `version`, `status`
- **ID-Format**: Präfix-Regex `^(A|S|C|MM)_[A-Z0-9_]+$`
- **Level-Mapping**:
  - Level 1 → Präfix `A_` (Atomic)
  - Level 2 → Präfix `S_` (Semantic)
  - Level 3 → Präfix `C_` (Cluster)
  - Level 4 → Präfix `MM_` (Meta)

### Fraud Markers Schema

Erweitert das Basis-Schema um:
- Pflicht-Tags aus: `fraud`, `manipulation`, `deception`, `risk`, `warning`
- Minimaler Risk-Score: 3
- Zusätzliches Feld: `fraud_indicators`

### Custom Schemas

Du kannst eigene Schemas hinzufügen:
1. Öffne Settings → Schemas Tab
2. Klicke "Add Custom Schema"
3. Wähle eine JSON-Schema Datei
4. Gib einen eindeutigen Namen ein

Custom Schemas müssen kompatibel mit dem Marker v2.0 Format sein.

## 🔧 Konfiguration

Die Konfiguration erfolgt über `marker-tool.config.json`:

```json
{
  "schemas": {
    "default": "schemas/marker.schema.v2.json",
    "fraud": "schemas/fraud-markers.schema.json"
  },
  "outputDirs": {
    "json": "out/json",
    "yaml": "out/yaml",
    "backup": "backup"
  },
  "processing": {
    "maxBatchSize": 100,
    "autoRepair": true,
    "createBackups": true,
    "preserveOriginalOrder": true
  },
  "repair": {
    "autoFixTypos": true,
    "autoFixDates": true,
    "autoMigratePrefix": true,
    "normalizePatterns": true,
    "fallbackAuthor": "auto_import",
    "addMigrationMetadata": true
  },
  "validation": {
    "strictMode": false,
    "reportLevel": "error",
    "allowAdditionalProperties": true
  },
  "export": {
    "prettyPrint": true,
    "yamlIndent": 2,
    "jsonIndent": 2,
    "sortKeys": false
  },
  "plugins": {
    "enabled": true,
    "directory": "../plugins",
    "autoLoad": ["kimi-suggest-plugin.js", "timestamp-plugin.js"]
  }
}
```

Die GUI speichert Änderungen automatisch in `~/Library/Application Support/Marker Validator/marker-tool.config.json`.

## 🔌 Plugin-System

Plugins können in den Verarbeitungsprozess eingreifen:

```javascript
import { MarkerPlugin } from '../packages/cli/src/plugin-api.js';

export default class MyPlugin extends MarkerPlugin {
  constructor() {
    super();
    this.name = 'my-plugin';
    this.version = '1.0.0';
    this.description = 'My custom plugin';
  }
  
  async init(context) {
    context.log('Plugin initialized');
  }
  
  async beforeValidation(marker, context) {
    // Modify marker before validation
    return marker;
  }
  
  async afterValidation(marker, result, context) {
    // React to validation results
  }
  
  async beforeRepair(marker, context) {
    // Modify marker before repair
    return marker;
  }
  
  async afterRepair(marker, repairedMarker, fixes, context) {
    // React to repair results
  }
  
  async beforeConversion(marker, targetFormat, context) {
    // Modify marker before conversion
    return marker;
  }
  
  async afterConversion(marker, output, format, context) {
    // Modify output after conversion
    return output;
  }
  
  async afterBatch(results, context) {
    // Process batch results
  }
  
  async cleanup(context) {
    // Clean up resources
  }
}
```

### Mitgelieferte Plugins

1. **Kimi Suggest Plugin**: Schlägt automatisch Tags basierend auf Marker-Inhalt vor
2. **Timestamp Plugin**: Fügt Verarbeitungs-Zeitstempel zu Markern hinzu

## 🔄 Entwicklungs-Roadmap

### ✅ Iteration 1: Schema-Definition & Grundstruktur
- [x] Projekt-Setup mit pnpm workspaces
- [x] Schema-Dateien erstellt
- [x] Templates und Beispiele
- [x] CLI-Grundgerüst

### ✅ Iteration 2: Minimal-CLI-Converter
- [x] YAML/JSON Parser implementieren
- [x] Schema-Validierung mit AJV
- [x] Batch-Verarbeitung
- [x] Dual-Export Funktionalität

### ✅ Iteration 3: Repair-Engine
- [x] Präfix-Migration (`level` → Prefix)
- [x] Pattern-Normalisierung
- [x] Migration-Metadaten
- [x] Backup-Erstellung
- [x] Tippfehler-Korrektur
- [x] Datums-Normalisierung
- [x] CLI-Integration

### ✅ Iteration 4: GUI-Shell
- [x] Electron-Setup
- [x] React-Frontend
- [x] Drag-and-Drop Zone
- [x] Ergebnis-Tabelle
- [x] CLI-Integration als Child-Process
- [x] Start-Scripts

### ✅ Iteration 5: Interaktive Reparatur & Diff-Vorschau
- [x] Visual Diff (Before/After) für jede Datei
- [x] Checkbox-System für selektive Fixes
- [x] Syntax-Highlighting für YAML/JSON
- [x] Repair-Preview Modal
- [x] Interactive Mode Toggle
- [x] Fix-Kategorisierung mit Icons

### ✅ Iteration 6: Settings & Schema-Hot-Swap
- [x] Settings-Dialog mit Tabs
- [x] Schema-Verwaltung und Hot-Swap
- [x] Pfad-Konfiguration (Output/Backup)
- [x] Persistente Benutzer-Einstellungen
- [x] Custom Schema Import
- [x] Schema-Validierung

### ✅ Iteration 7: Plugin-System
- [x] Plugin-API Definition
- [x] Plugin-Loader Implementierung
- [x] Hook-System in allen Modulen
- [x] Beispiel-Plugins (Kimi Suggest, Timestamp)
- [x] Plugin-Verwaltung in GUI
- [x] Plugin-Konfiguration

## 📝 Lizenz

ISC

## 👤 Autor

Benjamin Poersch

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you! 