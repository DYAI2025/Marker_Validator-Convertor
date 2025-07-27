import re

# ==============================================================================
# DEFINITION DER SEMANTISCHEN KOMPONENTEN
# Diese "Zutaten" machen das import re
from collections import defaultdict
from datetime import datetime

def detect_ritual_contact(message_history: list):
    """
    Detects the C_RITUAL_CONTACT marker by analyzing message frequency, timing, and content similarity.
    `message_history` is a list of dicts: [{"timestamp": datetime, "text": "..."}]
    """
    greetings = r"\b(guten morgen|morgen|good morning|gute nacht|nachti|schlaf gut|good night)\b"
    
    # Store messages by hour of the day
    hourly_messages = defaultdict(list)
    for msg in message_history:
        hour = msg["timestamp"].hour
        if re.search(greetings, msg["text"], re.IGNORECASE):
            hourly_messages[hour].append(msg["text"])
            
    ritual_count = 0
    potential_rituals = [] aus.
# ==============================================================================

DETECT_RITUAL_CONTACT_PATTERN_PY_COMPONENTS = {
    "SIMPLE_COMPONENT": [
        r"\#\ A\ simple\ heuristic:\ if\ there\ are\ 3\+\ similar\ greeting\ messages\ in\ a\ specific\ time\ window,\ it's\ a\ ritual\.",
    ],
    "MORNING_COMPONENT": [
        r"\#\ Morning\ window\ \(6\-10h\),\ Evening\ window\ \(21\-24h\)",
    ],
    "MORNING_WINDOW_COMPONENT": [
        r"morning_window\ =\ range\(6,\ 11\)",
    ],
    "EVENING_WINDOW_COMPONENT": [
        r"evening_window\ =\ range\(21,\ 25\)",
    ],
    "MORNING_GREETINGS_COMPONENT": [
        r"morning_greetings\ =\ sum\(len\(hourly_messages\[h\]\)\ for\ h\ in\ morning_window\)",
    ],
    "EVENING_GREETINGS_COMPONENT": [
        r"evening_greetings\ =\ sum\(len\(hourly_messages\[h\]\)\ for\ h\ in\ evening_window\)",
    ],
    "MORNING_GREETINGS_COMPONENT_1": [
        r"if\ morning_greetings\ >=\ 3:",
    ],
    "RITUAL_COUNT_COMPONENT": [
        r"\britual_count\ \+=\ morning_greetings\b",
    ],
    "POTENTIAL_RITUALS_COMPONENT": [
        r"potential_rituals\.append\("Morning\ Greeting"\)",
    ],
    "EVENING_GREETINGS_COMPONENT_1": [
        r"if\ evening_greetings\ >=\ 3:",
    ],
}

# ==============================================================================
# ANALYSEFUNKTION
# ==============================================================================

def detect_ritual_contact_pattern_py(text: str) -> dict:
    """
    Analysiert einen Text semantisch auf "import re
from collections import defaultdict
from datetime import datetime

def detect_ritual_contact(message_history: list):
    """
    Detects the C_RITUAL_CONTACT marker by analyzing message frequency, timing, and content similarity.
    `message_history` is a list of dicts: [{"timestamp": datetime, "text": "..."}]
    """
    greetings = r"\b(guten morgen|morgen|good morning|gute nacht|nachti|schlaf gut|good night)\b"
    
    # Store messages by hour of the day
    hourly_messages = defaultdict(list)
    for msg in message_history:
        hour = msg["timestamp"].hour
        if re.search(greetings, msg["text"], re.IGNORECASE):
            hourly_messages[hour].append(msg["text"])
            
    ritual_count = 0
    potential_rituals = []".

    Die Funktion prüft, ob mehrere Komponenten des Markers im Text vorkommen,
    um eine hohe Treffsicherheit zu gewährleisten.

    Args:
        text: Der zu analysierende Text (z.B. eine Chat-Nachricht, eine Aussage).

    Returns:
        Ein Dictionary mit dem Analyseergebnis.
    """
    found_components = set()
    
    # Durchsuche den Text nach jeder Komponente
    for component_name, patterns in DETECT_RITUAL_CONTACT_PATTERN_PY_COMPONENTS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                found_components.add(component_name)
                break  # Ein Treffer pro Komponente reicht

    score = len(found_components)
    is_detected = score >= 2  # Marker wird als erkannt gewertet, wenn mind. 2 Komponenten zutreffen

    analysis = {
        "marker_id": "DETECT_RITUAL_CONTACT_PATTERN_PY",
        "is_detected": is_detected,
        "confidence_score": score / len(DETECT_RITUAL_CONTACT_PATTERN_PY_COMPONENTS) if DETECT_RITUAL_CONTACT_PATTERN_PY_COMPONENTS else 0,
        "found_components": list(found_components),
        "semantic_grabber_id": "AUTO_GENERATED"
    }

    if is_detected:
        explanation = "Die Aussage enthält mehrere Signale für import re
from collections import defaultdict
from datetime import datetime

def detect_ritual_contact(message_history: list):
    """
    detects the c_ritual_contact marker by analyzing message frequency, timing, and content similarity.
    `message_history` is a list of dicts: [{"timestamp": datetime, "text": "..."}]
    """
    greetings = r"\b(guten morgen|morgen|good morning|gute nacht|nachti|schlaf gut|good night)\b"
    
    # store messages by hour of the day
    hourly_messages = defaultdict(list)
    for msg in message_history:
        hour = msg["timestamp"].hour
        if re.search(greetings, msg["text"], re.ignorecase):
            hourly_messages[hour].append(msg["text"])
            
    ritual_count = 0
    potential_rituals = []. "
        analysis["explanation"] = explanation

    return analysis

# ==============================================================================
# DEMONSTRATION / ANWENDUNGSBEISPIEL
# ==============================================================================

if __name__ == "__main__":
    
    test_cases = [
        # Testfälle werden hier automatisch generiert basierend auf den Patterns
        "# A simple heuristic: if there are 3+ similar greeting messages in a specific time window, it's a ritual.",
        "# Morning window (6-10h), Evening window (21-24h)",
        "morning_window = range(6, 11)",
        "Normaler Text ohne relevante Marker.",
        "Positive eindeutige Aussage.",
    ]

    print("--- Semantische Analyse auf import re
from collections import defaultdict
from datetime import datetime

def detect_ritual_contact(message_history: list):
    """
    Detects the C_RITUAL_CONTACT marker by analyzing message frequency, timing, and content similarity.
    `message_history` is a list of dicts: [{"timestamp": datetime, "text": "..."}]
    """
    greetings = r"\b(guten morgen|morgen|good morning|gute nacht|nachti|schlaf gut|good night)\b"
    
    # Store messages by hour of the day
    hourly_messages = defaultdict(list)
    for msg in message_history:
        hour = msg["timestamp"].hour
        if re.search(greetings, msg["text"], re.IGNORECASE):
            hourly_messages[hour].append(msg["text"])
            
    ritual_count = 0
    potential_rituals = [] ---\n")

    for i, text in enumerate(test_cases):
        result = detect_ritual_contact_pattern_py(text)
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
    "module_name": "DETECT_RITUAL_CONTACT_PATTERN_PY",
    "function_name": "detect_ritual_contact_pattern_py",
    "description": "import re
from collections import defaultdict
from datetime import datetime

def detect_ritual_contact(message_history: list):
    """
    Detects the C_RITUAL_CONTACT marker by analyzing message frequency, timing, and content similarity.
    `message_history` is a list of dicts: [{"timestamp": datetime, "text": "..."}]
    """
    greetings = r"\b(guten morgen|morgen|good morning|gute nacht|nachti|schlaf gut|good night)\b"
    
    # Store messages by hour of the day
    hourly_messages = defaultdict(list)
    for msg in message_history:
        hour = msg["timestamp"].hour
        if re.search(greetings, msg["text"], re.IGNORECASE):
            hourly_messages[hour].append(msg["text"])
            
    ritual_count = 0
    potential_rituals = []",
    "semantic_grabber_id": "AUTO_GENERATED",
    "created_at": "2025-07-21T18:41:54.542701",
    "detection_threshold": 2,
    "components_count": 25
}
