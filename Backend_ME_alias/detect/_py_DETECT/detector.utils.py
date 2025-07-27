from collections import deque
from datetime import timedelta
import numpy as np

def sliding_window(items, window_sec, key=lambda x: x["ts"]):
    """Yield items that fall inside a moving time-window."""
    window = deque()
    for it in items:
        window.append(it)
        while window and (key(it) - key(window[0])).total_seconds() > window_sec:
            window.popleft()
        yield list(window)

def linear_slope(values):
    """Returns slope of a simple linear regression over equally spaced points."""
    if len(values) < 2:
        return 0.0
    x = np.arange(len(values))
    return np.polyfit(x, values, 1)[0]
