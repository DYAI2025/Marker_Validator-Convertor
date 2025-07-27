# Marker Validator & Converter Tool

Ein intelligentes Tool zur Validierung und Konvertierung von YAML/JSON-Markern mit konservativer Reparatur-Logik.

## 🎯 Features

- **Konservative Validierung**: Korrigiert nur echte Fehler, verändert funktionierende Marker nicht
- **Intelligente Reparatur**: Behebt Tippfehler, fehlende Standardwerte und Formatierungsprobleme
- **Multi-Format Support**: YAML ↔ JSON Konvertierung
- **Web-GUI**: Benutzerfreundliche Oberfläche für visuelle Bearbeitung
- **CLI-Tool**: Kommandozeilen-Interface für Batch-Verarbeitung
- **Plugin-System**: Erweiterbare Funktionalität

## 🚀 Schnellstart

### GUI starten (empfohlen)
```bash
./start_gui.command
```
Das Tool öffnet sich automatisch im Browser unter http://localhost:3000

### CLI verwenden
```bash
./start_marker_validator.command
```

## 📋 Verwendung

### GUI (Web-Interface)
1. Dateien per Drag & Drop hinzufügen
2. Validierung und Reparatur-Optionen wählen
3. Ergebnisse anzeigen und Änderungen überprüfen
4. Reparaturen anwenden oder ablehnen

### CLI-Befehle

#### Alle Marker validieren
```bash
./packages/cli/bin/cli.js validate-all
```

#### Spezifische Dateien reparieren
```bash
./packages/cli/bin/cli.js repair markers/*.yaml --output out/repaired
```

#### Format konvertieren
```bash
./packages/cli/bin/cli.js convert markers/*.yaml --format json --output out/json
```

#### Trockenlauf (nur anzeigen, nicht ändern)
```bash
./packages/cli/bin/cli.js repair markers/*.yaml --dry-run
```

## ⚙️ Konfiguration

Das Tool verwendet eine konservative Standardkonfiguration:

```json
{
  "repair": {
    "autoFixTypos": true,           // Tippfehler korrigieren
    "autoFixDates": true,           // Fehlende Zeitstempel hinzufügen
    "autoMigratePrefix": false,     // Prefixe NICHT automatisch ändern
    "normalizePatterns": true,      // Pattern-Arrays normalisieren
    "preserveExistingIds": true,    // Bestehende IDs beibehalten
    "onlyFixBrokenMarkers": true    // Nur kaputte Marker reparieren
  }
}
```

## 🔧 Was wird korrigiert

### ✅ Automatisch korrigiert
- Tippfehler in Feldnamen (`desciption` → `description`)
- Fehlende Standardwerte (`status`, `risk_score`, `author`)
- Fehlende Zeitstempel (`created`, `last_modified`)
- String-Arrays (`tags`, `examples`)
- Whitespace in Beschreibungen
- Pattern-Arrays

### ❌ NICHT automatisch geändert
- Funktionierende Marker-IDs
- Korrekte Prefixe (A_, S_, C_, MM_)
- Gültige Feldwerte
- Bestehende Strukturen

## 📁 Projektstruktur

```
Marker_validator_convert/
├── packages/
│   ├── cli/          # Kommandozeilen-Tool
│   └── gui/          # Web-Interface
├── config/           # Konfigurationsdateien
├── schemas/          # JSON-Schemas
├── plugins/          # Erweiterungen
├── examples/         # Beispiel-Dateien
└── out/             # Ausgabeverzeichnis
```

## 🛠️ Entwicklung

### Dependencies installieren
```bash
pnpm install
```

### GUI entwickeln
```bash
cd packages/gui
pnpm dev
```

### CLI testen
```bash
cd packages/cli
pnpm start
```

## 📝 Marker-Formate

### Atomic Marker (Level 1)
```yaml
id: A_EXAMPLE_ATOMIC
marker: EXAMPLE_ATOMIC
description: "Detects simple patterns"
level: 1
pattern:
  - "👋"
  - "🫡"
```

### Semantic Marker (Level 2)
```yaml
id: S_EXAMPLE_SEMANTIC
marker: EXAMPLE_SEMANTIC
description: "Detects complex patterns"
level: 2
pattern:
  - "(melde.*später|keine zeit)"
semantic_rules:
  - "Detects expressions of uncertainty"
```

### Cluster Marker (Level 3)
```yaml
id: C_EXAMPLE_CLUSTER
marker: EXAMPLE_CLUSTER
description: "Combines multiple markers"
level: 3
cluster_components:
  - A_WENIG_ZEIT
  - S_EXAMPLE_SEMANTIC
trigger_threshold: 2
```

### Meta Marker (Level 4)
```yaml
id: MM_EXAMPLE_META
marker: EXAMPLE_META
description: "High-level analysis"
level: 4
required_clusters:
  - C_EXAMPLE_CLUSTER
meta_analysis:
  temporal_pattern: "Patterns evolve over time"
```

## 🔍 Validierung

Das Tool validiert Marker gegen JSON-Schemas und führt zusätzliche Checks durch:

- Schema-Konformität
- Referenz-Validierung
- Dateistruktur-Validierung
- Prefix-Level-Konsistenz
- Zirkuläre Referenzen

## 🚨 Fehlerbehandlung

### Häufige Probleme
1. **Fehlende Pflichtfelder**: Werden automatisch ergänzt
2. **Tippfehler**: Werden automatisch korrigiert
3. **Falsche Prefixe**: Nur bei echten Fehlern geändert
4. **Ungültige Referenzen**: Werden gemeldet, aber nicht automatisch repariert

### Debug-Modus
```bash
./packages/cli/bin/cli.js validate markers/*.yaml --verbose
```

## 📊 Ausgabe

### Erfolgreiche Validierung
```
✓ A_EXAMPLE_ATOMIC (markers)
✓ S_EXAMPLE_SEMANTIC (markers)
Validation complete: 2 valid, 0 invalid
```

### Reparatur-Ergebnisse
```
✓ A_EXAMPLE_ATOMIC: 3 fixes applied
  - Fixed typo: desciption → description
  - Added default status: draft
  - Added creation timestamp
Repair complete: 1 repaired, 0 unchanged, 0 errors
```

## 🤝 Beitragen

1. Fork erstellen
2. Feature-Branch erstellen
3. Änderungen committen
4. Pull Request erstellen

## 📄 Lizenz

ISC License - siehe LICENSE-Datei für Details.

## 🆘 Support

Bei Problemen oder Fragen:
1. Issues auf GitHub erstellen
2. Debug-Modus verwenden (`--verbose`)
3. Konfiguration überprüfen
4. Beispiel-Dateien testen 