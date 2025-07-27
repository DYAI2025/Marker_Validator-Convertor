def detect_adaptive_polarization(messages, marker_lookup, window=20, min_cycles=2):
    """
    Sucht OPENNESS→WITHDRAWAL-Zyklen im letzten 'window' Nachrichten.
    """
    states = []
    for msg in messages[-window:]:
        mset = set(marker_lookup[msg["id"]])
        if "OPENNESS" in mset:
            states.append(1)
        elif "WITHDRAWAL" in mset:
            states.append(-1)

    # Zähle Sign-Flips (1→-1 oder -1→1)
    flips = sum(1 for i in range(1, len(states)) if states[i] != states[i-1])
    if flips >= min_cycles * 2:     # zwei vollständige Hin-und-Her-Bewegungen
        return True, {"flips": flips}
    return False, {}
