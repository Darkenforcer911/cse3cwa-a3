"use client";

import { useEffect, useState } from "react";
import { generateWordleHtml } from "@/utils/generateWordleHtml";
import { generateWordSearchHtml } from "@/utils/generateWordSearchHtml";

type Phoneme = {
  id: number;
  symbol: string;
  position: number;
};

type Word = {
  id: number;
  englishWord: string;
  hint: string | null;
  phonemes: Phoneme[];
};

type Activity = {
  id: number;
  name: string;
  type: string;
  difficulty: string;
  showHints: boolean;
  maxGuesses: number | null;
  gridSize: number | null;
  words: Word[];
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch("/api/activities");

        if (!response.ok) {
          throw new Error("Failed to load activities");
        }

        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  function downloadHtml(html: string, filename: string) {
    const file = new Blob([html], {
      type: "text/html",
    });

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  function generateSavedActivity(activity: Activity) {
    if (activity.type === "WORDLE") {
      const word = activity.words[0];

      if (!word) return;

      const phonemeWord = [...word.phonemes]
        .sort((a, b) => a.position - b.position)
        .map((phoneme) => phoneme.symbol)
        .join(" ");

      const html = generateWordleHtml({
        phonemeWord,
        englishWord: word.englishWord,
        guesses: activity.maxGuesses ?? 6,
        showHints: activity.showHints,
      });

      downloadHtml(
        html,
        `${word.englishWord}-wordle.html`
      );

      return;
    }

    if (activity.type === "WORD_SEARCH") {
      const words = activity.words.map((word) =>
        [...word.phonemes]
          .sort((a, b) => a.position - b.position)
          .map((phoneme) => phoneme.symbol)
          .join(" ")
      );

      const html = generateWordSearchHtml({
        words,
      });

      downloadHtml(
        html,
        "saved-phoneme-word-search.html"
      );
    }
  }

  async function deleteActivity(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete activity");
      }

      setActivities((current) =>
        current.filter((activity) => activity.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete activity.");
    }
  }

  async function editWord(word: Word) {
    const englishWord = window.prompt(
      "English word:",
      word.englishWord
    );

    if (englishWord === null) return;

    const currentPhonemes = [...word.phonemes]
      .sort((a, b) => a.position - b.position)
      .map((phoneme) => phoneme.symbol)
      .join(" ");

    const phonemeInput = window.prompt(
      "Enter phonemes separated by spaces:",
      currentPhonemes
    );

    if (phonemeInput === null) return;

    const phonemes = phonemeInput
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!englishWord.trim() || phonemes.length === 0) {
      alert("English word and phonemes are required.");
      return;
    }

    try {
      const response = await fetch(`/api/words/${word.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          englishWord: englishWord.trim(),
          phonemes,
        }),
      });

      const updatedWord = await response.json();

      if (!response.ok) {
        alert(updatedWord.error || "Failed to update word.");
        return;
      }

      setActivities((current) =>
        current.map((activity) => ({
          ...activity,
          words: activity.words.map((existingWord) =>
            existingWord.id === word.id
              ? updatedWord
              : existingWord
          ),
        }))
      );
    } catch (error) {
      console.error(error);
      alert("Could not update word.");
    }
  }

  async function deleteWord(wordId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this word?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete word");
      }

      setActivities((current) =>
        current.map((activity) => ({
          ...activity,
          words: activity.words.filter(
            (word) => word.id !== wordId
          ),
        }))
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete word.");
    }
  }

  async function addWord(activityId: number) {
    const englishWord = window.prompt("English word:");

    if (!englishWord?.trim()) return;

    const phonemeInput = window.prompt(
      "Enter phonemes separated by spaces:",
      "tʃ ɪ p"
    );

    if (!phonemeInput?.trim()) return;

    const phonemes = phonemeInput
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId,
          englishWord: englishWord.trim(),
          phonemes,
        }),
      });

      const newWord = await response.json();

      if (!response.ok) {
        alert(newWord.error || "Failed to create word.");
        return;
      }

      setActivities((current) =>
        current.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                words: [...activity.words, newWord],
              }
            : activity
        )
      );
    } catch (error) {
      console.error(error);
      alert("Could not create word.");
    }
  }

  if (loading) {
    return <p>Loading saved activities...</p>;
  }

  return (
    <section>
      <h2>Saved Activities</h2>

      <p>
        Activities saved through the backend database.
      </p>

      {activities.length === 0 ? (
        <p>No saved activities yet.</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="builder-panel"
          >
            <h3>{activity.name}</h3>

            <p>
              <strong>Type:</strong> {activity.type}
            </p>

            <p>
              <strong>Difficulty:</strong>{" "}
              {activity.difficulty}
            </p>

            {activity.words.map((word) => (
              <div key={word.id}>
                <strong>{word.englishWord}</strong>:{" "}
                {[...word.phonemes]
                  .sort(
                    (a, b) =>
                      a.position - b.position
                  )
                  .map(
                    (phoneme) => phoneme.symbol
                  )
                  .join(" · ")}

                {" "}

                <button
                  type="button"
                  onClick={() => editWord(word)}
                >
                  Edit Word
                </button>

                <button
                  type="button"
                  onClick={() => deleteWord(word.id)}
                >
                  Delete Word
                </button>
              </div>
            ))}

            <br />

            <button
              type="button"
              onClick={() => addWord(activity.id)}
            >
              Add Word
            </button>

            <br />
            <br />

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                generateSavedActivity(activity)
              }
            >
              Generate HTML from Saved Data
            </button>

            <button
              type="button"
              onClick={() =>
                deleteActivity(activity.id)
              }
            >
              Delete Activity
            </button>
          </div>
        ))
      )}
    </section>
  );
}