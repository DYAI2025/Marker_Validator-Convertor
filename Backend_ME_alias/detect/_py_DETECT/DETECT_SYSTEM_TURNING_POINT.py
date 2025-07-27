marker: DETECT_SYSTEM_TURNING_POINT.py_MARKER
beschreibung: >
  Metamarker-Cluster aus mehreren Einzelmarker-Ereignissen berechnen.
Beispiel: SYSTEM_TURNING_POINT

Vorstufen: Häufung von LATENT_INSTABILITY_MARKER + ESCALATION_TENSION_MARKER + Rückgang von MICRO_CARE_MARKER

Metamarker-Trigger: Schwelle überschritten → Visualisierung als Kipppunkt/Übergang

Beispiel: SYSTEM_ROBUSTNESS

Vorstufen: Häufung von SYSTEM_RESILIENCE_MARKER + MICRO_CARE_MARKER + INTEGRATION_PROGRESSION_MARKER

Metamarker: Stabile, resiliente Beziehungsdynamik, wird als positiver Pol in Visualisierung angezeigt
beispiele:
  - "def detect_system_turning_point(marker_log):"
  - "instability = marker_log.count("LATENT_INSTABILITY_MARKER")"
  - "escalation = marker_log.count("ESCALATION_TENSION_MARKER")"
  - "micro_care = marker_log.count("MICRO_CARE_MARKER")"
  - "# Beispielschwelle: Instabilität/Eskalation 5+, Micro-Care <2"
  - "if instability >= 3 and escalation >= 2 and micro_care < 2:"
  - "return True"
  - "return False"

semantic_grab:
  description: "Erkennt Muster für detect_system_turning_point.py"
  patterns:
    - rule: "AUTO_PATTERN"
      pattern: r"(muster.*wird.*ergänzt)"
tags: [neu_erstellt, needs_review]
