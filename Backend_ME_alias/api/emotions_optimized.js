
// emotions.js
// Erweiterte Analysemodul für Emotionen mit robuster Eingabeprüfung und gewichteten Keywords

export async function analyzeEmotion(inputText) {
  if (!inputText || typeof inputText !== "string" || inputText.trim() === "") {
    return {
      mood: "neutral",
      confidence: 0.0
    };
  }

  // Erweiterte Emotionen und Gewichtung (1 = schwach, 2 = mittel, 3 = stark)
  const emotions = {
    sadness: { "leer": 2, "einsam": 3, "verloren": 2, "traurig": 3, "grau": 1 },
    joy: { "freue": 2, "glücklich": 3, "liebe": 3, "leicht": 2, "sonne": 1 },
    anger: { "wütend": 3, "hass": 3, "explodieren": 2, "schreien": 2, "aggressiv": 2 },
    fear: { "angst": 3, "zitter": 2, "unsicher": 2, "verstecken": 1, "flucht": 2 },
    surprise: { "überrascht": 2, "staune": 2, "plötzlich": 1 },
    disgust: { "ekel": 3, "widerlich": 2, "unangenehm": 1 }
  };

  let dominantEmotion = "neutral";
  let maxScore = 0;

  for (const [emotion, words] of Object.entries(emotions)) {
    let score = 0;
    for (const [word, weight] of Object.entries(words)) {
      if (inputText.toLowerCase().includes(word)) {
        score += weight;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion;
    }
  }

  return {
    mood: dominantEmotion,
    confidence: maxScore > 0 ? Math.min(maxScore / 9, 1) : 0.1
  };
}
