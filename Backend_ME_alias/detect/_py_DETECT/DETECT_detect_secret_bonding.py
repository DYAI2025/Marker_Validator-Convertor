def detect_secret_bonding(messages, marker_lookup):
    """
    Trigger, wenn sustained_contact + >3 Erwähnungen von secrecy/exclusion
    innerhalb von 30 Nachrichten vorkommen.
    """
    secrecy_markers = {"S_MENTION_OF_SECRECY", "C_EXCLUSION_OF_OTHERS"}
    hits = 0
    for msg in messages[-30:]:
        if secrecy_markers & set(marker_lookup[msg["id"]]):
            hits += 1
    if hits >= 3:
        return True, {"secrecy_refs": hits}
    return False, {}
