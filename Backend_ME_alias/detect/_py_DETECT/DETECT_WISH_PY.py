import re

# ==============================================================================
# DEFINITION DER SEMANTISCHEN KOMPONENTEN
# Diese "Zutaten" machen das Analysiert einen Text auf Marker (übergebenes Markerdetektions-Objekt) und detektiert Wunsch-Cluster.
    Gibt ein Dict mit Markern und Wunsch-Status zurück. aus.
# ==============================================================================

DETECT_WISH_PY_COMPONENTS = {
    "WISH_DETECTOR_COMPONENT": [
        r"\#\ wish_detector\.py",
    ],
    "FROM_COMPONENT": [
        r"\bfrom\ typing\ import\ List,\ Dict\b",
    ],
    "BEISPIELHAFTE_COMPONENT": [
        r"\#\ Beispielhafte\ Marker\-Listen,\ sollten\ mit\ deinem\ Markersystem\ synchronisiert\ werden",
    ],
    "WUNSCH_CLUSTER_MARKER_COMPONENT": [
        r"WUNSCH_CLUSTER_MARKER\ =\ \[",
    ],
    "SOFT_COMMITMENT_COMPONENT": [
        r""SOFT_COMMITMENT",",
    ],
    "AMBIVALENCE_MARKER_COMPONENT": [
        r""AMBIVALENCE_MARKER",",
    ],
    "FUTURE_PROJECTION_COMPONENT": [
        r""FUTURE_PROJECTION",",
    ],
    "IDEALIZATION_COMPONENT": [
        r""IDEALIZATION",",
    ],
    "FUTURE_LONGING_COMPONENT": [
        r""FUTURE_LONGING"",
    ],
    "COMPONENT_10": [
        r"\]",
    ],
}

# ==============================================================================
# ANALYSEFUNKTION
# ==============================================================================

def detect_wish_py(text: str) -> dict:
    """
    Analysiert einen Text semantisch auf "Analysiert einen Text auf Marker (übergebenes Markerdetektions-Objekt) und detektiert Wunsch-Cluster.
    Gibt ein Dict mit Markern und Wunsch-Status zurück.".

    Die Funktion prüft, ob mehrere Komponenten des Markers im Text vorkommen,
    um eine hohe Treffsicherheit zu gewährleisten.

    Args:
        text: Der zu analysierende Text (z.B. eine Chat-Nachricht, eine Aussage).

    Returns:
        Ein Dictionary mit dem Analyseergebnis.
    """
    found_components = set()
    
    # Durchsuche den Text nach jeder Komponente
    for component_name, patterns in DETECT_WISH_PY_COMPONENTS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                found_components.add(component_name)
                break  # Ein Treffer pro Komponente reicht

    score = len(found_components)
    is_detected = score >= 2  # Marker wird als erkannt gewertet, wenn mind. 2 Komponenten zutreffen

    analysis = {
        "marker_id": "DETECT_WISH_PY",
        "is_detected": is_detected,
        "confidence_score": score / len(DETECT_WISH_PY_COMPONENTS) if DETECT_WISH_PY_COMPONENTS else 0,
        "found_components": list(found_components),
        "semantic_grabber_id": "AUTO_GENERATED"
    }

    if is_detected:
        explanation = "Die Aussage enthält mehrere Signale für analysiert einen text auf marker (übergebenes markerdetektions-objekt) und detektiert wunsch-cluster.
    gibt ein dict mit markern und wunsch-status zurück.. "
        analysis["explanation"] = explanation

    return analysis

# ==============================================================================
# DEMONSTRATION / ANWENDUNGSBEISPIEL
# ==============================================================================

if __name__ == "__main__":
    
    test_cases = [
        # Testfälle werden hier automatisch generiert basierend auf den Patterns
        "# wish_detector.py",
        "from typing import List, Dict",
        "# Beispielhafte Marker-Listen, sollten mit deinem Markersystem synchronisiert werden",
        "Normaler Text ohne relevante Marker.",
        "Positive eindeutige Aussage.",
    ]

    print("--- Semantische Analyse auf Analysiert einen Text auf Marker (übergebenes Markerdetektions-Objekt) und detektiert Wunsch-Cluster.
    Gibt ein Dict mit Markern und Wunsch-Status zurück. ---\n")

    for i, text in enumerate(test_cases):
        result = detect_wish_py(text)
        print(f"Testfall #{i+1}: \"{text}\"")
        if result["is_detected"]:
            print(f"  ▶️ Marker erkannt: JA")
            print(f"  ▶️ Erklärung: {result.get('explanation', 'N/A')}")
            print(f"  ▶️ Gefundene Komponenten: {result['found_components']}")
        else:
            print(f"  ▶️ Marker erkannt: NEIN (Nur {len(result['found_components'])}/2 Komponenten gefunden)")
        print("-" * 50)

# ==============================================================================
# METADATA FÜR AUTOMATISCHE INTEGRATION
# ==============================================================================

DETECTOR_METADATA = {
    "module_name": "DETECT_WISH_PY",
    "function_name": "detect_wish_py",
    "description": "Analysiert einen Text auf Marker (übergebenes Markerdetektions-Objekt) und detektiert Wunsch-Cluster.
    Gibt ein Dict mit Markern und Wunsch-Status zurück.",
    "semantic_grabber_id": "AUTO_GENERATED",
    "created_at": "2025-07-21T13:32:41.082412",
    "detection_threshold": 2,
    "components_count": 59
}
