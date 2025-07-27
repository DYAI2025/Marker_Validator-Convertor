# detect.py (erweitert)
import sys, yaml, json, argparse, logging, importlib
from pathlib import Path
from semantic_grabber import SemanticGrabber

LOG = logging.getLogger("marker_detect")
logging.basicConfig(level=logging.INFO)

def load_markers(path: Path):
    return yaml.safe_load(path.read_text(encoding="utf-8"))

def discover_detectors(schema: Dict[str, Any]):
    detectors = []
    for det_conf in schema['application_schema']['detectors'].values():
        mod = importlib.import_module(det_conf['module'])
        cls = getattr(mod, det_conf['class'])
        detectors.append(cls(schema))
        LOG.debug(f"Loaded detector: {det_conf['class']}")
    return detectors

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--markers',  '-m', type=Path, required=True, help="YAML mit Markern")
    p.add_argument('--schema',   '-s', type=Path, required=True, help="Detector-Schema YAML")
    p.add_argument('--input',    '-i', type=Path, default=None, help="Input-Textdatei")
    p.add_argument('--stdin',             action='store_true', help="Text aus STDIN lesen")
    p.add_argument('--output',   '-o', type=Path, default=None, help="Ergebnis-Datei (JSON)")
    p.add_argument('--verbose',  '-v', action='store_true', help="Logging DEBUG")
    args = p.parse_args()

    if args.verbose: LOG.setLevel(logging.DEBUG)

    markers = load_markers(args.markers)
    schema  = yaml.safe_load(args.schema.read_text(encoding="utf-8"))
    grabber = SemanticGrabber(markers)
    detectors = discover_detectors(schema)

    text = sys.stdin.read() if args.stdin else args.input.read_text(encoding="utf-8")
    features = grabber.extract(text)

    results = {"atomic":features['atomic']}
    for det in detectors:
        layer = det.detect(text, results)
        results[det.layer_name] = layer

    out = json.dumps(results, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(out, encoding="utf-8")
    else:
        print(out)

if __name__ == "__main__":
    main()
