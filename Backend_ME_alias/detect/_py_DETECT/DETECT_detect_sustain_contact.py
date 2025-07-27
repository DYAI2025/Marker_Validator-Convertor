def detect_sustained_contact(messages, min_per_week=3, duration_days=60):
    """
    Prüft, ob über 'duration_days' eine durchschnittliche Frequenz
    von 'min_per_week' Kontakten erreicht wird.
    messages: chronologische Liste [{ts, id, markers:[...]}]
    """
    if not messages:
        return False, {}
    duration = (messages[-1]["ts"] - messages[0]["ts"]).days
    if duration < duration_days:
        return False, {}

    weeks = max(1, duration // 7)
    if len(messages) / weeks >= min_per_week:
        return True, {"weeks": weeks, "count": len(messages)}
    return False, {}
