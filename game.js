// Rock Paper Scissors
const rpsButtons = document.querySelectorAll('.rps-btn');
const rpsResult = document.getElementById('rpsResult');
const moves = ['rock', 'paper', 'scissors'];

function decideRps(player, cpu) {
  if (player === cpu) return "It's a draw!";
  const wins = (player === 'rock' && cpu === 'scissors')
    || (player === 'paper' && cpu === 'rock')
    || (player === 'scissors' && cpu === 'paper');
  return wins ? 'You win! 🎉' : 'Computer wins! 🤖';
}

rpsButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const playerMove = button.dataset.move;
    const cpuMove = moves[Math.floor(Math.random() * moves.length)];
    const outcome = decideRps(playerMove, cpuMove);
    rpsResult.textContent = `You: ${playerMove} | CPU: ${cpuMove} — ${outcome}`;
  });
});

// Number Guess
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const guessReset = document.getElementById('guessReset');
const guessResult = document.getElementById('guessResult');

let secret = Math.floor(Math.random() * 100) + 1;
let attemptsLeft = 10;

function resetGuessGame() {
  secret = Math.floor(Math.random() * 100) + 1;
  attemptsLeft = 10;
  guessInput.value = '';
  guessResult.textContent = 'You have 10 attempts.';
}

guessBtn.addEventListener('click', () => {
  const guess = Number(guessInput.value);
  if (!guess || guess < 1 || guess > 100) {
    guessResult.textContent = 'Enter a valid number from 1 to 100.';
    return;
  }

  attemptsLeft -= 1;

  if (guess === secret) {
    guessResult.textContent = `Correct! The number was ${secret}. Press Reset to play again.`;
    return;
  }

  if (attemptsLeft <= 0) {
    guessResult.textContent = `Out of attempts! It was ${secret}. Press Reset to retry.`;
    return;
  }

  guessResult.textContent = guess < secret
    ? `Too low. Attempts left: ${attemptsLeft}`
    : `Too high. Attempts left: ${attemptsLeft}`;
});

guessReset.addEventListener('click', resetGuessGame);

// Memory Match
const memoryBoard = document.getElementById('memoryBoard');
const memoryResult = document.getElementById('memoryResult');
const symbols = ['🍕', '🚀', '🎮', '🐶', '🎧', '⚽'];

let cards = [];
let selected = [];
let lockBoard = false;
let matchedCount = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setupMemory() {
  cards = shuffle([...symbols, ...symbols]);
  selected = [];
  matchedCount = 0;
  lockBoard = false;
  memoryBoard.innerHTML = '';
  memoryResult.textContent = 'Match all cards to win.';

  cards.forEach((symbol, index) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    btn.dataset.symbol = symbol;
    btn.dataset.index = String(index);
    btn.textContent = '❓';
    btn.addEventListener('click', onCardClick);
    memoryBoard.appendChild(btn);
  });
}

function onCardClick(event) {
  if (lockBoard) return;
  const card = event.currentTarget;
  if (card.classList.contains('matched') || card.classList.contains('revealed')) return;

  card.classList.add('revealed');
  card.textContent = card.dataset.symbol;
  selected.push(card);

  if (selected.length < 2) return;

  const [first, second] = selected;
  if (first.dataset.symbol === second.dataset.symbol) {
    first.classList.add('matched');
    second.classList.add('matched');
    selected = [];
    matchedCount += 2;

    if (matchedCount === cards.length) {
      memoryResult.textContent = 'You matched them all! Refresh page for a new board.';
    }
    return;
  }

  lockBoard = true;
  setTimeout(() => {
    first.classList.remove('revealed');
    second.classList.remove('revealed');
    first.textContent = '❓';
    second.textContent = '❓';
    selected = [];
    lockBoard = false;
  }, 700);
}

setupMemory();
