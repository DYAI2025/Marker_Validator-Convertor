"""
Migrates old `semantic_grabber_library.yaml` into:

• grabber_meta/GR_META_*.json
• plugins/GR_*.py (dummy stub)

Run once, then delete.
"""

import yaml, json, uuid, shutil
from pathlib import Path

OLD = Path("semantic_grabber_library.yaml")
META_DIR = Path("grabber_meta")
PLUG_DIR = Path("plugins")

META_DIR.mkdir(exist_ok=True)
PLUG_DIR.mkdir(exist_ok=True)

lib = yaml.safe_load(OLD.read_text(encoding="utf-8"))

for entry in lib["grabbers"]:
    gid = f"GR_META_{entry['id']}"
    meta = {
        "id": gid,
        "description": entry["description"],
        "examples": entry["examples"],
        "plugin": f"GR_{entry['id']}.py",
        "created_from": entry.get("linked_marker"),
        "created_at": entry.get("created", "2024-01-01T00:00:00Z")
    }
    Path(META_DIR/gid+".json").write_text(json.dumps(meta, indent=2))

    # create stub plugin
    stub = f"""
id          = "GR_{entry['id']}"
description = "{entry['description']}"

def run(text, utils, meta):
    # TODO: implement logic
    return {{ "fire": [], "score": 0 }}
"""
    Path(PLUG_DIR/f"GR_{entry['id']}.py").write_text(stub.strip())

print("✅ migration complete")
