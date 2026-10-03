"use client";

import { useState } from "react";
import WordlePreview from "@/components/WordlePreview";
import { generateWordleHtml } from "@/utils/generateWordleHtml";

export default function WordlePage() {
  const [phonemeWord, setPhonemeWord] = useState("θ ɪ n");
  const [englishWord, setEnglishWord] = useState("thin");
  const [guesses, setGuesses] = useState(6);
  const [showHints, setShowHints] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  async function saveWordle() {
    setSaveMessage("");

    const phonemes = phonemeWord
      .replaceAll("/", "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (phonemes.length === 0 || !englishWord.trim()) {
      setSaveMessage("Please enter both phonemes and an English word.");
      return;
    }

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${englishWord.trim()} Wordle`,
          type: "WORDLE",
          difficulty: "medium",
          showHints,
          maxGuesses: guesses,
          words: [
            {
              englishWord: englishWord.trim(),
              hint: null,
              phonemes,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveMessage(data.error || "Failed to save activity.");
        return;
      }

      setSaveMessage("Activity saved to database.");
    } catch {
      setSaveMessage("Could not connect to the backend.");
    }
  }

  async function downloadWordle() {
    try {
      const phonemes = phonemeWord
  .replaceAll("/", "")
  .trim()
  .split(/\s+/)
  .filter(Boolean);

if (phonemes.length === 0 || !englishWord.trim()) {
  setSaveMessage(
    "Cannot generate Wordle without phonemes and an English word."
  );

  await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventType: "GENERATION_FAILED",
      activityType: "WORDLE",
      page: "/wordle",
      success: false,
      message: "Wordle generation failed: invalid input",
    }),
  });

  return;
}
      const html = generateWordleHtml({
        phonemeWord,
        englishWord,
        guesses,
        showHints,
      });

      const file = new Blob([html], {
        type: "text/html",
      });

      const url = URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = "phoneme-wordle.html";
      link.click();

      URL.revokeObjectURL(url);

      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "GENERATION_SUCCESS",
          activityType: "WORDLE",
          page: "/wordle",
          success: true,
          message: `${englishWord.trim()} Wordle generated`,
        }),
      });
    } catch (error) {
      console.error("Wordle generation failed:", error);

      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "GENERATION_FAILED",
          activityType: "WORDLE",
          page: "/wordle",
          success: false,
          message: "Wordle generation failed",
        }),
      });
    }
  }

  return (
    <section>
      <h2>Phoneme Wordle Builder</h2>

      <p>
        Configure a phoneme-based Wordle activity, preview it, and generate a
        standalone HTML file.
      </p>

      <div className="builder-grid">
        <div className="builder-panel">
          <h3>Activity settings</h3>

          <label>
            Phoneme word
            <input
              type="text"
              value={phonemeWord}
              onChange={(e) => setPhonemeWord(e.target.value)}
              placeholder="θ ɪ n"
            />
          </label>

          <label>
            English equivalent
            <input
              type="text"
              value={englishWord}
              onChange={(e) => setEnglishWord(e.target.value)}
              placeholder="thin"
            />
          </label>

          <label>
            Number of guesses
            <select
              value={guesses}
              onChange={(e) => setGuesses(Number(e.target.value))}
            >
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showHints}
              onChange={(e) => setShowHints(e.target.checked)}
            />
            Show phoneme hints
          </label>

          <button
            type="button"
            className="primary-button"
            onClick={saveWordle}
          >
            Save Activity
          </button>

          {saveMessage && <p>{saveMessage}</p>}

          <button
            type="button"
            className="primary-button"
            onClick={downloadWordle}
          >
            Generate HTML
          </button>
        </div>

        <div className="preview-panel">
          <WordlePreview
            phonemeWord={phonemeWord}
            englishWord={englishWord}
            guesses={guesses}
            showHints={showHints}
          />
        </div>
      </div>
    </section>
  );
}