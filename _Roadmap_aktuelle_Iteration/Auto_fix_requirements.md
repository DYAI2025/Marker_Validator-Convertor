Hier die Liste der typischen "einfachen Fehler", die dein Tool automatisch, ohne explizite Warnung, zuverlässig ausbessern kann – fileformat- und markerklassenübergreifend.
Diese Fehler sind „trivial“ genug, dass sie immer auto-korrigiert werden können, ohne dass Folgeprobleme zu erwarten sind.

Auto-fixbare, "einfache" Fehler (pro Dateityp):
1. Marker-Dateien (A_/S_/C_/MM_, YAML/JSON)
Prefix-Korrektur:

Falsches oder fehlendes Präfix (A_, S_, C_, MM_) im id/Dateinamen → automatisch gesetzt/ergänzt.

Pattern-Feld:

Pattern als String statt Array → wandelt automatisch zu Array um.

Leere Pattern-Felder (pattern: "") → entfernt/zu pattern: [].

Beispiele:

examples als einzelner String → automatisch zu Array.

Tags:

tags als String → zu Array.

Datum:

Fehlendes oder nicht-ISO-formatiertes created oder last_modified → setzt aktuelles Datum im ISO-Format.

Kleinschreibung:

marker, category, tags etc. → wandelt zu UPPERCASE/CamelCase, wie im Schema gefordert.

Default-Werte:

Fehlende Felder wie scoring.weight, status → setzt Default (1.0 bzw. "draft").

Whitespace-Trim:

Trimmt Whitespaces an Strings in description, examples, pattern.

Pattern-Deduplikation:

Doppelte Pattern in der Liste → entfernt Duplikate.

ID–Dateiname-Sync:

Korrigiert Dateiname, wenn er nicht mit dem id-Feld übereinstimmt (optional, oder meldet es nur).

2. Schemata (SCH_/MASTER_SCH_, JSON)
Präfix-Sync:

Fügt fehlendes SCH_/MASTER_SCH_ an id an.

Risk-Thresholds:

Fehlende risk_levels (green/yellow/red) → trägt Defaults ein.

window, decay:

Fehlende Fenstergrößen → Default setzen (z. B. 5/10 Messages).

Mappings:

Alle Marker-IDs in weights als String-Array, nicht als Komma-getrennter String.

3. Detektoren (DETECT_, JSON)
Präfix/ID:

id mit fehlendem/falschem Prefix → auto-korrigiert.

Array-Felder:

Pattern/Rules als String → wandelt zu Array.

Datei-Referenzen:

Korrigiert slashes/backslashes in file_path.

Timestamps:

Fehlendes last_updated → trägt aktuelles Datum ein.

4. Chunk-Analyse (CHA_, YAML)
ID-Präfix:

Automatisch ergänzen.

Detectors_active:

Einzel-String → zu Array.

Snapshot-Felder:

Fehlende werden mit leeren Listen belegt.

5. Scores, Calculate, Profiler (SCR_, CAL_, PROF_, YAML/JSON/PY)
ID-Präfix:

Automatisch ergänzen.

Window/Aggregation:

Fehlende Werte durch Defaults ersetzen.

Array-Korrektur:

Einzelelemente als Array speichern.

6. Plugins, Grabber (GR_)
ID-Präfix:

Ergänzt.

Description:

Fehlend → setzt Platzhaltertext.

Array/String-Autokorrektur:

Wie bei Marker/Detect.

7. Tests & Beispiele
Dateinamen-Sync:

Benennt Beispieldateien konsistent um.

Array-Korrektur:

Einzelne Beispiele zu Array.

Whitespace, Deduplikation:

Wie bei Markern.

Typische "Nicht-autofixbare" Fehler (nur melden, nie ungefragt ändern):
Inhaltliche Fehler (falsche Pattern, Logik, inkonsistente composed_of-Referenzen)

Feld fehlt vollständig (z. B. keine description, kein pattern)

Falscher Datentyp, der Bedeutung verändert (z. B. scoring: string statt object)

Zyklische oder ungültige Verweise (id verweist auf sich selbst oder nicht existente Marker)

