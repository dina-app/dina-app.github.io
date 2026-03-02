const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_STATE = {
  START: "start",
  RUNNING: "running",
  GAME_OVER: "gameover"
};

const gravity = 0.6;
const jumpForce = -10;
const maxFallSpeed = 12;

class Player {
  constructor() {
    this.width = 56;
    this.height = 38;
    this.x = 130;
    this.y = canvas.height / 2 - this.height / 2;
    this.velocityY = 0;
  }

  update(isHoldingJump) {
    if (isHoldingJump) {
      this.jump();
    }

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
  }

  draw() {
    const bodyX = this.x;
    const bodyY = this.y;

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

  update(timeMs) {
    this.x -= this.speed;

    if (this.type === "drone") {
      this.y += Math.sin(timeMs / 250 + this.offset) * 1.2;
      this.y = Math.max(30, Math.min(canvas.height - this.height - 30, this.y));
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
  }

  update() {
    this.x -= this.speed;
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

const game = {
  state: GAME_STATE.START,
  player: new Player(),
  obstacles: [],
  crystals: [],
  holdJump: false,
  score: 0,
  energy: 100,
  highScore: Number(localStorage.getItem("skyRunnerHighScore") || 0),
  startedAt: 0,
  lastFrameTime: 0,
  lastObstacleSpawnAt: 0,
  obstacleSpeed: 4,
  lastSpeedIncreaseMark: 0,
  cloudSeed: [...Array(7)].map((_, i) => ({
    x: i * 180 + 40,
    y: 40 + Math.random() * 180,
    r: 20 + Math.random() * 24,
    speed: 0.3 + Math.random() * 0.4
  }))
};

function resetRun(startTime) {
  game.player = new Player();
  game.obstacles = [];
  game.crystals = [];
  game.score = 0;
  game.energy = 100;
  game.startedAt = startTime;
  game.lastObstacleSpawnAt = startTime;
  game.obstacleSpeed = 4;
  game.lastSpeedIncreaseMark = 0;
  game.state = GAME_STATE.RUNNING;
}

function getSpawnInterval(secondsAlive) {
  return secondsAlive >= 60 ? 700 : 1500;
}

function createObstacle(timeMs, secondsAlive) {
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
    const crystalY = Math.max(26, y - 40);
    game.crystals.push(new Crystal(canvas.width + 70, crystalY, 13, game.obstacleSpeed));
  }

  const interval = getSpawnInterval(secondsAlive);
  game.lastObstacleSpawnAt = timeMs + (Math.random() * 220 - 110);
  return interval;
}

function update(timeMs) {
  if (game.state !== GAME_STATE.RUNNING) return;

  const elapsedMs = timeMs - game.startedAt;
  const secondsAlive = elapsedMs / 1000;
  game.score = Math.floor(secondsAlive);

  if (secondsAlive - game.lastSpeedIncreaseMark >= 20) {
    game.lastSpeedIncreaseMark += 20;
    game.obstacleSpeed += 0.5;
  }

  const spawnInterval = getSpawnInterval(secondsAlive);
  if (timeMs - game.lastObstacleSpawnAt >= spawnInterval) {
    createObstacle(timeMs, secondsAlive);
  }

  game.player.update(game.holdJump);

  for (const obstacle of game.obstacles) {
    obstacle.speed = game.obstacleSpeed;
    obstacle.update(timeMs);
    if (rectHit(game.player, obstacle)) {
      endGame();
      return;
    }
  }

  for (const crystal of game.crystals) {
    crystal.speed = game.obstacleSpeed;
    crystal.update();
    if (rectHit(
      { x: game.player.x, y: game.player.y, width: game.player.width, height: game.player.height },
      { x: crystal.x - crystal.size, y: crystal.y - crystal.size, width: crystal.size * 2, height: crystal.size * 2 }
    )) {
      game.score += 10;
      game.energy = Math.min(100, game.energy + 14);
      crystal.collected = true;
    }
  }

  game.energy = Math.max(0, game.energy - 0.08);
  if (game.energy <= 0) {
    endGame();
  }

  game.obstacles = game.obstacles.filter((o) => o.x + o.width > -40);
  game.crystals = game.crystals.filter((c) => !c.collected && c.x + c.size > -20);
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
}

function drawBackground(timeMs) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#caf1ff");
  sky.addColorStop(1, "#84cfff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  ctx.fillStyle = "rgba(81, 139, 178, 0.18)";
  for (let i = 0; i < 8; i += 1) {
    const w = 54 + i * 8;
    const h = 110 + ((i % 3) * 40);
    const x = ((i * 140 - (timeMs * 0.04)) % (canvas.width + 180)) - 120;
    const y = canvas.height - h;
    ctx.fillRect(x, y, w, h);
  }
}

function drawHud() {
  ctx.fillStyle = "rgba(8, 46, 73, 0.82)";
  ctx.font = "bold 28px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${game.score}`, 20, 40);

  ctx.textAlign = "right";
  ctx.fillText("Energy:", canvas.width - 175, 40);

  const bars = Math.max(0, Math.ceil(game.energy / 10));
  const meter = "█".repeat(bars).padEnd(10, "░");
  ctx.fillStyle = bars > 2 ? "#0a4f76" : "#c92748";
  ctx.fillText(meter, canvas.width - 20, 40);
}

function drawStartScreen() {
  drawOverlay("Sky Runner", `Tap to Start\nHigh Score: ${game.highScore}`);
}

function drawGameOverScreen() {
  drawOverlay("Game Over", `Score: ${game.score}\nHigh Score: ${game.highScore}\nTap to Restart`);
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = "rgba(7, 33, 54, 0.58)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f6fdff";
  ctx.font = "bold 64px Inter, sans-serif";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 50);

  ctx.font = "600 30px Inter, sans-serif";
  const lines = subtitle.split("\n");
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 12 + index * 42);
  });
}

function draw(timeMs) {
  drawBackground(timeMs);

  for (const obstacle of game.obstacles) obstacle.draw(timeMs);
  for (const crystal of game.crystals) crystal.draw(timeMs);
  game.player.draw();

  if (game.state === GAME_STATE.RUNNING) {
    drawHud();
  } else if (game.state === GAME_STATE.START) {
    drawStartScreen();
  } else if (game.state === GAME_STATE.GAME_OVER) {
    drawHud();
    drawGameOverScreen();
  }
}

function loop(timeMs) {
  if (!game.lastFrameTime) game.lastFrameTime = timeMs;
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
  }
  setJumpPressed(true);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    activate();
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

requestAnimationFrame(loop);
