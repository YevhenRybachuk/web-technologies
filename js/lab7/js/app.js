'use strict';

const gameState = {
  level: 1,
  maxLevel: 5,
  timeToDuel: 1125,
  ready: false,
  playerTime: 0,
  score: 0,
  gunmanFromLeft: false,
  currentGunmanLevel: 1
};

const startButton = document.querySelector('.button-start-game');
const restartButton = document.querySelector('.button-restart');
const gameMenu = document.querySelector('.game-menu');
const wrapper = document.querySelector('.wrapper');
const gamePanels = document.querySelector('.game-panels');
const gameScreen = document.querySelector('.game-screen');
const winScreen = document.querySelector('.win-screen');
const gunman = document.querySelector('.gunman');
const timeYou = document.querySelector('.time-panel__you');
const timeGunman = document.querySelector('.time-panel__gunman');
const showLevel = document.querySelector('.score-panel__level');
const scoreDiv = document.querySelector('.score-panel__score_num');
const message = document.querySelector('.message');

const sfx = {
  intro: new Audio('sfx/intro.m4a'),
  wait: new Audio('sfx/wait.m4a'),
  fire: new Audio('sfx/fire.m4a'),
  shot: new Audio('sfx/shot.m4a'),
  win: new Audio('sfx/win.m4a'),
  death: new Audio('sfx/death.m4a')
};

const calculateScore = (time, level, timeToDuel) =>
  Math.max(0, Math.floor((timeToDuel / 10 - time * 100) * level * 10));

const getRandomGunman = () => Math.floor(Math.random() * 5) + 1;

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

function startGame() {
  resetUI();

  gameState.gunmanFromLeft = Math.random() < 0.5;
  gameState.currentGunmanLevel = getRandomGunman();

  setupGunman();
  updatePanels();

  setTimeout(moveGunman, 500);
  gunman.addEventListener('mousedown', playerShoot);
}

function restartGame() {
  location.reload();
}

function resetUI() {
  gameMenu.style.display = 'none';
  wrapper.style.display = 'block';
  gamePanels.style.display = 'block';
  gameScreen.style.display = 'block';

  message.innerHTML = '';
  restartButton.style.display = 'none';

  gunman.className = 'gunman';
}

function updatePanels() {
  timeGunman.innerHTML = (gameState.timeToDuel / 1000).toFixed(2);
  timeYou.innerHTML = '0.00';
  showLevel.innerHTML = 'Level: ' + gameState.level;
  scoreDiv.innerHTML = gameState.score;
}

function setupGunman() {
  gunman.style.left = gameState.gunmanFromLeft ? '-130px' : '800px';

  if (gameState.gunmanFromLeft) {
    gunman.classList.add('flipped');
  }

  gunman.classList.add(`gunman-level-${gameState.currentGunmanLevel}`);

  gunman.addEventListener('transitionend', prepareForDuel, { once: true });
}

function moveGunman() {
  gunman.classList.add('moving');
  gunman.style.left = '340px';

  playLoop(sfx.intro);
}

function prepareForDuel() {
  stopAudio(sfx.intro);
  playLoop(sfx.wait);

  gunman.classList.remove('moving');
  gunman.classList.add('standing');

  setTimeout(() => {
    stopAudio(sfx.wait);

    gunman.classList.add(`gunman-level-${gameState.currentGunmanLevel}__ready`);
    message.classList.add('message--fire');
    sfx.fire.play();

    gameState.ready = true;

    startTimer();
    gunman.addEventListener('mousedown', playerShoot);

    setTimeout(gunmanShoot, gameState.timeToDuel);
  }, 1000);
}

function earlyShotLose() {
  gameState.ready = false;

  const currentLeft = window.getComputedStyle(gunman).left;

  gunman.classList.remove('moving');
  gunman.style.transition = 'none';
  gunman.style.left = currentLeft;

  sfx.shot.play();

  message.className = 'message message--dead';
  message.innerHTML = 'Too early!';

  gameScreen.classList.add('game-screen--death');

  setTimeout(() => {
    sfx.death.play();
    restartButton.style.display = 'block';
  }, 800);
}

function startTimer() {
  const start = Date.now();

  (function tick() {
    if (!gameState.ready) return;

    gameState.playerTime = ((Date.now() - start) / 1000);
    timeYou.innerHTML = gameState.playerTime.toFixed(2);

    requestAnimationFrame(tick);
  })();
}

function gunmanShoot() {
  if (!gameState.ready) return;

  gameState.ready = false;

  gunman.classList.add(`gunman-level-${gameState.currentGunmanLevel}__shooting`);

  setTimeout(() => {
    sfx.shot.play();
    message.className = 'message message--dead';
    message.innerHTML = 'You are dead!';
    gameScreen.classList.add('game-screen--death');
  }, 300);

  setTimeout(() => {
    sfx.death.play();
    restartButton.style.display = 'block';
  }, 1000);
}

function playerShoot() {
  if (!gameState.ready) {
    earlyShotLose();
    return;
  }

  gameState.ready = false;

  sfx.shot.play();
  stopAudio(sfx.wait);

  gunman.classList.add(`gunman-level-${gameState.currentGunmanLevel}__death`);

  const gained = calculateScore(
    gameState.playerTime,
    gameState.level,
    gameState.timeToDuel
  );

  gameState.score += gained;

  setTimeout(() => {
    message.className = 'message message--win';
    message.innerHTML = `You Win! +${gained}`;

    sfx.win.play();

    nextLevel();
  }, 800);
}

function nextLevel() {
  if (gameState.level >= gameState.maxLevel) {
    endGame();
    return;
  }

  setTimeout(() => {
    gameState.level++;
    gameState.timeToDuel = Math.max(
      200,
      Math.floor(gameState.timeToDuel * 0.65)
    );

    startGame();
  }, 1500);
}

function endGame() {
  gameScreen.style.display = 'none';
  gamePanels.style.display = 'none';
  winScreen.style.display = 'block';

  const title = document.querySelector('.win-screen__title');
  title.innerHTML = `
    You won! <br>
    Score: ${gameState.score}
  `;
}

function playLoop(audio) {
  audio.currentTime = 0;
  audio.loop = true;
  audio.play();
}

function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}
