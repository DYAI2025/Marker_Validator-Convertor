#!/usr/bin/env python3
"""
EINFACHES CoSD - Direkt ohne Server
Einfach ausführen und Text eingeben - fertig!
"""

import sys
import os

# Füge das aktuelle Verzeichnis zum Python-Pfad hinzu
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    print("🚀 EINFACHES CoSD - Direkt ohne Server")
    print("=" * 50)
    
    try:
        # Importiere CoSD
        from cosd import CoSDAnalyzer
        print("✅ CoSD geladen!")
        
        # Erstelle Analyzer
        analyzer = CoSDAnalyzer()
        print("✅ Analyzer bereit!")
        
        print("\n💬 Gib Texte ein (leer = Ende):")
        print("-" * 30)
        
        texts = []
        while True:
            text = input(f"Text {len(texts)+1}: ").strip()
            if not text:
                break
            texts.append(text)
        
        if not texts:
            print("❌ Keine Texte eingegeben!")
            return
        
        print(f"\n🔍 Analysiere {len(texts)} Texte...")
        print("=" * 50)
        
        # Analysiere alle Texte
        for i, text in enumerate(texts, 1):
            print(f"\n📝 Text {i}: '{text[:50]}{'...' if len(text) > 50 else ''}'")
            
            try:
                result = analyzer.analyze_drift([text])
                
                # Zeige Ergebnisse
                print(f"   Risk-Level: {result.risk_assessment.get('risk_level', 'unknown')}")
                
                if hasattr(result, 'drift_velocity') and result.drift_velocity:
                    avg_velocity = result.drift_velocity.get('average_velocity', 0)
                    print(f"   Drift-Velocity: {avg_velocity:.3f}")
                
                if hasattr(result, 'emergent_clusters'):
                    print(f"   Emergente Cluster: {len(result.emergent_clusters)}")
                
                if hasattr(result, 'resonance_patterns'):
                    print(f"   Resonanz-Muster: {len(result.resonance_patterns)}")
                
                # Zeige Empfehlungen
                if hasattr(result, 'risk_assessment') and result.risk_assessment:
                    recommendations = result.risk_assessment.get('recommendations', [])
                    if recommendations:
                        print(f"   💡 Empfehlungen:")
                        for rec in recommendations[:2]:  # Nur erste 2
                            print(f"      • {rec}")
                
            except Exception as e:
                print(f"   ❌ Fehler: {e}")
        
        print("\n" + "=" * 50)
        print("✅ Analyse fertig!")
        
    except ImportError as e:
        print(f"❌ CoSD nicht gefunden: {e}")
        print("   Stelle sicher, dass der 'cosd' Ordner im gleichen Verzeichnis liegt!")
    except Exception as e:
        print(f"❌ Fehler: {e}")

if __name__ == "__main__":
    main() 