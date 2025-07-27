# wish_detector.py

from typing import List, Dict

# Beispielhafte Marker-Listen, sollten mit deinem Markersystem synchronisiert werden
WUNSCH_CLUSTER_MARKER = [
    "SOFT_COMMITMENT",
    "AMBIVALENCE_MARKER",
    "FUTURE_PROJECTION",
    "IDEALIZATION",
    "FUTURE_LONGING"
]

def detect_wish_cluster(marker_list: List[str]) -> bool:
    """
    Prüft, ob ein signifikanter Wunsch-Cluster vorliegt, indem mindestens zwei typische Wunsch-Marker im gleichen Textabschnitt auftreten.
    """
    cluster_count = sum(1 for m in WUNSCH_CLUSTER_MARKER if m in marker_list)
    return cluster_count >= 2


def analyze_text_for_wishes(text: str, marker_engine) -> Dict:
    """
    Analysiert einen Text auf Marker (übergebenes Markerdetektions-Objekt) und detektiert Wunsch-Cluster.
    Gibt ein Dict mit Markern und Wunsch-Status zurück.
    """
    # marker_engine sollte eine Methode .detect_marker(text) liefern, die eine Liste aktiver Marker ausgibt
    detected_markers = marker_engine.detect_marker(text)
    wish_cluster = detect_wish_cluster(detected_markers)
    return {
        "text": text,
        "detected_markers": detected_markers,
        "wish_detected": wish_cluster
    }

# Beispiel-Integration:
class DummyMarkerEngine:
    # Simuliert eine Marker-Engine
    def detect_marker(self, text):
        # Dummy-Logik, ersetzen durch echtes Pattern-Matching
        markers = []
        if "maybe" in text or "let’s see" in text:
            markers.append("SOFT_COMMITMENT")
        if "no pressure" in text or "no expectations" in text:
            markers.append("AMBIVALENCE_MARKER")
        if "future" in text or "someday" in text:
            markers.append("FUTURE_PROJECTION")
        if "imagine" in text or "would be like" in text:
            markers.append("IDEALIZATION")
        if "wish" in text or "if things were different" in text:
            markers.append("FUTURE_LONGING")
        return markers

if __name__ == "__main__":
    engine = DummyMarkerEngine()
    samples = [
        "Maybe you'll visit Berlin sometime.",
        "Would be nice to see you again in the summer, but let’s see how life unfolds.",
        "Who knows what the future brings – maybe we find ourselves in the same place again.",
        "I like that we’re taking it slow, no pressure, no expectations.",
        "Sometimes I imagine what it would be like if things were different – no distance, no complications.",
        "I'm glad we're friends."
    ]
    for s in samples:
        result = analyze_text_for_wishes(s, engine)
        print(result)
