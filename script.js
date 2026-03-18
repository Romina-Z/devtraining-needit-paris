const splashScreen = document.getElementById("splash-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const statusText = document.getElementById("status-text");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const world = {
  width: canvas.width,
  height: canvas.height,
  laneY: canvas.height - 42,
  running: false,
  gameOver: false,
  paused: false,
  score: 0,
  lives: 3,
  speedScale: 1,
  keys: {
    left: false,
    right: false
  },
  player: {
    x: canvas.width / 2 - 18,
    y: canvas.height - 74,
    width: 36,
    height: 32,
    speed: 5.5
  },
  obstacles: [],
  obstacleSpawnTimer: 0
};

function showGameScreen() {
  splashScreen.classList.remove("active");
  gameScreen.classList.add("active");
  gameScreen.setAttribute("aria-hidden", "false");
}

function showSplashScreen(message = "RUN!") {
  splashScreen.classList.add("active");
  gameScreen.classList.remove("active");
  gameScreen.setAttribute("aria-hidden", "true");
  statusText.textContent = message;
}

function resetGame() {
  world.running = true;
  world.gameOver = false;
  world.paused = false;
  world.score = 0;
  world.lives = 3;
  world.speedScale = 1;
  world.player.x = world.width / 2 - world.player.width / 2;
  world.obstacles = [];
  world.obstacleSpawnTimer = 25;
  updateHud();
}

function startGame() {
  showGameScreen();
  resetGame();
  drawFrame();
}

function updateHud() {
  scoreElement.textContent = String(world.score);
  livesElement.textContent = String(world.lives);
}

function spawnObstacle() {
  const size = 18 + Math.random() * 28;
  const speed = (2 + Math.random() * 2) * world.speedScale;
  world.obstacles.push({
    x: world.width + size,
    y: world.laneY - size,
    width: size,
    height: size,
    speed
  });
}

function movePlayer() {
  if (world.keys.left) {
    world.player.x -= world.player.speed;
  }
  if (world.keys.right) {
    world.player.x += world.player.speed;
  }
  if (world.player.x < 0) {
    world.player.x = 0;
  }
  if (world.player.x + world.player.width > world.width) {
    world.player.x = world.width - world.player.width;
  }
}

function hasCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateObstacles() {
  world.obstacleSpawnTimer -= 1;
  if (world.obstacleSpawnTimer <= 0) {
    spawnObstacle();
    world.obstacleSpawnTimer = Math.max(12, 35 - Math.floor(world.speedScale * 6));
  }

  world.obstacles.forEach((obstacle) => {
    obstacle.x -= obstacle.speed;
  });

  world.obstacles = world.obstacles.filter((obstacle) => {
    if (hasCollision(world.player, obstacle)) {
      world.lives -= 1;
      updateHud();
      if (world.lives <= 0) {
        world.gameOver = true;
      }
      return false;
    }
    return obstacle.x + obstacle.width > -4;
  });
}

function updateScore() {
  world.score += 1;
  world.speedScale = 1 + world.score / 1500;
  updateHud();
}

function drawBackground() {
  ctx.clearRect(0, 0, world.width, world.height);

  for (let i = 0; i < world.height; i += 4) {
    const alpha = 0.06 + (i / world.height) * 0.08;
    ctx.fillStyle = `rgba(41, 242, 255, ${alpha})`;
    ctx.fillRect(0, i, world.width, 1);
  }

  ctx.fillStyle = "#1d123d";
  ctx.fillRect(0, world.laneY, world.width, world.height - world.laneY);

  ctx.strokeStyle = "rgba(255, 79, 216, 0.35)";
  for (let x = 0; x < world.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, world.laneY);
    ctx.lineTo(x + 12, world.laneY + 18);
    ctx.stroke();
  }
}

function drawPlayer() {
  const p = world.player;
  ctx.fillStyle = "#ffdd67";
  ctx.fillRect(p.x, p.y, p.width, p.height);
  ctx.fillStyle = "#c77d00";
  ctx.fillRect(p.x + 6, p.y + 7, p.width - 12, p.height - 14);
  ctx.fillStyle = "#111";
  ctx.fillRect(p.x + 8, p.y + p.height - 7, 7, 4);
  ctx.fillRect(p.x + p.width - 15, p.y + p.height - 7, 7, 4);
}

function drawObstacles() {
  world.obstacles.forEach((o) => {
    ctx.fillStyle = "#ff4fd8";
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.fillStyle = "#5b0c50";
    ctx.fillRect(o.x + 4, o.y + 4, o.width - 8, o.height - 8);
  });
}

function drawOverlayText() {
  if (!world.paused && !world.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(5, 2, 14, 0.65)";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = "#f7f5ff";
  ctx.textAlign = "center";
  ctx.font = "26px Courier New";
  const text = world.gameOver ? "GAME OVER" : "PAUSED";
  ctx.fillText(text, world.width / 2, world.height / 2 - 10);
  ctx.font = "16px Courier New";
  const subText = world.gameOver ? "Press Enter to return to splash" : "Press P to continue";
  ctx.fillText(subText, world.width / 2, world.height / 2 + 20);
}

function drawFrame() {
  drawBackground();
  drawPlayer();
  drawObstacles();
  drawOverlayText();
}

function tick() {
  if (world.running && !world.paused && !world.gameOver) {
    movePlayer();
    updateObstacles();
    updateScore();
  }

  drawFrame();
  requestAnimationFrame(tick);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    world.keys.left = true;
  }
  if (key === "arrowright" || key === "d") {
    world.keys.right = true;
  }

  if (key === "p" && world.running && !world.gameOver) {
    world.paused = !world.paused;
    statusText.textContent = world.paused ? "PAUSED" : "RUN!";
  }

  if ((key === " " || key === "enter") && splashScreen.classList.contains("active")) {
    startGame();
  }

  if (key === "enter" && world.gameOver) {
    world.running = false;
    showSplashScreen("TRY AGAIN!");
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "a") {
    world.keys.left = false;
  }
  if (key === "arrowright" || key === "d") {
    world.keys.right = false;
  }
}

startButton.addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

showSplashScreen("PRESS START");
tick();
