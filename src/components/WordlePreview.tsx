"use client";

import { useEffect, useState } from "react";

type WordlePreviewProps = {
  phonemeWord: string;
  englishWord: string;
  guesses: number;
  showHints: boolean;
};

const PHONEMES = [
  { symbol: "p", hint: "P as in pin" },
  { symbol: "b", hint: "B as in bin" },
  { symbol: "t", hint: "T as in tin" },
  { symbol: "d", hint: "D as in din" },
  { symbol: "k", hint: "K as in cat" },
  { symbol: "g", hint: "G as in go" },

  { symbol: "tʃ", hint: "CH as in chip" },
  { symbol: "dʒ", hint: "J as in jam" },

  { symbol: "m", hint: "M as in man" },
  { symbol: "n", hint: "N as in net" },
  { symbol: "ŋ", hint: "NG as in sing" },

  { symbol: "f", hint: "F as in fan" },
  { symbol: "v", hint: "V as in van" },
  { symbol: "s", hint: "S as in sun" },
  { symbol: "z", hint: "Z as in zoo" },

  { symbol: "θ", hint: "TH as in thin" },
  { symbol: "ð", hint: "TH as in this" },
  { symbol: "ʃ", hint: "SH as in ship" },
  { symbol: "ʒ", hint: "S as in vision" },

  { symbol: "h", hint: "H as in hat" },
  { symbol: "l", hint: "L as in lip" },
  { symbol: "r", hint: "R as in red" },
  { symbol: "w", hint: "W as in wet" },
  { symbol: "j", hint: "Y as in yes" },

  { symbol: "ɪ", hint: "I as in sit" },
  { symbol: "iː", hint: "EE as in see" },
  { symbol: "e", hint: "E as in bed" },
  { symbol: "æ", hint: "A as in cat" },
  { symbol: "ʌ", hint: "U as in cup" },
  { symbol: "ə", hint: "A as in about" },
  { symbol: "ɜː", hint: "IR as in bird" },
  { symbol: "ɑː", hint: "AR as in car" },
  { symbol: "ɔː", hint: "OR as in thought" },
  { symbol: "ʊ", hint: "OO as in book" },
  { symbol: "uː", hint: "OO as in food" },
];

export default function WordlePreview({
  phonemeWord,
  englishWord,
  guesses,
  showHints,
}: WordlePreviewProps) {
  const answer = phonemeWord
    .replaceAll("/", "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string[][]>([]);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCurrentGuess([]);
    setSubmitted([]);
    setSolved(false);
    setMessage("");
  }, [phonemeWord, guesses]);

  function addPhoneme(symbol: string) {
    if (solved || currentGuess.length >= answer.length) return;

    setCurrentGuess([...currentGuess, symbol]);
  }

  function removePhoneme() {
    if (solved) return;

    setCurrentGuess(currentGuess.slice(0, -1));
  }

  function submitGuess() {
    if (answer.length === 0) {
      setMessage("Enter a phoneme word first.");
      return;
    }

    if (currentGuess.length !== answer.length) {
      setMessage(`Choose ${answer.length} phonemes first.`);
      return;
    }

    const correct = currentGuess.every(
      (symbol, index) => symbol === answer[index]
    );

    const updated = [...submitted, currentGuess];

    setSubmitted(updated);

    if (correct) {
      setSolved(true);
      setCurrentGuess([]);
      setMessage("Correct!");
    } else if (updated.length >= guesses) {
      setCurrentGuess([]);
      setMessage(`Out of guesses. The answer was ${phonemeWord}.`);
    } else {
      setCurrentGuess([]);
      setMessage("Try again.");
    }
  }

  function tileColour(symbol: string, index: number) {
    if (symbol === answer[index]) return "#16a34a";
    if (answer.includes(symbol)) return "#d97706";

    return "#64748b";
  }

  return (
    <div className="wordle-game">
      <h3>Playable Preview</h3>

      <p className="wordle-answer-label">
        Phoneme word: <strong>{phonemeWord}</strong>
      </p>

      <div className="wordle-grid">
        {Array.from({ length: guesses }).map((_, rowIndex) => {
          const row =
            submitted[rowIndex] ??
            (rowIndex === submitted.length ? currentGuess : []);

          const isSubmitted = rowIndex < submitted.length;

          return (
            <div
              className="wordle-row"
              key={rowIndex}
              style={{
                gridTemplateColumns: `repeat(${Math.max(
                  answer.length,
                  1
                )}, 52px)`,
              }}
            >
              {Array.from({
                length: Math.max(answer.length, 1),
              }).map((_, columnIndex) => {
                const symbol = row[columnIndex] ?? "";

                return (
                  <div
                    className="wordle-tile"
                    key={columnIndex}
                    style={{
                      background:
                        isSubmitted && symbol
                          ? tileColour(symbol, columnIndex)
                          : "white",
                      color:
                        isSubmitted && symbol ? "white" : "#1f2937",
                    }}
                  >
                    {symbol}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {solved && (
        <div className="success-message">
          <strong>{phonemeWord}</strong> ={" "}
          <strong>{englishWord}</strong>
        </div>
      )}

      <div className="phoneme-keyboard">
        {PHONEMES.map((phoneme) => (
          <button
            key={phoneme.symbol}
            type="button"
            onClick={() => addPhoneme(phoneme.symbol)}
            title={showHints ? phoneme.hint : undefined}
            aria-label={
              showHints
                ? `${phoneme.symbol}: ${phoneme.hint}`
                : phoneme.symbol
            }
          >
            {phoneme.symbol}
          </button>
        ))}
      </div>

      <div className="wordle-controls">
        <button type="button" onClick={removePhoneme}>
          Delete
        </button>

        <button type="button" onClick={submitGuess}>
          Enter
        </button>
      </div>

      {message && <p className="game-message">{message}</p>}
    </div>
  );
}