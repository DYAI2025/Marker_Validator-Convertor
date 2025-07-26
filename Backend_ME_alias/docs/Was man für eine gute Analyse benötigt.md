Checkliste: Was benötigt ein gutes Analyse-Konzept?
1️⃣ Spezielle Marker
Ordner: markers/atomic/, markers/semantic/, markers/cluster/, markers/meta/

Was?
Du brauchst eigene Marker, die typische Sprache, Codes oder Muster für dein Analysefeld erfassen.

Atomic Marker: Erfassen einfache Sprachbausteine (z. B. Geldforderung, Affekt-Ausdrücke)

Semantic Marker: Gruppieren Atomics zu „semantischen“ Mustern (z. B. Love Bombing)

Cluster Marker: Fassen mehrere Muster zu einem Komplex zusammen (Manipulationsmuster)

Meta Marker: Deuten ganze Phasen (z. B. Eskalation)

Beispiel Fraud:

A_FRAUD_PAYMENT_REQUEST.yaml

S_LOVE_BOMBING.yaml

C_MANIPULATION_PATTERN.yaml

MM_FRAUD_ESCALATION.yaml

2️⃣ Analyse-Schema (SCH_)
Ordner: schemata/

Was?
Ein passendes Schema-Profil (z. B. SCH_FRAUD.json) legt fest:

Welche Marker wie gewichtet werden (z. B. Cluster besonders stark)

Optional eigene Ampel-Schwellen („red“ bei Fraud niedriger)

Driftachsen (z. B. für Manipulation oder Näheverlust)

Beispiel:

json
Kopieren
Bearbeiten
{
  "id": "SCH_FRAUD",
  "weights": {"A_":1.2, "S_":1.5, "C_":2.0, "MM_":2.0},
  "window": {"messages": 50},
  "decay": 0.01,
  "risk_thresholds": {"green":0,"yellow":5,"red":12}
}
3️⃣ Detektoren (DETECT_)
Ordner: detect/

Was?
Spezielle Regeldefinitionen, die typische Muster in Texten erkennen:

Regex, Trend oder Fenster-Analysen als .json

Ggf. Plugins für komplexe Patterns (plugins/)

Beispiel Fraud:

DETECT_FRAUD_PAYMENT_REGEX.json

DETECT_LOVE_BOMBING.json

DETECT_EMO_VOLATILE.json

4️⃣ Chunk-Analyse-Schema (CHA_)
Ordner: chunk_analysis/

Was?
Regelt, wie Zeitfenster und Driftachsen im Chat segmentiert werden.

Definiert: Welche Teilaspekte, wie viele Nachrichten, welche Achsen?

Unterschiedliche Chunk-Templates je Analysefeld möglich

Beispiel:

CHA_FRAUD_OVERVIEW.yaml
(Betrachtet Fraud-Marker, Manipulations-Cluster, Zeitfenster 20, Drift-Achse „Misstrauen“)

5️⃣ Score-Profile & Referenzwerte (SCR_, CAL_)
Ordner: scores/, calculate/

Was?

Score-Profile: Aggregieren Marker-Treffer (z. B. Summe in 30 Nachrichten)

Calculate/Baseline: Legen normale Werte fest (z. B. „Wie oft kommen Geldforderungen in normalen Chats vor?“)

Beispiel:

SCR_FRAUD_MAIN.json

CAL_FRAUD_BASELINE.py

6️⃣ Master-Schema-Router
Datei: schemata/MASTER_SCH_CORE.json

Was?

Steuert, welches Analyse-Schema aktiv ist (z. B. SCH_FRAUD, SCH_BEZIEHUNG)

Kombiniert Schemata via „Multiplikation“, „Summe“ etc.

Ermöglicht dynamischen Wechsel bei Drifts

7️⃣ Driftachsen & Profiler
Ordner: profiler/, profiler/drift/

Was?

Definiert, wie Veränderungen in der Kommunikation erkannt werden

Unterschiedliche Achsen pro Analysefeld (z. B. bei Familie: „Hierarchie“, bei Fraud: „Vertrauen/Misstrauen“)

Profiler-Module detektieren, wann auffällige Drifts entstehen

8️⃣ Validierungs- & Test-Dateien
Ordner: tests/good/, tests/bad/

Was?

Beispiele für korrekte und fehlerhafte Marker/Analysen

Für automatisierte CI-Prüfung und Sicherheit im Team

Empfohlene Zusatz-Bausteine
Kontext-Templates: Typische Beispielsätze für neue Marker

Semantische Grabber/Plugins: Für feine Erkennung neuer Muster

Dokumentation: Kurze Übersicht je Analysefeld, wie Marker & Scores zu deuten sind

Baseline-Generatoren: Für die Abgrenzung von Normalverhalten und Abweichungen

Beispiel für einen Minimal-Setup im Bereich Fraud-Detection
text
Kopieren
Bearbeiten
/markers/atomic/A_FRAUD_PAYMENT_REQUEST.yaml
/markers/semantic/S_LOVE_BOMBING.yaml
/markers/cluster/C_MANIPULATION_PATTERN.yaml
/markers/meta/MM_FRAUD_ESCALATION.yaml
/schemata/SCH_FRAUD.json
/detect/DETECT_FRAUD_PAYMENT_REGEX.json
/detect/DETECT_LOVE_BOMBING.json
/chunk_analysis/CHA_FRAUD_OVERVIEW.yaml
/scores/SCR_FRAUD_MAIN.json
/profiler/drift/drift_fraud_axes.yaml
/docs/FRAUD_Überblick.md
/tests/good/..., /tests/bad/...
Zusammengefasst
Ein stabiles, robustes Analysefeld im Marker-System braucht:

Eigene Marker (Atomic/Semantic/Cluster/Meta)

Ein spezifisches Schema-Profil

Passende Detektoren

Chunk-Analyse-Regeln

Score-Profile & Baselines

Driftachsen & Profiler

Master-Router und

Validierungsdaten & Doku

Nur so erhältst du nachvollziehbare, wiederverwendbare und CI-fähige Analysen – für neue Themen wie Fraud, Familie, Karriere, etc.

(Diese Datei ist universell auf neue Analysefelder anwendbar – einfach als /docs/ANALYSEFELD_CHECKLISTE.md einbinden.)







ChatGPT fragen
