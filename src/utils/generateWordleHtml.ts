type WordleSettings = {
  phonemeWord: string;
  englishWord: string;
  guesses: number;
  showHints: boolean;
};

export function generateWordleHtml(settings: WordleSettings) {
  const answer = settings.phonemeWord
    .replaceAll("/", "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const phonemes = [
    "p",
    "b",
    "t",
    "d",
    "k",
    "g",
    "tʃ",
    "dʒ",
    "m",
    "n",
    "ŋ",
    "f",
    "v",
    "s",
    "z",
    "θ",
    "ð",
    "ʃ",
    "ʒ",
    "h",
    "l",
    "r",
    "w",
    "j",
    "ɪ",
    "iː",
    "e",
    "æ",
    "ʌ",
    "ə",
    "ɜː",
    "ɑː",
    "ɔː",
    "ʊ",
    "uː",
  ];

  const phonemeHints: Record<string, string> = {
    p: "P as in pin",
    b: "B as in bin",
    t: "T as in tin",
    d: "D as in din",
    k: "K as in cat",
    g: "G as in go",

    "tʃ": "CH as in chip",
    "dʒ": "J as in jam",

    m: "M as in man",
    n: "N as in net",
    ŋ: "NG as in sing",

    f: "F as in fan",
    v: "V as in van",
    s: "S as in sun",
    z: "Z as in zoo",

    θ: "TH as in thin",
    ð: "TH as in this",
    ʃ: "SH as in ship",
    ʒ: "S as in vision",

    h: "H as in hat",
    l: "L as in lip",
    r: "R as in red",
    w: "W as in wet",
    j: "Y as in yes",

    ɪ: "I as in sit",
    "iː": "EE as in see",
    e: "E as in bed",
    æ: "A as in cat",
    ʌ: "U as in cup",
    ə: "A as in about",
    "ɜː": "IR as in bird",
    "ɑː": "AR as in car",
    "ɔː": "OR as in thought",
    ʊ: "OO as in book",
    "uː": "OO as in food",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Phoneme Wordle</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f7fb;
      padding: 30px;
    }

    .game {
      max-width: 600px;
      margin: auto;
      background: white;
      padding: 30px;
      border-radius: 12px;
    }

    .row {
      display: flex;
      gap: 6px;
      margin-bottom: 6px;
    }

    .tile {
      width: 50px;
      height: 50px;
      border: 2px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 22px;
      font-weight: bold;
      border-radius: 5px;
    }

    .correct {
      background: green;
      color: white;
    }

    .wrong-place {
      background: orange;
      color: white;
    }

    .wrong {
      background: grey;
      color: white;
    }

    .keyboard {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 20px;
    }

    button {
      padding: 9px 12px;
      cursor: pointer;
    }

    #message {
      font-weight: bold;
      margin-top: 15px;
    }
  </style>
</head>

<body>

<div class="game">

  <h1>Phoneme Wordle</h1>

  <p>Select phonemes to guess the word.</p>

  <div id="grid"></div>

  <div id="keyboard" class="keyboard"></div>

  <br>

  <button onclick="deletePhoneme()">Delete</button>
  <button onclick="checkGuess()">Enter</button>

  <p id="message"></p>

</div>

<script>

  const answer = ${JSON.stringify(answer)};
  const phonemeWord = ${JSON.stringify(settings.phonemeWord)};
  const englishWord = ${JSON.stringify(settings.englishWord)};
  const maxGuesses = ${settings.guesses};

  const phonemes = ${JSON.stringify(phonemes)};
  const phonemeHints = ${JSON.stringify(phonemeHints)};
  const showHints = ${settings.showHints};

  let currentGuess = [];
  let previousGuesses = [];
  let gameFinished = false;

  function drawGrid() {
    const grid = document.getElementById("grid");

    grid.innerHTML = "";

    for (let row = 0; row < maxGuesses; row++) {

      const rowDiv = document.createElement("div");
      rowDiv.className = "row";

      let guess = [];

      if (previousGuesses[row]) {
        guess = previousGuesses[row];
      }
      else if (row === previousGuesses.length) {
        guess = currentGuess;
      }

      for (let column = 0; column < answer.length; column++) {

        const tile = document.createElement("div");
        tile.className = "tile";

        const symbol = guess[column] || "";

        tile.textContent = symbol;

        if (previousGuesses[row]) {

          if (symbol === answer[column]) {
            tile.classList.add("correct");
          }
          else if (answer.includes(symbol)) {
            tile.classList.add("wrong-place");
          }
          else {
            tile.classList.add("wrong");
          }

        }

        rowDiv.appendChild(tile);
      }

      grid.appendChild(rowDiv);
    }
  }

  function makeKeyboard() {
    const keyboard = document.getElementById("keyboard");

    phonemes.forEach(function(symbol) {

      const button = document.createElement("button");

      button.textContent = symbol;

      if (showHints && phonemeHints[symbol]) {
        button.title = phonemeHints[symbol];

        button.setAttribute(
          "aria-label",
          symbol + ": " + phonemeHints[symbol]
        );
      }

      button.onclick = function() {
        addPhoneme(symbol);
      };

      keyboard.appendChild(button);
    });
  }

  function addPhoneme(symbol) {

    if (gameFinished) return;

    if (currentGuess.length < answer.length) {
      currentGuess.push(symbol);
      drawGrid();
    }
  }

  function deletePhoneme() {

    if (gameFinished) return;

    currentGuess.pop();

    drawGrid();
  }

  function checkGuess() {

    const message = document.getElementById("message");

    if (currentGuess.length !== answer.length) {
      message.textContent =
        "Choose " + answer.length + " phonemes first.";

      return;
    }

    let correct = true;

    for (let i = 0; i < answer.length; i++) {

      if (currentGuess[i] !== answer[i]) {
        correct = false;
      }
    }

    previousGuesses.push([...currentGuess]);

    if (correct) {

      gameFinished = true;

      currentGuess = [];

      message.textContent =
        "Correct! " + phonemeWord + " = " + englishWord;

    }
    else if (previousGuesses.length >= maxGuesses) {

      gameFinished = true;

      currentGuess = [];

      message.textContent =
        "Game over. The answer was " +
        phonemeWord +
        " = " +
        englishWord;

    }
    else {

      currentGuess = [];

      message.textContent = "Try again.";
    }

    drawGrid();
  }

  drawGrid();
  makeKeyboard();

</script>

</body>
</html>
`;
}