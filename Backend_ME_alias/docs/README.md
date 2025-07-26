Marker System – README
Grundprinzipien: Markerklassen & Ebenen
Das System analysiert Kommunikation, indem es bedeutungsvolle Muster (sog. Marker) in vier hierarchischen Klassen/Abstraktionsebenen erfasst. Jeder Marker-Typ hat eine klar definierte Rolle und Interaktionslogik.

1. Atomic Marker (A_)
Funktion:
Atomic Marker sind die elementarsten Einheiten im System. Sie erkennen einfache, klar abgrenzbare Muster direkt im Text, z. B. bestimmte Emojis, Schlüsselwörter, Satzmuster oder reguläre Ausdrücke.

Beispiel:

A_FAREWELL_EMOJI.yaml erkennt Emojis wie 👋 oder 💔 am Satzende.

A_APPEAL_TO_AUTHORITY.yaml erkennt Formulierungen wie „Laut Experten…“ oder „Studien zeigen…“.

Technik:

Definiert in YAML, Pflichtfelder: id, level=1, name, description, pattern[], examples[].

Wird von Detect-Regeln (regex etc.) direkt getriggert.

Atomic Marker sind immer „Singular“ – sie bilden die Basis für alle komplexeren Marker.

2. Semantic Marker (S_)
Funktion:
Semantic Marker gruppieren mehrere Atomic Marker oder einfache Regeln zu einem bedeutungsvolleren Muster. Sie beschreiben z. B. Kommunikations- oder Beziehungsmuster, die durch eine Kombination einfacher Elemente entstehen.

Beispiel:

S_EMO_VOLATILE_WINDOW.yaml aggregiert mehrere emotionale Schwankungen (A_ Marker) über ein Nachrichtenfenster.

S_ABSAGE_INDIR.yaml erkennt indirekte Absagen, wenn bestimmte Formulierungen wiederholt auftreten.

Technik:

YAML, Pflichtfelder wie bei A_, aber zusätzlich: composed_of[] (enthält IDs von A_ oder anderen S_), activation_logic.

Aktivierungslogik legt fest, wie die Atomic Marker zum Auslösen kombiniert werden (z. B. Schwellenwert, Zeitfenster, Reihenfolge).

Semantic Marker sind die „Regel-Ebene“ – sie verbinden Basismuster zu logischen Bedeutungsgruppen.

3. Cluster Marker (C_)
Funktion:
Cluster Marker bündeln mehrere Semantic Marker (und ggf. Atomic Marker) zu übergeordneten Beziehungsmustern oder Kommunikationsclustern. Sie bilden die Brücke zwischen einzelnen Signalgruppen und komplexen Dynamiken, etwa Eskalationsmustern oder Ritualverlusten.

Beispiel:

C_EMOTIONAL_WITHDRAWAL.yaml triggert, wenn Marker für Rückzug, Affektverflachung und reduzierte Resonanz gemeinsam auftreten.

C_SEEKING_AFFECTION_RITUALIZED.yaml erkennt Cluster von Bindungssuche über verschiedene Ausdrucksformen.

Technik:

YAML, Pflichtfelder wie bei S_, mit level=3, composed_of[], optional trigger_threshold.

Cluster Marker definieren, wie viele und welche S_/A_ Marker (innerhalb eines Zeitraums) gemeinsam vorliegen müssen, damit ein übergeordnetes Muster ausgelöst wird.

Sie ermöglichen die Erkennung von „Driftzonen“, z. B. Beziehungskrisen, Eskalation oder Annäherung.

4. Meta Marker (MM_)
Funktion:
Meta Marker sind die höchste Abstraktionsebene. Sie detektieren komplexe, oft systemische Kommunikations- oder Beziehungsmuster, die aus mehreren Cluster-Mustern zusammengesetzt sind. Meta Marker spiegeln z. B. die Dynamik einer kompletten Eskalationsphase, einer Patchwork-Kommunikation oder tiefliegende Manipulationsstrategien wider.

Beispiel:

MM_PARADOXAL_CONNECTION_TEST.yaml erkennt, wenn verschiedene Cluster-Marker für Nähe und Rückzug in paradoxen Konstellationen gemeinsam ausgelöst werden.

MM_META_DRIFT.yaml erkennt längere Phasen semantischer Drift, in denen verschiedene Cluster (Distanz, Maskierung, Ironie) systematisch die Beziehungsebene verändern.

Technik:

YAML, Pflichtfelder: id, level=4, required_clusters[], window.

required_clusters[] definiert, welche C_ (und evtl. S_) Marker gemeinsam in einem Zeitraum vorliegen müssen.

Meta Marker agieren auf „Makro“-Ebene: Sie interpretieren die Marker- und Cluster-Historie, fassen sie zu Diagnosen, Alerts oder Relationstrends zusammen.

Zusammenspiel der Marker-Klassen
Atomic Marker liefern rohe Signale.

Semantic Marker gruppieren und interpretieren diese Signale logisch.

Cluster Marker identifizieren verdichtete Muster, die für Beziehungen oder Systeme relevant sind.

Meta Marker ordnen ganze Phasen, Musterketten oder systemische Drifts ein.

Ablauf:

Detect-Runner erkennt im Text primitive Muster → feuert A_ Marker.

Semantic Marker beobachten, ob relevante Kombinationen von A_ vorliegen → feuern S_ Marker.

Cluster Marker aggregieren über Nachrichtenfenster → feuern C_ Marker, sobald bestimmte Schwellen überschritten sind.

Meta Marker beobachten die Verteilung und Historie von C_/S_ Marker → feuern MM_ Marker für umfassende Dynamik- oder Risiko-Alerts.

Vorteil:
Das System bleibt granular, nachvollziehbar und adaptiv – neue Marker lassen sich einfach ergänzen, bestehende Regelwerke präzisieren.

Schema-Profil (Schemata) – SCH_
Funktion:
Ein Schema-Profil (Plural: Schemata, Prefix: SCH_) legt fest, wie Marker gewichtet und interpretiert werden. Es steuert, wie wichtig einzelne Marker oder Gruppen in einer Analyse sind, wie Scores berechnet werden, welche Fenster und Aggregationslogiken gelten und welche Drift- oder Schwellenwerte eingesetzt werden.

Beispiel:

SCH_BEZIEHUNG.json gibt hoher Emotionalitätsdynamik (z. B. C_EMOTIONAL_WITHDRAWAL) einen höheren Score als Smalltalk-Marker.

SCH_FRAUD.json gewichtet Indizien für Täuschung und Manipulation besonders hoch.

Technik:

Format: JSON, im Ordner /schemata/

Pflichtfelder:

id (Schema-Name)

weights (Mapping: Marker-IDs → Scorefaktor)

window (Nachrichtenfenster zur Aggregation, z. B. 10, 20)

decay (optional: Score-Abschwächung über Zeit/Fenster)

Erweiterungen: Schwellenwerte für Cluster/Meta-Trigger, Score-Fusion-Strategie, aktive Driftachsen.

Zusammenspiel:
Schemata werden vom Master-Schema aktiviert oder gewechselt. Sie bestimmen, wie Detektionen in Bewertungen, Alerts oder Reports umgesetzt werden. Mehrere Schemata können parallel (mit Gewichtung) oder sequentiell (per Phase) eingesetzt werden.

Master-Schema (MASTER_SCH_)
Funktion:
Das Master-Schema (Prefix: MASTER_SCH_) ist die zentrale Steuerinstanz für den Schema-Einsatz. Es bestimmt, welche Schemata zu einem Zeitpunkt aktiv sind, wie ihre Scores fusioniert werden und mit welcher Priorität sie in die Analyse einfließen.

Beispiel:

MASTER_SCH_CORE.json legt fest: „Beziehungsschema“ zählt mit Gewicht 0.7, „Fraud“ mit 0.9, „Default“ mit 0.5 – die Scores werden fusioniert.

Das Master-Schema kann bei bestimmten Drifts oder Marker-Clustern das aktive Schema umschalten (z. B. von Smalltalk auf Konfliktanalyse).

Technik:

Format: JSON, im Ordner /schemata/

Pflichtfelder:

id

active_schemata[] (Liste von aktiven SCH_ Profilen)

priority{} (Map: SCH_ → Gewicht [0–1])

fusion (Score-Kombilogik, z. B. „multiply“, „sum“, „max“)

Optional: Kontextsensitive Aktivierungslogik (z. B. per Fenster, Trigger, Driftzone)

Zusammenspiel:
Das Master-Schema lädt und steuert die Profile aus /schemata/, sorgt für Score-Fusion, und loggt Schemawechsel (wichtig für Verlaufsauswertung und adaptive Profiler).

Detect-Spec (DETECT_)
Funktion:
Detect-Specs (Prefix: DETECT_) definieren die Logik, nach der aus Rohdaten (Text, Metrikreihen, Sentimentserien) primitive Marker ausgelöst werden. Sie sind der regelbasierte Einstiegspunkt für die Marker-Engine.

Beispiel:

DETECT_ABSAGE_REGEX.json feuert bei bestimmten Absage-Phrasen einen S_ABSAGE_INDIR-Marker.

DETECT_EMO_VOLATILE.json prüft, ob die Varianz der Emotionen in einem 10-Nachrichten-Fenster einen Schwellenwert überschreitet und feuert dann S_EMO_VOLATILE_WINDOW.

Technik:

Format: JSON, im Ordner /detect/

Pflichtfelder:

id (Regel-Name)

rule (Objekt mit Typ, Parametern, z. B. Regex, Stddev, Frequency)

fire_marker (Marker-ID, die bei Regel-Treffer gefeuert wird)

Typen:

regex: Regex-Matching

stddev: Schwankungen in numerischen Serien

frequency: Schwellenwert für Wiederholung

trend_delta, embedding_distance, cross_speaker_pattern: für komplexe Muster

Zusammenspiel:
Detect-Specs werden von einem zentralen Runner verarbeitet, triggern Marker-IDs, die an die nachgelagerte Analyse (Schema, Cluster, Meta) weitergereicht werden.

Grabber / Plugins (GR_META_, GR_)
Funktion:
Grabber sind semantische Zusatzmodule, die komplexe Muster erkennen, die über klassische Regeln hinausgehen. Sie sind als Plugins entworfen und erweitern das System um KI- und Embedding-Logik, etwa für indirekte Ablehnung, Anomalien oder Feingefühl für Tonalitätsdrift.

Beispiel:

GR_SEM_ABSAGE.js nutzt Embeddings, um semantische Nähe zu typischen Absagen zu erkennen und schlägt S_ABSAGE_INDIR als Marker vor.

GR_KIMI_SUGGEST.py sendet Kommunikationscluster an ein LLM, das Vorschläge für Meta-Tags oder weitere Analyse gibt.

Technik:

Meta: JSON im Ordner /grabber_meta/ (dokumentiert Zweck, Beispiele, Link zum Plugin)

Plugin:

.js im Ordner /plugins/ (für Frontend/Electron/Chrome)

.py im Ordner /plugins/ (für Backend/CLI)

Pflichtfelder:

id

description

Exportierte Funktion: run(text, utils, meta) (liefert Marker-Vorschläge & Score)

Zusammenspiel:
Grabber laufen nach Detect, feuern keine Marker automatisch, sondern schlagen sie vor (GUI-Integration, Audit-Log). Sie können als KI-Advisor, Embedding-Semantiker, oder auch als Experimentierfeld für neue Methoden genutzt werden.

Score-Profile (SCR_)
Funktion:
Ein Score-Profile (Prefix: SCR_) definiert, wie Marker über einen Zeitraum aggregiert und zu quantitativen Werten (Scores) verrechnet werden. Diese Scores können z. B. als Zeitreihen, für Alerts oder als Trendanalysen genutzt werden – etwa um zu erkennen, wie stark Flirt, Rückzug, Manipulation oder Bindung sich über den Chatverlauf verändern.

Beispiel:

SCR_FLIRT_ESCALATION.json berechnet, wie oft und mit welcher Intensität Flirt-Marker in 30 Nachrichten auftreten.

SCR_SPEAKER_IMPACT_OVER_TIME.json summiert Impact-Scores pro Sprecher in 50er-Fenstern.

Technik:

Format: JSON, im Ordner /scores/

Pflichtfelder:

id (Score-Profil-Name)

target_markers[] (Liste der Marker-IDs, die einfließen)

window (z. B. "messages": 30)

aggregation (Methode: sum, mean, max, optional decay)

Erweiterungen:

Score-Skalen, Alarmschwellen, Reporting-Optionen

Zusammenspiel:
Score-Profile werden periodisch oder nach jedem neuen Marker-Event berechnet. Sie liefern numerische Auswertungen für Reporting, Alerts, Heatmaps und für tiefergehende Driftanalysen.

Calculate / Baseline (CAL_)
Funktion:
Calculate-Module (Prefix: CAL_) dienen zur Erzeugung von Referenzwerten und Baselines. Sie analysieren Chatdaten (meist zu Beginn) und berechnen für jeden Sprecher typische Kennzahlen: Durchschnittslänge von Nachrichten, Emoji-Frequenz, Primärmarker, Valence-Mittelwerte usw. Die bekannteste und wichtigste Instanz ist die Baseline-Berechnung.

Beispiel:

CAL_BASELINE_PROFILE.py wertet die ersten 20 Nachrichten pro Sprecher aus und speichert Durchschnittswerte als Startpunkt für spätere Driftanalysen.

CAL_MARKER_FREQUENCY_TRACKER.json berechnet Markerhäufigkeiten über Zeit.

Technik:

Format: Python-Script oder JSON, im Ordner /calculate/

Pflichtfelder (Script):

Funktion produce_baseline() oder main(), die aus Nachrichten ein JSON-Baseline-Profil erzeugt

Pflichtfelder (JSON):

id, method (z. B. „mean+stdev über 20 Nachrichten“), Option für Fenstergröße

Zusammenspiel:
Calculate-Module werden einmalig zu Beginn oder regelmäßig aufgerufen, um Referenzwerte zu setzen. Diese dienen Profiler- und Score-Modulen als dynamischer Vergleich („Hat sich der Stil verändert?“).

Profiler (PROF_)
Funktion:
Profiler (Prefix: PROF_) sind Module zur dynamischen Trend- und Driftanalyse. Sie überwachen, ob und wie sich Kommunikationsmuster im Verlauf verändern – z. B. ob sich die Emotionalität, Marker-Dichte, Emoji-Rate oder Stilistik signifikant von der Baseline absetzt.
„Drift“ heißt: Ein Wert bewegt sich außerhalb des normalen Erwartungsbereichs.

Beispiel:

PROF_EWMA_DRIFT.py nutzt exponentiell gewichtetes Mittel (EWMA), um schleichende Veränderungen („slow drift“) von Impact-Scores zu erkennen.

PROF_MARKER_VOLATILITY.py trackt die Varianz von Marker-Treffern über Zeit.

Technik:

Format: Python-Script oder JSON, im Ordner /profiler/

Pflichtfelder:

Klasse/Funktion mit update(score) und idealerweise drifted(threshold)

Speicherung von Trends, Events, Alerts als JSON-Ausgabe oder DB-Update

Zusammenspiel:
Profiler konsumieren Werte aus Calculate- und Score-Modulen, erkennen Abweichungen von Baselines und können Alerts, Heatmaps oder Analyse-Triggers feuern.
Sie sind der „Wächter“ für Veränderungen im Kommunikationsstil – und Grundlage für systemische Drift-Analysen oder Reporting.

Zusammenspiel dieser Klassen
Calculate (CAL_) generiert Start-Baselines und Referenzwerte.

Profiler (PROF_) überwachen laufend Veränderungen gegenüber der Baseline.

Score-Profile (SCR_) aggregieren Marker-Ereignisse, berechnen Zeitreihen und liefern quantitative Analysen für Reporting, Alerts oder Entscheidungsregeln.

Typischer Ablauf:

Chat startet → CAL_ berechnet Baselines pro Sprecher → PROF_ überwacht Drift → SCR_ erzeugt fortlaufende Scores → Reports/Heatmaps/Alerts basieren auf diesen Analysen.

Cluster Marker Editor – Hintergrund, Funktion, Nutzen
Kontext: Warum Cluster Marker bearbeiten?
Cluster Marker sind zentrale Bausteine des Analyse-Systems:
Sie bündeln mehrere Atomic- und Semantic Marker, um komplexe Beziehungsmuster, Kommunikationsdrifts oder Eskalationen zu erkennen, die durch einzelne Marker allein nicht erfassbar wären.
Beispiel: Ein einzelnes „Traurigkeits“-Wort (A_MARKER) ist wenig aussagekräftig, aber eine Serie von Rückzugs-, Ironie- und Distanz-Mustern (als Cluster) signalisiert vielleicht eine Beziehungskrise.

Cluster Marker:

Fassen typische Muster zu sinnvollen Gruppen zusammen (z. B. „Bindungsflucht“, „Latente Eskalation“, „Ironische Entfremdung“)

Definieren Schwellenwerte: Wie viele Marker, in welchem Zeitfenster, müssen gemeinsam auftreten?

Können individuell gewichtet und im Schema angepasst werden

Wozu ein Cluster Editor?
Der Cluster Editor ist ein spezielles UI-Modul, das das Zusammenstellen, Bearbeiten und Testen von Cluster Markern maximal einfach, transparent und kollaborativ macht.

Er unterstützt dich bei:

Zusammenstellen: Welche Marker gehören zu einem Cluster? Welche Dynamik will ich messen?

Konfigurieren: Schwellenwerte, Trigger-Logik, Zeitfenster, Gewicht

Validieren: Überprüfung auf Zyklen, Lücken, Dopplungen, zu breite oder zu enge Muster

Testen: Sofortige Vorschau, wie der Cluster auf Beispieldaten reagiert

Versionieren: Sicheres Verwalten, Vergleichen und Dokumentieren aller Cluster-Regeln

Typische Funktionen & Features
1. Marker-Auswahl & Gruppierung
Such- und Filterfunktion für alle Atomic und Semantic Marker

Drag & Drop, Checkboxen oder Multiselect: Marker können einfach zu einem Cluster hinzugefügt werden

Anzeige der Metadaten (Name, Beschreibung, Gewicht, Beispiele) jedes Markers

2. Cluster-Konfiguration
Eingabefeld für Cluster-ID und Beschreibung

Felder für:

composed_of: (Liste der enthaltenen Marker-IDs)

trigger_threshold: (z. B. „mind. 2 Marker aktiv innerhalb von 10 Nachrichten“)

window: (Größe des Analysefensters, z. B. 10, 20 oder flexibel)

impact_score: (optional, für Priorisierung im Schema)

Optionale Parameter: „strict order“ (Marker müssen in bestimmter Reihenfolge vorkommen?), „allow repeats“, „exclusive cluster“ etc.

3. Validierung & Test
Button für Live-Validierung (z. B. YAML/JSON-Struktur, Referenzen stimmen, keine Marker fehlen)

Button für Cluster-Test: Simuliert Cluster auf Beispieldialog oder Testdaten

Visuelle Rückmeldung: Wie oft wird der Cluster getroffen, bei welchen Beispielen?

4. Vorschau & Export
YAML- oder JSON-Vorschau des fertigen Cluster-Markers

Sofort-Export in das Projektverzeichnis („markers/cluster/C_NEUER_CLUSTER.yaml“)

Versionsvergleich: „Was hat sich seit dem letzten Commit geändert?“

5. Dokumentation & UX
Hilfe-Panel: Erklärt Sinn und Auswirkungen von Schwellenwerten, Fenstern, etc.

Templates: Vorlagen für typische Cluster (z. B. „Withdrawal“, „Ironie-Cluster“)

Kommentarfelder für Team-Notizen oder Review-Anmerkungen

Beispiel: Cluster Editor in der Praxis
Ziel:
Ein neuer Cluster „Affektiver Rückzug“ soll alle Muster bündeln, die für emotionale Distanzierung sprechen.

Workflow:

Suche nach Markern mit „Distanz“, „Ironie“, „wenig Resonanz“

Wähle 4 relevante Marker per Klick aus, ziehe sie in den Cluster-Bereich

Setze Trigger-Threshold: „min. 2 Marker in 10 Nachrichten“

Setze Fenster: 10

Füge Beschreibung und Beispiele hinzu

Drücke „Testen“ mit einem Chatbeispiel – Feedback: „Cluster wurde 3x getriggert, z. B. hier: ...“

Klicke „Validieren & Exportieren“ – der YAML-Code liegt im Projekt bereit.

Integration ins System
Im Schema-Builder-GUI:
Eigener Tab „Cluster-Editor“ neben „Marker-Import“ und „Schema-Export“

Backend:
Exportiert YAML nach markers/cluster/, Updates sind für die Marker Engine sofort verfügbar

CI-Checks:
Cluster werden bei jedem Commit automatisch geprüft (Zyklen, Referenzen, Mindestanzahl von Submarkern, etc.)

Nutzen für die Praxis
Erhöht die Transparenz komplexer Regeln

Erlaubt Teams, ihr Wissen über Dynamiken direkt in die Engine zu übersetzen – ohne YAML zu editieren

Macht die Wartung und Weiterentwicklung von Analyse-Schemata nachhaltiger und effizienter

! Hier kommen für jede wichtige Klasse (abseits der Marker!)
je ein valider ("good") und ein absichtlich fehlerhafter ("bad") Beispiel-File.
Du kannst diese direkt in deine Testsuite übernehmen.

1️⃣ Score-Profile – SCR_
tests/good/SCR_simple_window.json
json
Kopieren
Bearbeiten
{
  "id": "SCR_FRAUD_SCORE",
  "target_markers": ["A_FRAUD_PAYMENT", "S_LOVE_BOMBING"],
  "window": { "messages": 50 },
  "aggregation": { "method": "sum" }
}
tests/bad/SCR_missing_agg.json
json
Kopieren
Bearbeiten
{
  "id": "SCR_NO_AGGREGATION",
  "target_markers": ["A_FRAUD_PAYMENT"],
  "window": { "messages": 30 }
  // FEHLT: "aggregation"
}
2️⃣ Detektor – DETECT_
tests/good/DETECT_fraud_payment.json
json
Kopieren
Bearbeiten
{
  "id": "DETECT_FRAUD_PAYMENT",
  "description": "Findet typische Geldforderungen im Text.",
  "rule": {
    "type": "regex",
    "pattern": "(überweise|transfer|send(e)? mir.*geld|money request)",
    "flags": "i"
  },
  "fire_marker": "A_FRAUD_PAYMENT"
}
tests/bad/DETECT_missing_pattern.json
json
Kopieren
Bearbeiten
{
  "id": "DETECT_FRAUD_MISSING_PATTERN",
  "rule": {
    "type": "regex"
    // FEHLT: pattern
  },
  "fire_marker": "A_FRAUD_PAYMENT"
}
3️⃣ Grabber-Plugin – GR_
tests/good/GR_simple_plugin.py
python
Kopieren
Bearbeiten
id = "GR_SIMPLE_EXAMPLE"
description = "Testet einen simplen Grabber."
def run(text, utils=None, meta=None):
    if "magicword" in text.lower():
        return {"fire": ["S_MAGIC"], "score": 1}
    return {"fire": [], "score": 0}
tests/bad/GR_no_run_method.py
python
Kopieren
Bearbeiten
id = "GR_MISSING_RUN"
description = "Plugin ohne run()-Methode."
# FEHLT: def run(...)
4️⃣ Schema-Profil – SCH_
tests/good/SCH_fraud_profile.json
json
Kopieren
Bearbeiten
{
  "id": "SCH_FRAUD",
  "weights": { "A_": 1.1, "S_": 1.5, "C_": 2, "MM_": 2 },
  "window": { "messages": 100 },
  "decay": 0.01,
  "risk_thresholds": { "green": 0, "yellow": 5, "red": 10 }
}
tests/bad/SCH_missing_weights.json
json
Kopieren
Bearbeiten
{
  "id": "SCH_BAD_PROFILE",
  "window": { "messages": 100 }
  // FEHLT: "weights"
}
5️⃣ Master-Schema – MASTER_SCH_
tests/good/MASTER_SCH_example.json
json
Kopieren
Bearbeiten
{
  "id": "MASTER_SCH_CORE",
  "active_schemata": ["SCH_FRAUD", "SCH_BEZIEHUNG"],
  "priority": { "SCH_FRAUD.json": 1.2, "SCH_BEZIEHUNG.json": 1.0 },
  "fusion": "multiply"
}
tests/bad/MASTER_SCH_no_priority.json
json
Kopieren
Bearbeiten
{
  "id": "MASTER_SCH_BAD",
  "active_schemata": ["SCH_FRAUD"],
  "fusion": "sum"
  // FEHLT: "priority"
}
6️⃣ Profiler – PROF_
tests/good/PROF_simple.py
python
Kopieren
Bearbeiten
class ProfilerExample:
    def __init__(self): self.mean = None
    def update(self, val): self.mean = val if self.mean is None else 0.5*self.mean+0.5*val
    def drifted(self): return self.mean and self.mean > 0.9
tests/bad/PROF_no_update.py
python
Kopieren
Bearbeiten
class ProfilerBad:
    # FEHLT: update(self, val)
    def drifted(self): return False
7️⃣ Chunk-Analyse – CHA_
tests/good/CHA_chunk_fraud.yaml
yaml
Kopieren
Bearbeiten
id: CHA_FRAUD_OVERVIEW
description: "Chunk-Analyse für Fraud"
detectors_active:
  - DETECT_FRAUD_PAYMENT
  - DETECT_LOVE_BOMBING
high_level_snapshot:
  include_levels: [C_, MM_]
  top_k: 10
drift_axes:
  - speaker_valence
  - payment_requests
outputs:
  show_markers: true
  show_drift: true
  store_json: true
tests/bad/CHA_no_detectors.yaml
yaml
Kopieren
Bearbeiten
id: CHA_MISSING_DETECTORS
description: "Fehler: keine aktiven Detektoren"
# FEHLT: detectors_active
high_level_snapshot:
  include_levels: [C_]
  top_k: 5
drift_axes: []
outputs:
  show_markers: true