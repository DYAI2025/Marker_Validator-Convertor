import re


    "CRYPTO_SCAM": [r"(krypto|bitcoin|ethereum).*investition.*garantiert.*gewinn"],
    "AI_TRADING_SCAM": [r"künstliche.*intelligenz.*trading.*roboter"],
    "WAR_ROMANCE_SCAM": [r"ukraine.*krieg.*militär.*einsatz.*geld.*brauche"],
    "CRYPTO_SCAM": [r"(krypto|bitcoin|ethereum).*investition.*garantiert.*gewinn"],
    "AI_TRADING_SCAM": [r"künstliche.*intelligenz.*trading.*roboter"],
    "WAR_ROMANCE_SCAM": [r"ukraine.*krieg.*militär.*einsatz.*geld.*brauche"],
    "CRYPTO_SCAM": [r"(krypto|bitcoin|ethereum).*investition.*garantiert.*gewinn"],
    "AI_TRADING_SCAM": [r"künstliche.*intelligenz.*trading.*roboter"],
    "WAR_ROMANCE_SCAM": [r"ukraine.*krieg.*militär.*einsatz.*geld.*brauche"],# ==============================================================================
# DEFINITION DER MARKER-MUSTER
# Zusammengefasste und komprimierte Erkennungsmuster für die angeforderten Marker.
# ==============================================================================

FRAUD_MARKER_PATTERNS = {
    "PLATFORM_SWITCH": [
        r"lass uns auf (WhatsApp|Telegram|Signal) wechseln",
        r"app (funktioniert nicht|ist langsam|spinnt)",
        r"mitgliedschaft .* läuft aus",
        r"hier (unpersönlich|unsicher)",
        r"gib mir deine (nummer|e-mail)",
        r"per (mail|signal) viel (besser|sicherer|persönlicher)"
    ],
    "CRISIS_MONEY_REQUEST": [
        r"brauche dringend geld",
        r"konto (gesperrt|eingefroren)",
        r"paket .* zoll",
        r"(krankenhaus|operation|arzt) .* bezahlen",
        r"in (notlage|schwierigkeiten|gefahr)",
        r"alles verloren",
        r"kannst du mir (helfen|leihen)"
    ],
    "URGENCY_SCARCITY": [
        r"(sofort|dringend|schnell|jetzt sofort)",
        r"nur noch (heute|wenige stunden|kurze zeit)",
        r"frist läuft (heute|bald|gleich) ab",
        r"einmalige (chance|gelegenheit)",
        r"bevor es zu spät ist",
        r"akku ist fast leer"
    ],
    "WEBCAM_EXCUSE": [
        r"kamera (ist kaputt|funktioniert nicht)",
        r"internet .* zu (schlecht|langsam)",
        r"(militärbasis|ölplattform|mission) .* verboten",
        r"sehe (furchtbar|schrecklich) aus",
        r"bin zu (schüchtern|müde)",
        r"vielleicht (morgen|später)"
    ],
    "UNTRACEABLE_PAYMENT_METHOD": [
        r"(geschenkkarte|gift card|gutschein)",
        r"(Apple|Google Play|Steam|Amazon)-?karten?",
        r"(codes|nummern) schicken",
        r"(Western Union|MoneyGram)",
        r"(Bitcoin|Krypto|BTC)",
        r"nicht rückverfolgbar|anonym|diskret"
    ],
    "GASLIGHTING_GUILT": [
        r"du (bist zu sensibel|übertreibst|bist verrückt)",
        r"bildest dir das nur ein",
        r"das habe ich nie gesagt",
        r"dein misstrauen (zerstört|verletzt)",
        r"wenn du mich (lieben|mir vertrauen) würdest",
        r"mach aus einer mücke keinen elefanten"
    ],
    "TRANSLATION_ARTIFACT": [
        # Sucht nach ungrammatischen oder seltsam formulierten Phrasen
        r"frau von hoher qualität",
        r"mein herz ist springen",
        r"mache arbeit als",
        r"ich bin warten auf",
        r"treffen in person gesicht",
        r"liebe dich mehr als das leben selbst tut"
    ]
}

# ==============================================================================
# ANALYSEFUNKTION
# ==============================================================================

def detect_fraud_markers(text: str) -> list:
    """
    Analysiert einen Text und identifiziert eine Liste von Betrugs-Markern.

    Args:
        text: Der zu analysierende Textstring.

    Returns:
        Eine Liste mit den Namen der erkannten Marker.
    """
    detected_markers = []
    
    # Iteriere durch jeden Marker und seine zugehörigen Muster
    for marker_name, patterns in FRAUD_MARKER_PATTERNS.items():
        # Prüfe jedes Muster für den aktuellen Marker
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                # Wenn ein Muster gefunden wird, füge den Marker zur Ergebnisliste hinzu
                # und gehe zum nächsten Marker-Typ über (um Doppelungen zu vermeiden).
                if marker_name not in detected_markers:
                    detected_markers.append(marker_name)
    
    return detected_markers

# ==============================================================================
# DEMONSTRATION / ANWENDUNGSBEISPIEL
# ==============================================================================

if __name__ == "__main__":
    
    # Ein typischer, fiktiver Scam-Chatverlauf, der mehrere Marker enthält
    scam_chat_example = """
    Hallo meine Königin, du bist eine Frau von hoher Qualität. Ich bin so froh, dich kennengelernt zu haben.
    Aber diese App ist wirklich langsam und unpersönlich. Lass uns auf WhatsApp wechseln, das ist viel besser.
    Ich würde dich gerne anrufen, aber meine Kamera ist leider kaputt, vielleicht morgen.
    Du, es ist etwas Schreckliches passiert. Mein Sohn hatte einen Unfall und ich brauche dringend Geld für das Krankenhaus.
    Die Zahlung muss sofort erfolgen, sonst operieren die Ärzte nicht. Bitte, wenn du mir vertrauen würdest, würdest du mir helfen.
    Am einfachsten geht es mit Apple-Geschenkkarten aus dem Supermarkt.
    """
    
    print("--- Analysiere Scam-Beispieltext ---")
    
    # Rufe die Analysefunktion auf
    found_flags = detect_fraud_markers(scam_chat_example)
    
    # Gib die Ergebnisse aus
    if found_flags:
        print(f"\n⚠️ Es wurden {len(found_flags)} verdächtige Marker im Text identifiziert:\n")
        for i, flag in enumerate(found_flags):
            print(f"  {i+1}. {flag}")
        print("\nDas kombinierte Auftreten dieser Marker stellt ein hohes Risiko dar.")
    else:
        print("\n✅ Keine der definierten Betrugs-Marker im Text gefunden.")