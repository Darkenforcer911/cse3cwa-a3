"use client";

import { useEffect, useState } from "react";

type WordSearchPreviewProps = {
  words: string[];
};

const FILLER = [
  "p", "b", "t", "d", "k", "g",
  "tʃ", "dʒ",
  "m", "n", "ŋ",
  "f", "v", "s", "z",
  "θ", "ð", "ʃ", "ʒ",
  "h", "l", "r", "w", "j",
  "ɪ", "iː", "e", "æ", "ʌ", "ə",
  "ɜː", "ɑː", "ɔː", "ʊ", "uː",
];

const GRID_SIZE = 9;

function tokeniseWord(word: string) {
  return word
    .replaceAll("/", "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function arraysMatch(a: string[], b: string[]) {
  return (
    a.length === b.length &&
    a.every((symbol, index) => symbol === b[index])
  );
}

function makeGrid(words: string[]) {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill("")
  );

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
  ];

  words.forEach((word) => {
    const phonemes = tokeniseWord(word);

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      attempts++;

      const [rowMove, colMove] =
        directions[Math.floor(Math.random() * directions.length)];

      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);

      const endRow =
        startRow + rowMove * (phonemes.length - 1);

      const endCol =
        startCol + colMove * (phonemes.length - 1);

      if (endRow >= GRID_SIZE || endCol >= GRID_SIZE) {
        continue;
      }

      let canPlace = true;

      for (let i = 0; i < phonemes.length; i++) {
        const row = startRow + rowMove * i;
        const col = startCol + colMove * i;

        if (
          grid[row][col] !== "" &&
          grid[row][col] !== phonemes[i]
        ) {
          canPlace = false;
          break;
        }
      }

      if (!canPlace) continue;

      for (let i = 0; i < phonemes.length; i++) {
        const row = startRow + rowMove * i;
        const col = startCol + colMove * i;

        grid[row][col] = phonemes[i];
      }

      placed = true;
    }
    if (!placed) {
  for (let row = 0; row < GRID_SIZE && !placed; row++) {
    for (let col = 0; col <= GRID_SIZE - phonemes.length; col++) {
      let canPlace = true;

      for (let i = 0; i < phonemes.length; i++) {
        if (
          grid[row][col + i] !== "" &&
          grid[row][col + i] !== phonemes[i]
        ) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < phonemes.length; i++) {
          grid[row][col + i] = phonemes[i];
        }

        placed = true;
        break;
      }
    }
  }
}
  });

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === "") {
        grid[row][col] =
          FILLER[Math.floor(Math.random() * FILLER.length)];
      }
    }
  }

  return grid;
}

export default function WordSearchPreview({
  words,
}: WordSearchPreviewProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setGrid(makeGrid(words));
    setSelected([]);
    setSelectedCells([]);
    setFoundWords([]);
    setMessage("");
  }, [words]);

  function selectCell(
    symbol: string,
    rowIndex: number,
    colIndex: number
  ) {
    const cellId = `${rowIndex}-${colIndex}`;

    if (selectedCells.includes(cellId)) return;

    setSelected([...selected, symbol]);
    setSelectedCells([...selectedCells, cellId]);
    setMessage("");
  }

  function checkSelection() {
    const matchedWord = words.find((word) =>
      arraysMatch(tokeniseWord(word), selected)
    );

    if (matchedWord) {
      if (!foundWords.includes(matchedWord)) {
        setFoundWords([...foundWords, matchedWord]);
      }

      setMessage(`Found /${matchedWord}/!`);
    } else {
      setMessage("That selection is not one of the words.");
    }

    setSelected([]);
    setSelectedCells([]);
  }

  function clearSelection() {
    setSelected([]);
    setSelectedCells([]);
    setMessage("");
  }

  return (
    <div>
      <h3>Playable Preview</h3>

      <div className="word-search-grid">
        {grid.map((row, rowIndex) =>
          row.map((symbol, colIndex) => {
            const cellId = `${rowIndex}-${colIndex}`;
            const isSelected = selectedCells.includes(cellId);

            return (
              <button
                type="button"
                className={`word-search-cell ${
                  isSelected ? "selected" : ""
                }`}
                key={cellId}
                onClick={() =>
                  selectCell(symbol, rowIndex, colIndex)
                }
                aria-pressed={isSelected}
              >
                {symbol}
              </button>
            );
          })
        )}
      </div>

      <p>
        <strong>Selected:</strong>{" "}
        {selected.length > 0
          ? `/${selected.join(" ")}/`
          : "None"}
      </p>

      <div className="word-search-controls">
        <button type="button" onClick={checkSelection}>
          Check selection
        </button>

        <button type="button" onClick={clearSelection}>
          Clear
        </button>
      </div>

      {message && <p className="game-message">{message}</p>}

      <h4>Words to find</h4>

      <ul>
        {words.map((word, index) => (
          <li
            key={index}
            className={
              foundWords.includes(word) ? "found-word" : ""
            }
          >
            /{word}/
          </li>
        ))}
      </ul>
    </div>
  );
}