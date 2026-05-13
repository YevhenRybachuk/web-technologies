"use strict";

const DIFFICULTY_TIME = {
  easy: 180,
  normal: 120,
  hard: 60,
};

const EMOJIS = [
  "🍎",
  "🍌",
  "🍇",
  "🍓",
  "🍒",
  "🍉",
  "🥝",
  "🍍",
  "🥑",
  "🍑",
  "🍋",
  "🥥",
  "🍔",
  "🍕",
  "🍩",
  "🍪",
  "⚽",
  "🏀",
  "🎸",
  "🎯",
];

const DEFAULT_SETTINGS = {
  boardSize: "4x4",
  difficulty: "easy",
  playersCount: 1,
  rounds: 1,
  playerNames: ["Player 1", "Player 2"],
};

const shuffleArray = (array) =>
  [...array].reduceRight(
    (acc, _, i) => {
      const j = Math.floor(Math.random() * (i + 1));
      [acc[i], acc[j]] = [acc[j], acc[i]];
      return acc;
    },
    [...array],
  );

const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const isPair = (a, b) => a.value === b.value;

const nextPlayer = (current, count) => (current + 1) % count;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const parseSize = (sizeStr) => {
  const [rows, cols] = sizeStr.split("x").map(Number);
  return { rows, cols };
};

const createCards = (rows, cols) => {
  const total = rows * cols;
  const pairsCount = total / 2;
  const selected = EMOJIS.slice(0, pairsCount);
  const doubled = [...selected, ...selected];
  return shuffleArray(doubled).map((emoji, index) => ({
    id: index,
    value: emoji,
    flipped: false,
    matched: false,
  }));
};

const createPlayers = (names, count) =>
  Array.from({ length: count }, (_, i) => ({
    name: names[i] || `Player ${i + 1}`,
    pairs: 0,
    moves: 0,
  }));

const createGameState = (settings) => {
  const { rows, cols } = parseSize(settings.boardSize);
  return {
    cards: createCards(rows, cols),
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: (rows * cols) / 2,
    moves: 0,
    timer: DIFFICULTY_TIME[settings.difficulty],
    currentPlayer: 0,
    currentRound: 1,
    isRunning: false,
    lockBoard: false,
    rows,
    cols,
  };
};

const createInitialAppState = () => ({
  settings: { ...DEFAULT_SETTINGS },
  game: createGameState(DEFAULT_SETTINGS),
  players: createPlayers(
    DEFAULT_SETTINGS.playerNames,
    DEFAULT_SETTINGS.playersCount,
  ),
  statistics: [],
});

const flipCard = (state, id) => ({
  ...state,
  game: {
    ...state.game,
    cards: state.game.cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c,
    ),
    flippedCards: [
      ...state.game.flippedCards,
      state.game.cards.find((c) => c.id === id),
    ],
  },
});

const registerMove = (state) => ({
  ...state,
  game: { ...state.game, moves: state.game.moves + 1, lockBoard: true },
  players: state.players.map((p, i) =>
    i === state.game.currentPlayer ? { ...p, moves: p.moves + 1 } : p,
  ),
});

const matchCards = (state) => ({
  ...state,
  game: {
    ...state.game,
    cards: state.game.cards.map((c) =>
      state.game.flippedCards.some((f) => f.id === c.id)
        ? { ...c, matched: true, flipped: true }
        : c,
    ),
    flippedCards: [],
    matchedPairs: state.game.matchedPairs + 1,
    lockBoard: false,
  },
  players: state.players.map((p, i) =>
    i === state.game.currentPlayer ? { ...p, pairs: p.pairs + 1 } : p,
  ),
});

const unflipCards = (state) => ({
  ...state,
  game: {
    ...state.game,
    cards: state.game.cards.map((c) =>
      state.game.flippedCards.some((f) => f.id === c.id)
        ? { ...c, flipped: false }
        : c,
    ),
    flippedCards: [],
    lockBoard: false,
    currentPlayer:
      state.settings.playersCount === 2
        ? nextPlayer(state.game.currentPlayer, 2)
        : state.game.currentPlayer,
  },
});

const tickTimer = (state) => ({
  ...state,
  game: { ...state.game, timer: state.game.timer - 1 },
});

const setRunning = (state, isRunning) => ({
  ...state,
  game: { ...state.game, isRunning },
});

const advanceRound = (state, winner) => ({
  ...state,
  statistics: [
    ...state.statistics,
    {
      round: state.game.currentRound,
      winner,
      moves: state.game.moves,
      time: formatTime(state.game.timer),
    },
  ],
  game: {
    ...createGameState(state.settings),
    currentRound: state.game.currentRound + 1,
    isRunning: true,
  },
  players: createPlayers(
    state.settings.playerNames,
    state.settings.playersCount,
  ),
});

const startNewGame = (settings, currentRound = 1, statistics = []) => ({
  settings,
  game: {
    ...createGameState(settings),
    currentRound,
    isRunning: true,
  },
  players: createPlayers(settings.playerNames, settings.playersCount),
  statistics,
});

const determineRoundWinner = (players, playersCount) => {
  if (playersCount === 1) return players[0].name;
  if (players[0].pairs > players[1].pairs) return players[0].name;
  if (players[1].pairs > players[0].pairs) return players[1].name;
  return "Нічия";
};

const determineFinalWinner = (statistics, playersCount, playerNames) => {
  if (playersCount === 1) return playerNames[0];
  const wins = {};
  statistics.forEach(({ winner }) => {
    wins[winner] = (wins[winner] || 0) + 1;
  });
  const p1wins = wins[playerNames[0]] || 0;
  const p2wins = wins[playerNames[1]] || 0;
  if (p1wins > p2wins) return playerNames[0];
  if (p2wins > p1wins) return playerNames[1];
  return "Нічия";
};

let appState = createInitialAppState();
let timerInterval = null;

const $ = (sel) => document.querySelector(sel);

const gameBoard = $("#game-board");
const timerEl = $("#timer");
const movesEl = $("#moves");
const currentPlayerEl = $("#current-player");
const currentRoundEl = $("#current-round");
const startGameBtn = $("#start-game-btn");
const resetSettingsBtn = $("#reset-settings-btn");
const restartGameBtn = $("#restart-game-btn");
const boardSizeSelect = $("#board-size");
const difficultySelect = $("#difficulty");
const playersCountSel = $("#players-count");
const roundsInput = $("#rounds");
const player1Input = $("#player1-name");
const player2Input = $("#player2-name");
const player1Pairs = $("#player1-pairs");
const player2Pairs = $("#player2-pairs");
const player1Moves = $("#player1-moves");
const player2Moves = $("#player2-moves");
const scoreP1Name = $("#score-player1-name");
const scoreP2Name = $("#score-player2-name");
const resultsContainer = $("#results-container");
const finalModal = $("#final-modal");
const winnerText = $("#winner-text");
const closeModalBtn = $("#close-modal-btn");
const player2Section = $("#player2-section");
const scoreP2Block = $("#score-player2-block");

const initBoard = (state) => {
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${state.game.cols}, 120px)`;

  state.game.cards.forEach((card) => {
    const el = document.createElement("div");
    el.className = "card";
    el.dataset.id = card.id;

    el.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${card.value}</div>
      </div>`;

    el.addEventListener("click", () => handleCardClick(card.id));
    gameBoard.appendChild(el);
  });
};

const patchBoard = (state) => {
  state.game.cards.forEach((card) => {
    const el = gameBoard.querySelector(`[data-id="${card.id}"]`);
    if (!el) return;

    const shouldBeFlipped = card.flipped || card.matched;
    const isFlipped = el.classList.contains("flipped");
    const isMatched = el.classList.contains("matched");

    if (shouldBeFlipped && !isFlipped) {
      el.classList.add("flipped");
    } else if (!shouldBeFlipped && isFlipped) {
      el.classList.remove("flipped");
    }

    if (card.matched && !isMatched) {
      el.classList.add("matched");
    }
  });
};

const renderInfo = (state) => {
  timerEl.textContent = formatTime(state.game.timer);
  movesEl.textContent = state.game.moves;
  currentPlayerEl.textContent =
    state.players[state.game.currentPlayer]?.name ?? "";
  currentRoundEl.textContent = state.game.currentRound;
};

const renderScoreboard = (state) => {
  scoreP1Name.textContent = state.players[0]?.name ?? "Player 1";
  player1Pairs.textContent = state.players[0]?.pairs ?? 0;
  player1Moves.textContent = state.players[0]?.moves ?? 0;

  const show2 = state.settings.playersCount === 2;
  if (scoreP2Block) scoreP2Block.style.display = show2 ? "" : "none";

  if (show2) {
    scoreP2Name.textContent = state.players[1]?.name ?? "Player 2";
    player2Pairs.textContent = state.players[1]?.pairs ?? 0;
    player2Moves.textContent = state.players[1]?.moves ?? 0;
  }
};

const renderResults = (state) => {
  resultsContainer.innerHTML = "";
  state.statistics.forEach(({ round, winner, moves, time }) => {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <h3>Раунд ${round}</h3>
      <p>Переможець: <strong>${winner}</strong></p>
      <p>Ходи: ${moves}</p>
      <p>Залишок часу: ${time}</p>`;
    resultsContainer.appendChild(card);
  });
};

const renderPlayer2Input = (playersCount) => {
  if (player2Section) {
    player2Section.style.display = playersCount === 2 ? "" : "none";
  }
};

const stopTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};

const startTimer = () => {
  stopTimer();
  timerInterval = setInterval(() => {
    appState = tickTimer(appState);
    renderInfo(appState);

    if (appState.game.timer <= 0) {
      stopTimer();
      appState = setRunning(appState, false);
      showFinalModal(appState);
    }
  }, 1000);
};

const readSettings = () => ({
  boardSize: boardSizeSelect.value,
  difficulty: difficultySelect.value,
  playersCount: Number(playersCountSel.value),
  rounds: clamp(Number(roundsInput.value), 1, 99),
  playerNames: [
    player1Input.value.trim() || "Player 1",
    player2Input.value.trim() || "Player 2",
  ],
});

const applySettings = (settings) => {
  boardSizeSelect.value = settings.boardSize;
  difficultySelect.value = settings.difficulty;
  playersCountSel.value = settings.playersCount;
  roundsInput.value = settings.rounds;
  player1Input.value = settings.playerNames[0];
  player2Input.value = settings.playerNames[1];
  renderPlayer2Input(settings.playersCount);
};

const showFinalModal = (state) => {
  const winner = determineFinalWinner(
    state.statistics,
    state.settings.playersCount,
    state.settings.playerNames,
  );
  winnerText.textContent = `Переможець: ${winner}`;
  finalModal.classList.remove("hidden");
  renderResults(state);
};

const finishRound = (state) => {
  const winner = determineRoundWinner(
    state.players,
    state.settings.playersCount,
  );

  const newStats = [
    ...state.statistics,
    {
      round: state.game.currentRound,
      winner,
      moves: state.game.moves,
      time: formatTime(state.game.timer),
    },
  ];

  const updatedState = { ...state, statistics: newStats };
  renderResults(updatedState);

  if (state.game.currentRound < state.settings.rounds) {
    setTimeout(() => {
      appState = {
        ...updatedState,
        game: {
          ...createGameState(state.settings),
          currentRound: state.game.currentRound + 1,
          isRunning: true,
        },
        players: createPlayers(
          state.settings.playerNames,
          state.settings.playersCount,
        ),
      };
      initBoard(appState);
      renderInfo(appState);
      renderScoreboard(appState);
      startTimer();
    }, 1500);
  } else {
    appState = updatedState;
    showFinalModal(appState);
  }
};

const startGame = () => {
  stopTimer();
  const settings = readSettings();
  appState = startNewGame(settings);
  initBoard(appState);
  renderInfo(appState);
  renderScoreboard(appState);
  renderResults(appState);
  startTimer();
};

const restartGame = () => {
  stopTimer();
  appState = startNewGame(appState.settings);
  initBoard(appState);
  renderInfo(appState);
  renderScoreboard(appState);
  renderResults(appState);
  startTimer();
};

const handleCardClick = (id) => {
  const { game, settings, players } = appState;

  if (!game.isRunning) return;
  if (game.lockBoard) return;

  const card = game.cards.find((c) => c.id === id);
  if (!card || card.flipped || card.matched) return;

  appState = flipCard(appState, id);
  patchBoard(appState);

  if (appState.game.flippedCards.length < 2) return;

  appState = registerMove(appState);

  const [first, second] = appState.game.flippedCards;

  if (isPair(first, second)) {
    appState = matchCards(appState);
    patchBoard(appState);
    renderInfo(appState);
    renderScoreboard(appState);

    if (appState.game.matchedPairs === appState.game.totalPairs) {
      stopTimer();
      appState = setRunning(appState, false);
      finishRound(appState);
    }
  } else {
    renderInfo(appState);
    renderScoreboard(appState);

    setTimeout(() => {
      appState = unflipCards(appState);
      patchBoard(appState);
      renderInfo(appState);
    }, 1000);
  }
};

startGameBtn.addEventListener("click", startGame);

restartGameBtn.addEventListener("click", restartGame);

resetSettingsBtn.addEventListener("click", () => {
  applySettings(DEFAULT_SETTINGS);
});

closeModalBtn.addEventListener("click", () => {
  finalModal.classList.add("hidden");
});

playersCountSel.addEventListener("change", () => {
  renderPlayer2Input(Number(playersCountSel.value));
});

const init = () => {
  applySettings(DEFAULT_SETTINGS);
  renderInfo(appState);
  renderScoreboard(appState);
};

init();
