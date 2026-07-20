(() => {
  const homeScreen = document.getElementById("home-screen");
  const gameScreen = document.getElementById("game-screen");
  const startButton = document.getElementById("start-button");
  const menuButton = document.getElementById("menu-button");
  const pauseButton = document.getElementById("pause-button");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const overlayButton = document.getElementById("overlay-button");
  const scoreElement = document.getElementById("score");
  const bestElement = document.getElementById("best-score");
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;

  const gridSize = 20;
  const tileSize = canvas.width / gridSize;

  let snake = [];
  let koi = { x: 14, y: 10 };
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let score = 0;
  let bestScore = Number(localStorage.getItem("koiHuntBest") || 0);
  let gameRunning = false;
  let paused = false;
  let timer = null;
  let waterFrame = 0;

  bestElement.textContent = bestScore;

  const decorations = [
    { type: "weed", x: 1, y: 2 },
    { type: "weed", x: 17, y: 16 },
    { type: "weed", x: 2, y: 15 },
    { type: "lily", x: 16, y: 2 },
    { type: "lily", x: 3, y: 17 },
    { type: "lily", x: 17, y: 10 },
    { type: "shadow", x: 7, y: 4 },
    { type: "shadow", x: 12, y: 15 },
    { type: "shadow", x: 2, y: 9 }
  ];

  function stopGame() {
    gameRunning = false;
    paused = false;

    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function showHome() {
    stopGame();
    gameScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    overlay.classList.add("hidden");
    pauseButton.textContent = "PAUSE";
  }

  function showGame() {
    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
  }

  function startGame() {
    stopGame();
    showGame();

    snake = [
      { x: 7, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    paused = false;
    gameRunning = true;
    pauseButton.textContent = "PAUSE";
    overlay.classList.add("hidden");

    placeKoi();
    drawGame();

    timer = setInterval(updateGame, 125);
  }

  function updateGame() {
    if (!gameRunning || paused) return;

    waterFrame += 1;
    direction = nextDirection;

    const newHead = {
      x: (snake[0].x + direction.x + gridSize) % gridSize,
      y: (snake[0].y + direction.y + gridSize) % gridSize
    };

    const eatsKoi = newHead.x === koi.x && newHead.y === koi.y;
    const bodyToCheck = eatsKoi ? snake : snake.slice(0, -1);

    const bitesItself = bodyToCheck.some(
      segment => segment.x === newHead.x && segment.y === newHead.y
    );

    if (bitesItself) {
      endGame();
      return;
    }

    snake.unshift(newHead);

    if (eatsKoi) {
      score += 10;
      scoreElement.textContent = score;

      if (score > bestScore) {
        bestScore = score;
        bestElement.textContent = bestScore;
        localStorage.setItem("koiHuntBest", String(bestScore));
      }

      placeKoi();
    } else {
      snake.pop();
    }

    drawGame();
  }

  function endGame() {
    stopGame();
    overlayTitle.textContent = "SELF BITTEN";
    overlayText.textContent = `The anaconda caught its own body. Score: ${score}`;
    overlayButton.textContent = "PLAY AGAIN";
    overlayButton.dataset.action = "restart";
    overlay.classList.remove("hidden");
  }

  function togglePause() {
    if (!gameRunning) return;

    paused = !paused;

    if (paused) {
      pauseButton.textContent = "RESUME";
      overlayTitle.textContent = "PAUSED";
      overlayText.textContent = "Press Space or Continue to return to the pond.";
      overlayButton.textContent = "CONTINUE";
      overlayButton.dataset.action = "continue";
      overlay.classList.remove("hidden");
    } else {
      resumeGame();
    }
  }

  function resumeGame() {
    if (!gameRunning) return;

    paused = false;
    pauseButton.textContent = "PAUSE";
    overlay.classList.add("hidden");
  }

  function placeKoi() {
    let open = false;

    while (!open) {
      koi = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };

      open = !snake.some(
        segment => segment.x === koi.x && segment.y === koi.y
      );
    }
  }

  function setDirection(name) {
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    const candidate = directions[name];
    const reversing =
      candidate.x === -direction.x &&
      candidate.y === -direction.y;

    if (!reversing) {
      nextDirection = candidate;
    }
  }

  function drawGame() {
    drawWater();
    drawDecorations();
    drawKoi();
    drawSnake();
    drawBorder();
  }

  function drawWater() {
    ctx.fillStyle = "#078cc4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridSize; y += 1) {
      for (let x = 0; x < gridSize; x += 1) {
        const variation = (x * 5 + y * 7) % 5;

        if (variation === 0) ctx.fillStyle = "#0879aa";
        else if (variation === 1) ctx.fillStyle = "#0b96c5";
        else if (variation === 2) ctx.fillStyle = "#087fae";
        else ctx.fillStyle = "#078abd";

        ctx.fillRect(
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize
        );
      }
    }

    ctx.fillStyle = "rgba(5, 92, 91, 0.32)";

    for (let i = 0; i < 18; i += 1) {
      const x = ((i * 109) + waterFrame * 3) % canvas.width;
      const y = (i * 71) % canvas.height;
      ctx.fillRect(x, y, tileSize * 2, 6);
    }
  }

  function drawDecorations() {
    decorations.forEach(item => {
      const x = item.x * tileSize;
      const y = item.y * tileSize;

      if (item.type === "weed") {
        ctx.fillStyle = "#126650";
        ctx.fillRect(x + 3, y + 8, 5, 16);
        ctx.fillRect(x + 10, y + 2, 5, 22);
        ctx.fillRect(x + 17, y + 6, 5, 18);

        ctx.fillStyle = "#1b7656";
        ctx.fillRect(x + 2, y + 5, 9, 5);
        ctx.fillRect(x + 13, y, 9, 5);
      }

      if (item.type === "lily") {
        ctx.fillStyle = "#285d2b";
        ctx.fillRect(x + 2, y + 5, 20, 15);

        ctx.fillStyle = "#477b34";
        ctx.fillRect(x + 6, y + 2, 14, 16);

        ctx.fillStyle = "#078abd";
        ctx.fillRect(x + 14, y + 2, 5, 9);
      }

      if (item.type === "shadow") {
        ctx.fillStyle = "rgba(9, 78, 75, 0.35)";
        ctx.fillRect(x, y + 8, tileSize * 2, 7);
        ctx.fillRect(x + 10, y, tileSize, 6);
      }
    });
  }

  function drawSnake() {
    for (let index = snake.length - 1; index >= 0; index -= 1) {
      const segment = snake[index];
      const x = segment.x * tileSize;
      const y = segment.y * tileSize;

      if (index === 0) {
        drawHead(x, y);
      } else {
        drawBody(x, y, index);
      }
    }
  }

  function drawBody(x, y, index) {
    ctx.fillStyle = index % 2 === 0 ? "#075a3f" : "#08684a";
    ctx.fillRect(x + 1, y + 2, tileSize - 2, tileSize - 4);

    ctx.fillStyle = "#102e31";

    if (index % 3 === 0) {
      ctx.fillRect(x + 3, y + 4, 8, 16);
      ctx.fillRect(x + 15, y + 2, 6, 11);
    } else if (index % 3 === 1) {
      ctx.fillRect(x + 4, y + 5, 16, 7);
      ctx.fillRect(x + 10, y + 15, 10, 6);
    } else {
      ctx.fillRect(x + 5, y + 2, 7, 11);
      ctx.fillRect(x + 14, y + 10, 7, 12);
    }

    ctx.fillStyle = "#a99a55";

    if (index % 2 === 0) {
      ctx.fillRect(x + 4, y + 3, 5, 5);
      ctx.fillRect(x + 16, y + 16, 5, 5);
    } else {
      ctx.fillRect(x + 14, y + 4, 6, 5);
      ctx.fillRect(x + 5, y + 16, 5, 5);
    }
  }

  function drawHead(x, y) {
    ctx.fillStyle = "#07563d";
    ctx.fillRect(x + 1, y + 1, 22, 22);

    ctx.fillStyle = "#08724e";
    ctx.fillRect(x + 4, y + 4, 16, 16);

    ctx.fillStyle = "#173537";
    ctx.fillRect(x + 7, y + 7, 6, 6);
    ctx.fillRect(x + 14, y + 14, 6, 5);

    let eyeOne;
    let eyeTwo;

    if (direction.x === 1) {
      eyeOne = { x: x + 17, y: y + 5 };
      eyeTwo = { x: x + 17, y: y + 15 };
    } else if (direction.x === -1) {
      eyeOne = { x: x + 3, y: y + 5 };
      eyeTwo = { x: x + 3, y: y + 15 };
    } else if (direction.y === -1) {
      eyeOne = { x: x + 5, y: y + 3 };
      eyeTwo = { x: x + 15, y: y + 3 };
    } else {
      eyeOne = { x: x + 5, y: y + 17 };
      eyeTwo = { x: x + 15, y: y + 17 };
    }

    ctx.fillStyle = "#c3b262";
    ctx.fillRect(eyeOne.x, eyeOne.y, 5, 5);
    ctx.fillRect(eyeTwo.x, eyeTwo.y, 5, 5);

    ctx.fillStyle = "#111d1d";
    ctx.fillRect(eyeOne.x + 2, eyeOne.y + 1, 2, 3);
    ctx.fillRect(eyeTwo.x + 2, eyeTwo.y + 1, 2, 3);
  }

  function drawKoi() {
    const x = koi.x * tileSize;
    const y = koi.y * tileSize;

    ctx.fillStyle = "#f38550";
    ctx.fillRect(x + 7, y + 6, 11, 13);

    ctx.fillStyle = "#f6a268";
    ctx.fillRect(x + 3, y + 8, 6, 9);
    ctx.fillRect(x + 16, y + 3, 5, 6);
    ctx.fillRect(x + 16, y + 16, 5, 6);

    ctx.fillStyle = "#d95e3f";
    ctx.fillRect(x + 10, y + 8, 5, 5);

    ctx.fillStyle = "#172322";
    ctx.fillRect(x + 16, y + 9, 3, 3);
  }

  function drawBorder() {
    ctx.strokeStyle = "#16443a";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  }

  document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    const controls = {
      arrowup: "up",
      w: "up",
      arrowdown: "down",
      s: "down",
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right"
    };

    if (controls[key] && gameRunning && !paused) {
      event.preventDefault();
      setDirection(controls[key]);
    }

    if (event.code === "Space" && gameRunning) {
      event.preventDefault();
      togglePause();
    }
  });

  startButton.addEventListener("click", startGame);
  menuButton.addEventListener("click", showHome);
  pauseButton.addEventListener("click", togglePause);

  overlayButton.addEventListener("click", () => {
    if (overlayButton.dataset.action === "continue") {
      resumeGame();
    } else {
      startGame();
    }
  });

  showHome();
})();
