"""
CAL_TEMPLATE.py
Baseline calculator – example implementation.

Usage:
    python CAL_TEMPLATE.py --input chat.json --output baselines.json
"""

import argparse, json, statistics, datetime
from pathlib import Path

def build_baseline(messages, keys):
    baseline = {}
    for k in keys:
        values = [msg.get(k) for msg in messages if msg.get(k) is not None]
        if values:
            baseline[k] = {
                "mean" : statistics.mean(values),
                "stdev": statistics.pstdev(values)
            }
    baseline["generated_at"] = datetime.datetime.utcnow().isoformat()
    return baseline

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input",  required=True, help="Chat JSON with msg objects")
    p.add_argument("--output", required=True, help="Where to write baseline JSON")
    args = p.parse_args()

    data = json.loads(Path(args.input).read_text(encoding="utf-8"))
    msgs = data["messages"]
    keys = ["speaker_valence", "msg_length"]     # customise!

    baseline = build_baseline(msgs, keys)
    Path(args.output).write_text(json.dumps(baseline, indent=2))
    print("✅ baseline written to", args.output)

if __name__ == "__main__":
    main()
