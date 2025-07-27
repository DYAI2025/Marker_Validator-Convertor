marker: SOCIAL_RESONANCE_DETECTOR.py_MARKER
beschreibung: >
  Semantic greb pattern
beispiele:
  - "SEMANTIC_GRAB_PATTERNS = {"
  - ""FRIENDLY_FLIRTING_MARKER": FRIENDLY_FLIRTING_GRAB,"
  - ""OFFENSIVE_FLIRTING_MARKER": OFFENSIVE_FLIRTING_GRAB,"
  - ""DEEPENING_BY_QUESTIONING_ADVANCED_MARKER": DEEPENING_BY_QUESTIONING_ADVANCED_GRAB,"
  - ""RELATIONSHIP_AUTHENTICITY_MARKER": RELATIONSHIP_AUTHENTICITY_GRAB,"
  - ""RESONANZ_MATCHING_MARKER": RESONANZ_MATCHING_GRAB,"
  - "}"

semantic_grab:
  description: "Erkennt Muster für social_resonance_detector.py"
  patterns:
    - rule: "AUTO_PATTERN"
      pattern: r"(muster.*wird.*ergänzt)"
tags: [neu_erstellt, needs_review]
