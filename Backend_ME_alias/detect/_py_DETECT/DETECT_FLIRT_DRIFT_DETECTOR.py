# ---------- Hilfsfunktionen ----------
def openness_score(msg):
    """Sehr grobe Heuristik: je mehr Self-Disclosure-Marker, desto höher."""
    return (
        2 * msg.count("A_RAPID_SELF_DISCLOSURE")
        + 1 * msg.count("A_SOFT_FLIRT")
        + 0.5 * msg.count("A_SOFT_COMMITMENT")
    )

def time_diff(t1, t2):
    return abs((t2 - t1).total_seconds())