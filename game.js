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

if (rpsButtons.length && rpsResult) {
  rpsButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const playerMove = button.dataset.move;
      const cpuMove = moves[Math.floor(Math.random() * moves.length)];
      const outcome = decideRps(playerMove, cpuMove);
      rpsResult.textContent = `You: ${playerMove} | CPU: ${cpuMove} — ${outcome}`;
    });
  });
}

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

if (guessInput && guessBtn && guessReset && guessResult) {
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
}

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

if (memoryBoard && memoryResult) {
  setupMemory();
}

// Princess Color Match
const colorButtons = document.querySelectorAll('.color-btn');
const dressPreview = document.getElementById('dressPreview');
const dressResult = document.getElementById('dressResult');

const dressThemes = {
  pink: { emoji: '👗', text: 'Pretty pink princess style selected!' },
  purple: { emoji: '🪻👗', text: 'Royal purple sparkle selected!' },
  gold: { emoji: '✨👗', text: 'Golden glam look selected!' },
};

if (colorButtons.length && dressPreview && dressResult) {
  colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const theme = dressThemes[button.dataset.theme];
      dressPreview.textContent = theme.emoji;
      dressResult.textContent = theme.text;
    });
  });
}

// Pet Name Sparkle
const petNameBtn = document.getElementById('petNameBtn');
const petNameResult = document.getElementById('petNameResult');
const petNames = ['Starry Puff', 'Luna Sprinkles', 'Candy Blossom', 'Twinkle Paws', 'Peachy Fluff'];

if (petNameBtn && petNameResult) {
  petNameBtn.addEventListener('click', () => {
    const randomName = petNames[Math.floor(Math.random() * petNames.length)];
    petNameResult.textContent = `Your magical pet name is: ${randomName} ✨`;
  });
}

// Space Reaction Dash
const reactionBtn = document.getElementById('reactionBtn');
const reactionResult = document.getElementById('reactionResult');
let reactionStart = 0;
let reactionTimeout;

if (reactionBtn && reactionResult) {
  reactionBtn.textContent = 'Start Round';
  reactionBtn.classList.remove('waiting');

  reactionBtn.addEventListener('click', () => {
    if (reactionBtn.classList.contains('ready')) {
      const reactionMs = Date.now() - reactionStart;
      reactionResult.textContent = `Reaction time: ${reactionMs} ms. Click to play again.`;
      reactionBtn.textContent = 'Start Round';
      reactionBtn.classList.remove('ready');
      return;
    }

    if (reactionBtn.classList.contains('waiting')) {
      clearTimeout(reactionTimeout);
      reactionBtn.classList.remove('waiting');
      reactionBtn.textContent = 'Start Round';
      reactionResult.textContent = 'Too early! Wait for green signal.';
      return;
    }

    reactionBtn.classList.add('waiting');
    reactionBtn.textContent = 'Wait for green...';
    reactionResult.textContent = 'Get ready...';

    reactionTimeout = setTimeout(() => {
      reactionBtn.classList.remove('waiting');
      reactionBtn.classList.add('ready');
      reactionBtn.textContent = 'CLICK NOW!';
      reactionStart = Date.now();
    }, 1000 + Math.random() * 2500);
  });
}

// Power Click Challenge
const clickStartBtn = document.getElementById('clickStartBtn');
const clickTapBtn = document.getElementById('clickTapBtn');
const clickResult = document.getElementById('clickResult');

if (clickStartBtn && clickTapBtn && clickResult) {
  let clickCount = 0;
  let active = false;

  clickStartBtn.addEventListener('click', () => {
    if (active) return;

    active = true;
    clickCount = 0;
    clickTapBtn.disabled = false;
    clickResult.textContent = 'Go! Tap as fast as you can!';

    setTimeout(() => {
      active = false;
      clickTapBtn.disabled = true;
      clickResult.textContent = `Time! You scored ${clickCount} taps in 5 seconds.`;
    }, 5000);
  });

  clickTapBtn.addEventListener('click', () => {
    if (!active) return;
    clickCount += 1;
    clickResult.textContent = `Taps: ${clickCount}`;
  });
}

// Neon 3D Arena Strike (raycast mini FPS)
const arenaCanvas = document.getElementById('arenaCanvas');
const arenaHud = document.getElementById('arenaHud');

if (arenaCanvas && arenaHud) {
  const ctx = arenaCanvas.getContext('2d');
  const map = [
    '1111111111111111',
    '1000000000100001',
    '1011110110101101',
    '1000010000000101',
    '1011011110110101',
    '1001000010000001',
    '1101011011111101',
    '1000010000000001',
    '1011110111111101',
    '1000000000000001',
    '1111111111111111',
  ];

  const FOV = Math.PI / 3;
  const MOVE_SPEED = 2.7;
  const ROTATE_SPEED = 0.0024;
  const MAX_DEPTH = 18;

  const player = {
    x: 2.5,
    y: 2.5,
    angle: 0,
    hp: 100,
    score: 0,
  };

  const enemies = [
    { x: 12.5, y: 2.5, alive: true, cooldown: 0 },
    { x: 8.5, y: 8.5, alive: true, cooldown: 0 },
    { x: 3.5, y: 9.2, alive: true, cooldown: 0 },
    { x: 13.2, y: 7.6, alive: true, cooldown: 0 },
  ];

  const keys = { w: false, a: false, s: false, d: false };
  const bullets = [];
  let lastTime = performance.now();
  let gameOver = false;

  function isWall(x, y) {
    const mx = Math.floor(x);
    const my = Math.floor(y);
    if (my < 0 || my >= map.length || mx < 0 || mx >= map[0].length) return true;
    return map[my][mx] === '1';
  }

  function castRay(rayAngle) {
    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);
    let depth = 0;
    while (depth < MAX_DEPTH) {
      const x = player.x + cos * depth;
      const y = player.y + sin * depth;
      if (isWall(x, y)) {
        return { depth, x, y };
      }
      depth += 0.02;
    }
    return { depth: MAX_DEPTH, x: player.x + cos * MAX_DEPTH, y: player.y + sin * MAX_DEPTH };
  }

  function canSee(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.ceil(distance * 8);
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      const x = a.x + dx * t;
      const y = a.y + dy * t;
      if (isWall(x, y)) return false;
    }
    return true;
  }

  function movePlayer(dt) {
    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const sideX = Math.cos(player.angle + Math.PI / 2);
    const sideY = Math.sin(player.angle + Math.PI / 2);

    let vx = 0;
    let vy = 0;
    if (keys.w) { vx += dirX; vy += dirY; }
    if (keys.s) { vx -= dirX; vy -= dirY; }
    if (keys.a) { vx -= sideX; vy -= sideY; }
    if (keys.d) { vx += sideX; vy += sideY; }

    const len = Math.hypot(vx, vy) || 1;
    vx = (vx / len) * MOVE_SPEED * dt;
    vy = (vy / len) * MOVE_SPEED * dt;

    const nx = player.x + vx;
    const ny = player.y + vy;
    if (!isWall(nx, player.y)) player.x = nx;
    if (!isWall(player.x, ny)) player.y = ny;
  }

  function updateEnemies(dt) {
    enemies.forEach((enemy) => {
      if (!enemy.alive || gameOver) return;
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2.2) {
        const speed = 1.1 * dt;
        const nx = enemy.x + (dx / dist) * speed;
        const ny = enemy.y + (dy / dist) * speed;
        if (!isWall(nx, enemy.y)) enemy.x = nx;
        if (!isWall(enemy.x, ny)) enemy.y = ny;
      }

      enemy.cooldown -= dt;
      if (enemy.cooldown <= 0 && canSee(enemy, player) && dist < 9) {
        player.hp -= 6;
        enemy.cooldown = 1.2 + Math.random() * 1.1;
      }
    });
  }

  function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      const b = bullets[i];
      b.x += Math.cos(b.angle) * b.speed * dt;
      b.y += Math.sin(b.angle) * b.speed * dt;
      b.life -= dt;

      if (b.life <= 0 || isWall(b.x, b.y)) {
        bullets.splice(i, 1);
        continue;
      }

      for (let j = 0; j < enemies.length; j += 1) {
        const enemy = enemies[j];
        if (!enemy.alive) continue;
        if (Math.hypot(enemy.x - b.x, enemy.y - b.y) < 0.35) {
          enemy.alive = false;
          bullets.splice(i, 1);
          player.score += 100;
          break;
        }
      }
    }
  }

  function drawScene() {
    const w = arenaCanvas.width;
    const h = arenaCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#121a42');
    sky.addColorStop(1, '#1f2f74');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.55);

    const floor = ctx.createLinearGradient(0, h * 0.55, 0, h);
    floor.addColorStop(0, '#121212');
    floor.addColorStop(1, '#020202');
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    for (let x = 0; x < w; x += 1) {
      const rayAngle = player.angle - FOV / 2 + (x / w) * FOV;
      const hit = castRay(rayAngle);
      const correctedDepth = hit.depth * Math.cos(rayAngle - player.angle);
      const wallHeight = Math.min(h, (h * 0.9) / Math.max(0.001, correctedDepth));
      const y = (h - wallHeight) / 2;

      const shade = Math.max(15, 240 - correctedDepth * 16);
      ctx.fillStyle = `rgb(${shade * 0.36}, ${shade * 0.7}, ${shade})`;
      ctx.fillRect(x, y, 1, wallHeight);
    }

    const sprites = [];
    enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.hypot(dx, dy);
      const angleToEnemy = Math.atan2(dy, dx) - player.angle;
      let normalizedAngle = angleToEnemy;
      while (normalizedAngle < -Math.PI) normalizedAngle += Math.PI * 2;
      while (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
      if (Math.abs(normalizedAngle) < FOV / 2 + 0.15) {
        sprites.push({ enemy, dist, angle: normalizedAngle });
      }
    });

    sprites.sort((a, b) => b.dist - a.dist);
    sprites.forEach((sprite) => {
      const size = Math.min(h * 0.9, (h * 0.6) / Math.max(0.2, sprite.dist));
      const sx = (0.5 + sprite.angle / FOV) * w;
      const sy = h / 2 - size / 2;

      ctx.fillStyle = 'rgba(255, 70, 70, 0.9)';
      ctx.fillRect(sx - size / 2, sy, size, size);
      ctx.fillStyle = '#ffefef';
      ctx.fillRect(sx - size * 0.16, sy + size * 0.22, size * 0.1, size * 0.1);
      ctx.fillRect(sx + size * 0.06, sy + size * 0.22, size * 0.1, size * 0.1);
    });

    bullets.forEach((b) => {
      const dx = b.x - player.x;
      const dy = b.y - player.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) - player.angle;
      if (Math.abs(angle) > FOV / 2 || dist <= 0.1) return;
      const size = Math.max(2, 60 / dist);
      const sx = (0.5 + angle / FOV) * w;
      const sy = h / 2;
      ctx.fillStyle = '#7cfffd';
      ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 10, h / 2);
    ctx.lineTo(w / 2 + 10, h / 2);
    ctx.moveTo(w / 2, h / 2 - 10);
    ctx.lineTo(w / 2, h / 2 + 10);
    ctx.stroke();

    const aliveCount = enemies.filter((e) => e.alive).length;
    if (player.hp <= 0) {
      gameOver = true;
      arenaHud.textContent = `Mission failed. Score: ${player.score}. Refresh to restart.`;
    } else if (aliveCount === 0) {
      gameOver = true;
      arenaHud.textContent = `Arena cleared! Score: ${player.score}. Refresh to play again.`;
    } else {
      arenaHud.textContent = `HP: ${Math.max(0, Math.round(player.hp))} | Enemies: ${aliveCount} | Score: ${player.score}`;
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (!gameOver) {
      movePlayer(dt);
      updateEnemies(dt);
      updateBullets(dt);
    }
    drawScene();
    requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = true;
  });

  document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = false;
  });

  arenaCanvas.addEventListener('click', () => {
    if (document.pointerLockElement !== arenaCanvas) {
      arenaCanvas.requestPointerLock();
    } else if (!gameOver) {
      bullets.push({
        x: player.x,
        y: player.y,
        angle: player.angle,
        speed: 11,
        life: 1.2,
      });
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== arenaCanvas || gameOver) return;
    player.angle += event.movementX * ROTATE_SPEED;
  });

  requestAnimationFrame(loop);
}

// Unity 3D vs HTML5 Showdown
const stackOptionsHost = document.getElementById('stackOptions');
const stackQuestionTitle = document.getElementById('stackQuestionTitle');
const stackProgress = document.getElementById('stackProgress');
const stackResult = document.getElementById('stackResult');
const stackRestartBtn = document.getElementById('stackRestartBtn');
const unityScoreEl = document.getElementById('unityScore');
const html5ScoreEl = document.getElementById('html5Score');

if (
  stackOptionsHost
  && stackQuestionTitle
  && stackProgress
  && stackResult
  && stackRestartBtn
  && unityScoreEl
  && html5ScoreEl
) {
  const stackQuestions = [
    {
      prompt: 'What platform matters most for launch?',
      options: [
        { text: 'Mobile + desktop app stores', unity: 2, html5: 0 },
        { text: 'Instant browser play with no install', unity: 0, html5: 2 },
      ],
    },
    {
      prompt: 'How advanced is your 3D requirement?',
      options: [
        { text: 'High-end 3D, dynamic lighting, heavy scenes', unity: 2, html5: 0 },
        { text: 'Mostly 2D or lightweight 3D', unity: 0, html5: 2 },
      ],
    },
    {
      prompt: 'What is your dev team strongest in?',
      options: [
        { text: 'C# and game-engine workflows', unity: 2, html5: 0 },
        { text: 'JavaScript/TypeScript and web stacks', unity: 0, html5: 2 },
      ],
    },
    {
      prompt: 'How important is rapid web iteration?',
      options: [
        { text: 'Very important: push updates quickly via web', unity: 0, html5: 2 },
        { text: 'Less important: app store release cadence is okay', unity: 2, html5: 0 },
      ],
    },
    {
      prompt: 'What monetization model fits best?',
      options: [
        { text: 'Premium app / in-app purchases in stores', unity: 2, html5: 0 },
        { text: 'Ad-supported web game / instant reach', unity: 0, html5: 2 },
      ],
    },
  ];

  let currentQuestion = 0;
  let unityScore = 0;
  let html5Score = 0;

  function updateScores() {
    unityScoreEl.textContent = String(unityScore);
    html5ScoreEl.textContent = String(html5Score);
  }

  function renderFinal() {
    stackOptionsHost.innerHTML = '';
    stackQuestionTitle.textContent = 'Recommendation ready!';
    stackProgress.textContent = 'Completed 5 of 5 questions.';

    if (unityScore === html5Score) {
      stackResult.textContent = 'Tie! Pick based on team skills: Unity for deeper 3D, HTML5 for faster web shipping.';
      return;
    }

    if (unityScore > html5Score) {
      stackResult.textContent = 'Winner: Unity 3D 🏆 Best for advanced 3D, multi-platform exports, and engine tooling.';
      return;
    }

    stackResult.textContent = 'Winner: HTML5 🏆 Best for instant play, quick updates, and browser-first distribution.';
  }

  function nextQuestion() {
    if (currentQuestion >= stackQuestions.length) {
      renderFinal();
      return;
    }

    const q = stackQuestions[currentQuestion];
    stackQuestionTitle.textContent = q.prompt;
    stackProgress.textContent = `Question ${currentQuestion + 1} of ${stackQuestions.length}`;
    stackResult.textContent = 'Choose the option that fits your game plan.';
    stackOptionsHost.innerHTML = '';

    q.options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'stack-option-btn';
      button.type = 'button';
      button.textContent = option.text;
      button.addEventListener('click', () => {
        unityScore += option.unity;
        html5Score += option.html5;
        currentQuestion += 1;
        updateScores();
        nextQuestion();
      });
      stackOptionsHost.appendChild(button);
    });
  }

  stackRestartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    unityScore = 0;
    html5Score = 0;
    updateScores();
    nextQuestion();
  });

  updateScores();
  nextQuestion();
}
