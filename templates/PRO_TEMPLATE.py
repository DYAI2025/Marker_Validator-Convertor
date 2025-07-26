"""
PROF_TEMPLATE.py
Example EWMA drift tracker.  Import and feed with (timestamp, score).
"""

class EWMADrift:
    def __init__(self, alpha=0.3):
        self.alpha = alpha
        self.mean  = None

    def update(self, score):
        if self.mean is None:
            self.mean = score
        else:
            self.mean = self.alpha * score + (1 - self.alpha) * self.mean
        return self.mean

    def drifted(self, threshold):
        return self.mean is not None and self.mean >= threshold
