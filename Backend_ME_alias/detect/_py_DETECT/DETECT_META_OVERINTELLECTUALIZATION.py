import re

META_OVERINTELLECTUALIZATION_PATTERNS = [
    r"(diskrepanz|dissonanz|paradigma|systemisch|homöostase|sozial(?:es|e|er)? konstrukt|evolutionär|algorithmus|ontologisch|hypothese|commitment-level|reziprok[ea]? investition|metaebene|struktur(?:ell)?|dekonstruier(?:e|st|t)|kognitiv|symbiose|psychodynamik|soziobiologisch|feedback(-| )?schleife|somatisch|paradigmenwechsel)",
    r"(ich beobachte nur|ich analysiere|ich dekonstruiere|ich nehme wahr|betrachten wir das|wir sollten erst die begrifflichkeiten klären|das ist keine emotion, sondern)",
    r"(klassische spannung (zwischen|von)|systemisches beispiel|mikrokosmos|ontologisch betrachtet|definition des begriffs|hypothese über dich|commitment[- ]?level|reziproke investition)"
]

def detect_meta_overintellectualization(text):
    for pattern in META_OVERINTELLECTUALIZATION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False
