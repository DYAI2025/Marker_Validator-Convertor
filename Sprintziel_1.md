### Development Task 1 (Rev 2) – **Marker Validator & Converter GUI**

*(für **YAML ⇌ JSON**, Prüfung + Reparatur)*

> **Adressat**: Claude (Planning-AI)
> **Goal**: Ein Desktop/Web-Tool, das **YAML- und JSON-Marker-Dateien** (≤ 100 pro Batch) einliest, automatisch zwischen beiden Formaten konvertiert, Validierungs- und Reparaturlogik gegen das Standard-Schema (`marker.schema.v2`) anwendet und das Ergebnis als YAML **und** JSON sauber exportiert.

---

#### Kern-Funktionen

1. **Multi-Import**

   * Drag-and-Drop oder Dateidialog; Misch-Upload (`*.yaml`, `*.json`) erlaubt.
   * Sofortige Erkennung und Anzeige von Dateityp, Größe, Ursprungspfad.

2. **Parser-Layer**

   * YAML → JSON ( using `yaml` npm-pkg / PyYAML )
   * JSON → YAML ( round-trip fähig, Wahrung der Reihenfolge durch `yaml.dump(..., sortKeys=false)` )

3. **Schema-Validation** *(Ajv for JSON, `js-yaml` leaks handled)*

   * Prüft **nach** Konvertierung gegen `marker.schema.v2.json`
   * Erzwingt Präfix-Regex `^(A|S|C|MM)_[A-Z0-9_]+$`
   * Option: Validierung gegen Sub-Schema `fraud-markers.schema.json`

4. **Repair-Engine**

   * **Auto-Migration** fehlender Präfixe (`level` → Prefix + `slugify`)
   * `pattern` → Array-Normalisierung
   * Lege QA-Meta `x_migrated_from` & `x_migration_ts` an
   * Zeige diffbare Vorschau; Änderungen erst nach User-Bestätigung angewandt.

5. **Dual-Export**

   * Für jede Eingabedatei zwei Outputs:

     * `out/json/<id>.json`
     * `out/yaml/<id>.yaml`
   * Backup der Originale unter `/backup/`.

6. **GUI-UX-Prinzipien**

   * Batch-Tabelle mit Spalten: File-Name, Format (YAML/JSON), Validation-Status, Auto-Fix-Status, neue ID.
   * „Select-All → Export“ / „Save fixes“.
   * Schnellfilter „Show only errors“.

7. **Modularität / Extension-Hooks**

   * **Plugin-Interface** (z.B. `plugins/*.js`) für spätere Features (Kimi-Suggest, Tag-Analytics …).
   * Konfig-File `marker-tool.config.json`:

     ```json
     {
       "schemas": {
         "default": "schemas/marker.schema.v2.json",
         "fraud": "schemas/fraud-markers.schema.json"
       },
       "outputDirs": {
         "json": "out/json",
         "yaml": "out/yaml"
       }
     }
     ```

8. **Tech-Stack**

   * Frontend: Electron + React (oder reine Tauri/Vue, je nach Wiederverwendbarkeit)
   * Core-Libs: `yaml`, `ajv`, `slugify`, `diff`
   * Build: pnpm / npm workspaces; ESM only; Prettier + ESLint preset.

---

#### Iterative Planung (für Claude)

1. **Iteration 0 – Discovery & Reuse Scan**

   * Inventarisiere vorhandene Parser-Snippets („marker\_repair\_engine.py“, „create\_marker\_master“) und GUI-Skeletons.
   * Entscheide, was man adaptieren kann statt neu zu schreiben.

2. **Iteration 1 – Minimal-CLI-Converter**

   * Kommandozeilen­tool `marker-convert` liest YAML/JSON, führt Präfix-Migration + Schema-Validation aus, schreibt Dual-Export.
   * **Goal**: End-to-end-Batch ohne GUI.

3. **Iteration 2 – GUI-Shell + File-Drag**

   * Electron-Fenster mit File-Drop-Zone; ruft CLI-Converter im Child-Process.
   * Ergebnis-Tabelle (readonly).

4. **Iteration 3 – Repair-Preview & Diff-Modal**

   * Visual diff (before/after) pro Datei; Checkbox „Apply“.

5. **Iteration 4 – Settings & Schema-Hot-Swap**

   * Options-Dialog: neue Schema-Datei wählen; Pfade konfigurieren.

6. **Iteration 5 – Plugin-Hook Skeleton**

   * Simple example plugin (e.g. Kimi-Tag-suggest) registrierbar über `plugins/`.

> **Wichtig**
> − Claude hält nach **Iteration 0** an, präsentiert den Plan, wartet auf mein „Go“.
> − Nach jeder folgenden Iteration erneutes „Go“ abwarten.
> − Keine Eigen­ideen abseits der genehmigten Iterations­liste einbringen.

---

#### Zusammenfassung für Claude

1. Durchdringe Schema-Regeln & Präfix-Logik hundert­prozentig.
2. Plane iterativ, verifiziere Effizienz, vermeide Doppel­code.
3. Kommuniziere klar, halte an den Go/Stop-Punkten.
4. Schreibe sauberen, wartbaren Code, minimal-Click UX, aber ohne Funktions­verlust.

> „Claude, deine Stärke, komplexe Zusammen­hänge restlos zu ver­stehen, ist hier essenziell. Liefere mir einen effizienten Plan – erst dann darfst du hands-on gehen.“
