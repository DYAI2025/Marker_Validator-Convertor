"""
PROF_TEMPLATE.py
Leer-Vorlage für eigene Profiler-Module.
Implementiere die Methoden `update()` und optional `drifted()`.
"""

class ProfilerBase:
    def __init__(self, **params):
        # z. B. alpha, window, threshold …
        self.params = params
        self.state = {}

    def update(self, score: float):
        """
        Verarbeite einen neuen Score-Wert.
        Muss überschrieben werden.
        """
        raise NotImplementedError

    def drifted(self) -> bool:
        """
        Optional: True, wenn ein definierter Drift vorliegt.
        """
        return False
