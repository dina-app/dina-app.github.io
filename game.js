const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const GAME_STATE = {
  START: "start",
  RUNNING: "running",
  PAUSED: "paused",
  GAME_OVER: "gameover"
};

const gravity = 0.6;
const jumpForce = -10;
const maxFallSpeed = 12;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

class Player {
  constructor() {
    this.width = 56;
    this.height = 38;
    this.x = 130;
    this.y = canvas.height / 2 - this.height / 2;
    this.velocityY = 0;
    this.shieldTimer = 0;
  }

  update(isHoldingJump) {
    if (isHoldingJump) this.jump();

    this.velocityY += gravity;
    this.velocityY = Math.min(this.velocityY, maxFallSpeed);
    this.y += this.velocityY;

    if (this.y < 0) {
      this.y = 0;
      this.velocityY = 0;
    }

    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.velocityY = 0;
    }

    this.shieldTimer = Math.max(0, this.shieldTimer - 1 / 60);
  }

  draw(timeMs) {
    const bodyX = this.x;
    const bodyY = this.y;

    if (this.shieldTimer > 0) {
      const glow = 0.35 + 0.2 * Math.sin(timeMs / 100);
      ctx.fillStyle = `rgba(46, 200, 255, ${glow})`;
      ctx.beginPath();
      ctx.arc(bodyX + this.width / 2, bodyY + this.height / 2, 34, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#f8fdff";
    ctx.strokeStyle = "#2a7cc9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bodyX, bodyY, this.width, this.height, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2ec8ff";
    ctx.fillRect(bodyX + 12, bodyY + 10, 30, 14);

    ctx.fillStyle = "#0b3359";
    ctx.beginPath();
    ctx.arc(bodyX + this.width - 12, bodyY + this.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#56d7ff";
    ctx.beginPath();
    ctx.moveTo(bodyX - 8, bodyY + this.height / 2);
    ctx.lineTo(bodyX - 22, bodyY + this.height / 2 - 7);
    ctx.lineTo(bodyX - 22, bodyY + this.height / 2 + 7);
    ctx.closePath();
    ctx.fill();
  }

  jump() {
    this.velocityY = jumpForce;
  }
}

class Obstacle {
  constructor(x, y, width, height, speed, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.type = type;
    this.offset = Math.random() * Math.PI * 2;
  }

  update(timeMs, speedModifier) {
    this.x -= this.speed * speedModifier;

    if (this.type === "drone") {
      this.y += Math.sin(timeMs / 250 + this.offset) * 1.2;
      this.y = clamp(this.y, 30, canvas.height - this.height - 30);
    }
  }

  draw(timeMs) {
    ctx.save();

    if (this.type === "laser") {
      const pulse = 0.55 + 0.45 * Math.sin(timeMs / 100);
      ctx.fillStyle = `rgba(255, 80, 80, ${pulse})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "#2d333b";
      ctx.fillRect(this.x - 6, this.y - 10, 8, this.height + 20);
      ctx.fillRect(this.x + this.width - 2, this.y - 10, 8, this.height + 20);
    } else if (this.type === "drone") {
      ctx.fillStyle = "#2f3a45";
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, 8);
      ctx.fill();
      ctx.fillStyle = "#7f8b96";
      ctx.fillRect(this.x + 5, this.y + 8, this.width - 10, 6);
      ctx.fillRect(this.x + 5, this.y + this.height - 14, this.width - 10, 6);
    } else {
      ctx.fillStyle = "#2f3a45";
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, 6);
      ctx.fill();
      ctx.fillStyle = "#53616d";
      ctx.fillRect(this.x + 6, this.y + 6, this.width - 12, this.height - 12);
    }

    ctx.restore();
  }
}

class Crystal {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.collected = false;
  }

  update(speedModifier) {
    this.x -= this.speed * speedModifier;
  }

  draw(timeMs) {
    const pulse = 0.75 + 0.25 * Math.sin(timeMs / 130);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(timeMs / 700);
    ctx.fillStyle = `rgba(0, 248, 255, ${pulse})`;
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size * 0.68, 0);
    ctx.lineTo(0, this.size);
    ctx.lineTo(-this.size * 0.68, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

class PowerUp {
  constructor(x, y, type, speed) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 16;
    this.speed = speed;
    this.collected = false;
  }

  update(speedModifier) {
    this.x -= this.speed * speedModifier;
  }

  draw(timeMs) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(timeMs / 900);

    const isShield = this.type === "shield";
    ctx.fillStyle = isShield ? "#35c7ff" : "#f7c54c";
    ctx.strokeStyle = isShield ? "#f0feff" : "#fff5d2";
    ctx.lineWidth = 2;

    if (isShield) {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#08395f";
      ctx.font = "bold 16px Inter";
      ctx.textAlign = "center";
      ctx.fillText("S", 0, 6);
    } else {
      ctx.beginPath();
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(0, -this.size);
      ctx.lineTo(this.size, 0);
      ctx.lineTo(0, this.size);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#6f5100";
      ctx.font = "bold 16px Inter";
      ctx.textAlign = "center";
      ctx.fillText("M", 0, 6);
    }

    ctx.restore();
  }
}

const game = {
  state: GAME_STATE.START,
  player: new Player(),
  obstacles: [],
  crystals: [],
  powerUps: [],
  holdJump: false,
  score: 0,
  bonusScore: 0,
  energy: 100,
  highScore: Number(localStorage.getItem("skyRunnerHighScore") || 0),
  startedAt: 0,
  pausedAt: 0,
  lastFrameTime: 0,
  lastObstacleSpawnAt: 0,
  obstacleSpeed: 4,
  level: 1,
  lastSpeedIncreaseMark: 0,
  slowMotionTimer: 0,
  cloudSeed: [...Array(8)].map((_, i) => ({
    x: i * 170 + 60,
    y: 28 + Math.random() * 200,
    r: 18 + Math.random() * 24,
    speed: 0.2 + Math.random() * 0.4
  })),
  stars: [...Array(24)].map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 1 + Math.random() * 2
  }))
};

function resetRun(startTime) {
  game.player = new Player();
  game.obstacles = [];
  game.crystals = [];
  game.powerUps = [];
  game.score = 0;
  game.bonusScore = 0;
  game.energy = 100;
  game.level = 1;
  game.startedAt = startTime;
  game.lastObstacleSpawnAt = startTime;
  game.obstacleSpeed = 4;
  game.lastSpeedIncreaseMark = 0;
  game.slowMotionTimer = 0;
  game.state = GAME_STATE.RUNNING;
  pauseBtn.textContent = "Pause";
}

function getSpawnInterval(secondsAlive) {
  return secondsAlive >= 60 ? 700 : 1500;
}

function createObstacle(timeMs) {
  const typeRoll = Math.random();
  const type = typeRoll < 0.34 ? "block" : typeRoll < 0.67 ? "laser" : "drone";

  let width = 36;
  let height = 90;
  let y = canvas.height - height;

  if (type === "laser") {
    width = 16;
    height = 140;
    y = 20 + Math.random() * (canvas.height - height - 40);
  } else if (type === "drone") {
    width = 56;
    height = 34;
    y = 40 + Math.random() * (canvas.height - height - 80);
  } else {
    width = 44 + Math.random() * 26;
    height = 44 + Math.random() * 90;
    y = canvas.height - height;
  }

  game.obstacles.push(new Obstacle(canvas.width + 30, y, width, height, game.obstacleSpeed, type));

  if (Math.random() < 0.3) {
    const crystalY = clamp(y - 40, 30, canvas.height - 40);
    game.crystals.push(new Crystal(canvas.width + 70, crystalY, 13, game.obstacleSpeed));
  }

  if (Math.random() < 0.08) {
    const powerType = Math.random() < 0.5 ? "shield" : "slow";
    const pY = 50 + Math.random() * (canvas.height - 120);
    game.powerUps.push(new PowerUp(canvas.width + 95, pY, powerType, game.obstacleSpeed));
  }

  game.lastObstacleSpawnAt = timeMs + (Math.random() * 240 - 120);
}

function speedModifier() {
  return game.slowMotionTimer > 0 ? 0.5 : 1;
}

function update(timeMs) {
  if (game.state !== GAME_STATE.RUNNING) return;

  const elapsedMs = timeMs - game.startedAt;
  const secondsAlive = elapsedMs / 1000;
  game.score = Math.floor(secondsAlive) + game.bonusScore;

  if (secondsAlive >= game.level * 30) {
    game.level += 1;
    game.obstacleSpeed += 1;
  }

  if (secondsAlive - game.lastSpeedIncreaseMark >= 20) {
    game.lastSpeedIncreaseMark += 20;
    game.obstacleSpeed += 0.5;
  }

  const spawnInterval = getSpawnInterval(secondsAlive);
  if (timeMs - game.lastObstacleSpawnAt >= spawnInterval) {
    createObstacle(timeMs);
  }

  game.player.update(game.holdJump);

  if (game.slowMotionTimer > 0) {
    game.slowMotionTimer = Math.max(0, game.slowMotionTimer - 1 / 60);
  }

  const modifier = speedModifier();

  for (const obstacle of game.obstacles) {
    obstacle.speed = game.obstacleSpeed;
    obstacle.update(timeMs, modifier);

    if (rectHit(game.player, obstacle) && game.player.shieldTimer <= 0) {
      endGame();
      return;
    }
  }

  for (const crystal of game.crystals) {
    crystal.speed = game.obstacleSpeed;
    crystal.update(modifier);
    const crystalRect = {
      x: crystal.x - crystal.size,
      y: crystal.y - crystal.size,
      width: crystal.size * 2,
      height: crystal.size * 2
    };

    if (rectHit(game.player, crystalRect)) {
      crystal.collected = true;
      game.bonusScore += 10;
      game.energy = Math.min(100, game.energy + 14);
    }
  }

  for (const powerUp of game.powerUps) {
    powerUp.speed = game.obstacleSpeed;
    powerUp.update(modifier);
    const pRect = {
      x: powerUp.x - powerUp.size,
      y: powerUp.y - powerUp.size,
      width: powerUp.size * 2,
      height: powerUp.size * 2
    };

    if (rectHit(game.player, pRect)) {
      powerUp.collected = true;
      if (powerUp.type === "shield") {
        game.player.shieldTimer = 5;
      } else {
        game.slowMotionTimer = 3;
      }
      game.bonusScore += 5;
    }
  }

  game.energy = Math.max(0, game.energy - (game.slowMotionTimer > 0 ? 0.04 : 0.08));
  if (game.energy <= 0) {
    endGame();
    return;
  }

  game.obstacles = game.obstacles.filter((o) => o.x + o.width > -40);
  game.crystals = game.crystals.filter((c) => !c.collected && c.x + c.size > -20);
  game.powerUps = game.powerUps.filter((p) => !p.collected && p.x + p.size > -20);
}

function rectHit(player, obstacle) {
  return (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  );
}

function endGame() {
  game.state = GAME_STATE.GAME_OVER;
  if (game.score > game.highScore) {
    game.highScore = game.score;
    localStorage.setItem("skyRunnerHighScore", String(game.highScore));
  }
  pauseBtn.textContent = "Pause";
}

function drawBackground(timeMs) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#ddf7ff");
  sky.addColorStop(1, "#7ac9ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of game.stars) {
    const alpha = 0.15 + 0.12 * Math.sin((timeMs + star.x * 4) / 430);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  for (const cloud of game.cloudSeed) {
    cloud.x -= cloud.speed;
    if (cloud.x < -80) cloud.x = canvas.width + 80;

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.r * 0.75, cloud.y + 5, cloud.r * 0.85, 0, Math.PI * 2);
    ctx.arc(cloud.x - cloud.r * 0.8, cloud.y + 7, cloud.r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(53, 110, 152, 0.18)";
  for (let i = 0; i < 10; i += 1) {
    const width = 42 + i * 9;
    const height = 85 + (i % 4) * 38;
    const x = ((i * 120 - (timeMs * 0.05 * speedModifier())) % (canvas.width + 180)) - 140;
    const y = canvas.height - height;
    ctx.fillRect(x, y, width, height);
  }
}

function drawHud() {
  const bars = Math.max(0, Math.ceil(game.energy / 10));
  const meter = "█".repeat(bars).padEnd(10, "░");

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(7, 44, 68, 0.9)";
  ctx.font = "bold 26px Inter, sans-serif";
  ctx.fillText(`Score: ${game.score}`, 18, 36);
  ctx.fillText(`Level: ${game.level}`, 18, 68);

  ctx.textAlign = "right";
  ctx.fillText(`High: ${game.highScore}`, canvas.width - 18, 36);
  ctx.fillStyle = bars > 2 ? "#085f93" : "#cf1a4d";
  ctx.fillText(`Energy ${meter}`, canvas.width - 18, 68);

  if (game.player.shieldTimer > 0 || game.slowMotionTimer > 0) {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.font = "bold 20px Inter, sans-serif";
    const shield = game.player.shieldTimer > 0 ? `Shield ${game.player.shieldTimer.toFixed(1)}s` : "";
    const slow = game.slowMotionTimer > 0 ? `Slow ${game.slowMotionTimer.toFixed(1)}s` : "";
    ctx.fillText(`${shield} ${slow}`.trim(), canvas.width / 2, 36);
  }
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = "rgba(8, 31, 50, 0.56)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f7feff";
  ctx.font = "700 62px Inter, sans-serif";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 56);

  ctx.font = "600 28px Inter, sans-serif";
  subtitle.split("\n").forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, canvas.height / 2 + index * 40 + 8);
  });
}

function drawStartScreen() {
  drawOverlay("Sky Runner", `Tap to Start\nHigh Score: ${game.highScore}`);
}

function drawPauseScreen() {
  drawOverlay("Paused", "Tap or press Space to resume");
}

function drawGameOverScreen() {
  drawOverlay("Game Over", `Score: ${game.score}\nHigh Score: ${game.highScore}\nTap to Restart`);
}

function draw(timeMs) {
  drawBackground(timeMs);

  for (const obstacle of game.obstacles) obstacle.draw(timeMs);
  for (const crystal of game.crystals) crystal.draw(timeMs);
  for (const powerUp of game.powerUps) powerUp.draw(timeMs);
  game.player.draw(timeMs);

  drawHud();

  if (game.state === GAME_STATE.START) {
    drawStartScreen();
  } else if (game.state === GAME_STATE.PAUSED) {
    drawPauseScreen();
  } else if (game.state === GAME_STATE.GAME_OVER) {
    drawGameOverScreen();
  }
}

function loop(timeMs) {
  if (!game.lastFrameTime) game.lastFrameTime = timeMs;
  game.lastFrameTime = timeMs;
  update(timeMs);
  draw(timeMs);
  requestAnimationFrame(loop);
}

function setJumpPressed(pressed) {
  game.holdJump = pressed;
}

function activate() {
  if (game.state === GAME_STATE.START || game.state === GAME_STATE.GAME_OVER) {
    resetRun(performance.now());
  } else if (game.state === GAME_STATE.PAUSED) {
    game.state = GAME_STATE.RUNNING;
    game.startedAt += performance.now() - game.pausedAt;
    pauseBtn.textContent = "Pause";
  }
  setJumpPressed(true);
}

function togglePause() {
  if (game.state === GAME_STATE.RUNNING) {
    game.state = GAME_STATE.PAUSED;
    game.pausedAt = performance.now();
    pauseBtn.textContent = "Resume";
  } else if (game.state === GAME_STATE.PAUSED) {
    game.state = GAME_STATE.RUNNING;
    game.startedAt += performance.now() - game.pausedAt;
    pauseBtn.textContent = "Pause";
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    activate();
  }

  if (event.key.toLowerCase() === "p") {
    togglePause();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    setJumpPressed(false);
  }
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  activate();
});

window.addEventListener("pointerup", () => setJumpPressed(false));
window.addEventListener("pointercancel", () => setJumpPressed(false));

pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", () => resetRun(performance.now()));

requestAnimationFrame(loop);
