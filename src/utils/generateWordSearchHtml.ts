type WordSearchSettings = {
  words: string[];
};

export function generateWordSearchHtml(
  settings: WordSearchSettings
) {
  const words = settings.words.map((word) =>
    word
      .replaceAll("/", "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  );

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Phoneme Word Search</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f7fb;
      padding: 30px;
    }

    .game {
      max-width: 650px;
      margin: auto;
      background: white;
      padding: 30px;
      border-radius: 12px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(9, 42px);
      gap: 5px;
      margin: 25px 0;
    }

    .cell {
      width: 42px;
      height: 42px;
      border: 1px solid #cbd5e1;
      background: white;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
    }

    .cell.selected {
      background: #2563eb;
      color: white;
    }

    button {
      padding: 9px 12px;
      cursor: pointer;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .found {
      text-decoration: line-through;
      font-weight: bold;
    }

    #message {
      font-weight: bold;
      margin-top: 15px;
    }

    @media (max-width: 600px) {
      .grid {
        grid-template-columns: repeat(9, 32px);
        gap: 3px;
      }

      .cell {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }
    }
  </style>
</head>

<body>

<div class="game">

  <h1>Phoneme Word Search</h1>

  <p>
    Find each phoneme word in the grid.
    Click the phonemes in order, then check your selection.
  </p>

  <div id="grid" class="grid"></div>

  <p>
    <strong>Selected:</strong>
    <span id="selectedText">None</span>
  </p>

  <div class="controls">
    <button onclick="checkSelection()">Check selection</button>
    <button onclick="clearSelection()">Clear</button>
  </div>

  <p id="message"></p>

  <h3>Words to find</h3>

  <ul id="wordList"></ul>

</div>

<script>

  const words = ${JSON.stringify(words)};

  const filler = [
    "p", "b", "t", "d", "k", "g",
    "tʃ", "dʒ",
    "m", "n", "ŋ",
    "f", "v", "s", "z",
    "θ", "ð", "ʃ", "ʒ",
    "h", "l", "r", "w", "j",
    "ɪ", "iː", "e", "æ", "ʌ", "ə",
    "ɜː", "ɑː", "ɔː", "ʊ", "uː"
  ];

  const gridSize = 9;

  let selected = [];
  let selectedCells = [];
  let foundWords = [];

  function arraysMatch(a, b) {
    return (
      a.length === b.length &&
      a.every(function(symbol, index) {
        return symbol === b[index];
      })
    );
  }

  function makeGrid() {

    const grid = [];

    for (let row = 0; row < gridSize; row++) {
      grid.push(new Array(gridSize).fill(""));
    }

    const directions = [
      [0, 1],
      [1, 0],
      [1, 1]
    ];

    words.forEach(function(word) {

      const phonemes = word;

      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 500) {

        attempts++;

        const direction =
          directions[Math.floor(Math.random() * directions.length)];

        const rowMove = direction[0];
        const colMove = direction[1];

        const startRow =
          Math.floor(Math.random() * gridSize);

        const startCol =
          Math.floor(Math.random() * gridSize);

        const endRow =
          startRow + rowMove * (phonemes.length - 1);

        const endCol =
          startCol + colMove * (phonemes.length - 1);

        if (
          endRow >= gridSize ||
          endCol >= gridSize
        ) {
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
        for (let row = 0; row < gridSize && !placed; row++) {
          for (
            let col = 0;
            col <= gridSize - phonemes.length;
            col++
          ) {
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

    for (let row = 0; row < gridSize; row++) {

      for (let col = 0; col < gridSize; col++) {

        if (grid[row][col] === "") {

          grid[row][col] =
            filler[Math.floor(Math.random() * filler.length)];

        }
      }
    }

    return grid;
  }

  const grid = makeGrid();

  function drawGrid() {

    const gridElement =
      document.getElementById("grid");

    gridElement.innerHTML = "";

    grid.forEach(function(row, rowIndex) {

      row.forEach(function(symbol, colIndex) {

        const button =
          document.createElement("button");

        button.className = "cell";
        button.textContent = symbol;

        const cellId =
          rowIndex + "-" + colIndex;

        if (selectedCells.includes(cellId)) {
          button.classList.add("selected");
        }

        button.onclick = function() {

          if (selectedCells.includes(cellId)) {
            return;
          }

          selected.push(symbol);
          selectedCells.push(cellId);

          updateSelectedText();
          drawGrid();
        };

        gridElement.appendChild(button);
      });
    });
  }

  function updateSelectedText() {

    const selectedText =
      document.getElementById("selectedText");

    if (selected.length === 0) {
      selectedText.textContent = "None";
    }
    else {
      selectedText.textContent =
        "/" + selected.join(" ") + "/";
    }
  }

  function checkSelection() {

    const message =
      document.getElementById("message");

    const matchedIndex =
      words.findIndex(function(word) {
        return arraysMatch(word, selected);
      });

    if (matchedIndex !== -1) {

      const wordKey =
        words[matchedIndex].join(" ");

      if (!foundWords.includes(wordKey)) {
        foundWords.push(wordKey);
      }

      message.textContent =
        "Found /" + wordKey + "/!";

      drawWordList();
    }
    else {
      message.textContent =
        "That selection is not one of the words.";
    }

    clearSelection(false);
  }

  function clearSelection(clearMessage = true) {

    selected = [];
    selectedCells = [];

    updateSelectedText();
    drawGrid();

    if (clearMessage) {
      document.getElementById("message").textContent = "";
    }
  }

  function drawWordList() {

    const list =
      document.getElementById("wordList");

    list.innerHTML = "";

    words.forEach(function(word) {

      const wordText = word.join(" ");

      const item =
        document.createElement("li");

      item.textContent =
        "/" + wordText + "/";

      if (foundWords.includes(wordText)) {
        item.className = "found";
      }

      list.appendChild(item);
    });
  }

  drawGrid();
  drawWordList();

</script>

</body>

</html>
`;
}