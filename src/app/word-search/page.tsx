"use client";

import { useState } from "react";
import WordSearchPreview from "@/components/WordSearchPreview";
import { generateWordSearchHtml } from "@/utils/generateWordSearchHtml";

export default function WordSearchPage() {
  const [words, setWords] = useState([
    "θ ɪ n",
    "ʃ ɪ p",
    "k æ t",
    "f ɪ ʃ",
    "s ʌ n",
  ]);

  const [englishWords, setEnglishWords] = useState([
    "thin",
    "ship",
    "cat",
    "fish",
    "sun",
  ]);

  const [saveMessage, setSaveMessage] = useState("");

  function updateWord(index: number, value: string) {
    const updatedWords = [...words];
    updatedWords[index] = value;
    setWords(updatedWords);
  }

  function updateEnglishWord(index: number, value: string) {
    const updatedWords = [...englishWords];
    updatedWords[index] = value;
    setEnglishWords(updatedWords);
  }

  async function saveWordSearch() {
    setSaveMessage("");

    const databaseWords = words.map((word, index) => ({
      englishWord: englishWords[index].trim(),
      hint: null,
      phonemes: word
        .replaceAll("/", "")
        .trim()
        .split(/\s+/)
        .filter(Boolean),
    }));

    const invalidWord = databaseWords.some(
      (word) =>
        !word.englishWord ||
        word.phonemes.length === 0
    );

    if (invalidWord) {
      setSaveMessage(
        "Please enter phonemes and an English equivalent for every word."
      );
      return;
    }

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Classroom Word Search",
          type: "WORD_SEARCH",
          difficulty: "medium",
          showHints: true,
          gridSize: 9,
          words: databaseWords,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveMessage(
          data.error || "Failed to save activity."
        );
        return;
      }

      setSaveMessage("Word Search saved to database.");
    } catch {
      setSaveMessage("Could not connect to the backend.");
    }
  }

  async function downloadWordSearch() {
    try {
      const html = generateWordSearchHtml({
        words,
      });

      const file = new Blob([html], {
        type: "text/html",
      });

      const url = URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = "phoneme-word-search.html";
      link.click();

      URL.revokeObjectURL(url);

      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "GENERATION_SUCCESS",
          activityType: "WORD_SEARCH",
          page: "/word-search",
          success: true,
          message: "Word Search generated",
        }),
      });
    } catch (error) {
      console.error(
        "Word Search generation failed:",
        error
      );

      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "GENERATION_FAILED",
          activityType: "WORD_SEARCH",
          page: "/word-search",
          success: false,
          message: "Word Search generation failed",
        }),
      });
    }
  }

  return (
    <section>
      <h2>Phoneme Word Search Builder</h2>

      <p>
        Enter five phoneme words to create a classroom word
        search activity.
      </p>

      <div className="builder-grid">
        <div className="builder-panel">
          <h3>Activity settings</h3>

          {words.map((word, index) => (
            <div key={index}>
              <label>
                Phoneme word {index + 1}
                <input
                  type="text"
                  value={word}
                  onChange={(e) =>
                    updateWord(index, e.target.value)
                  }
                  placeholder="tʃ ɪ p"
                />
              </label>

              <label>
                English equivalent
                <input
                  type="text"
                  value={englishWords[index]}
                  onChange={(e) =>
                    updateEnglishWord(
                      index,
                      e.target.value
                    )
                  }
                  placeholder="chip"
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            className="primary-button"
            onClick={saveWordSearch}
          >
            Save Activity
          </button>

          {saveMessage && <p>{saveMessage}</p>}

          <button
            type="button"
            className="primary-button"
            onClick={downloadWordSearch}
          >
            Generate HTML
          </button>
        </div>

        <div className="preview-panel">
          <WordSearchPreview words={words} />
        </div>
      </div>
    </section>
  );
}