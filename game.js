(() => {
  const app = document.getElementById("koi-hunt");
  const screens = {
    home: document.getElementById("home-screen"),
    collection: document.getElementById("collection-screen"),
    settings: document.getElementById("settings-screen"),
    credits: document.getElementById("credits-screen"),
    game: document.getElementById("game-screen")
  };

  const playButton = document.getElementById("play-button");
  const collectionButton = document.getElementById("collection-button");
  const settingsButton = document.getElementById("settings-button");
  const creditsButton = document.getElementById("credits-button");
  const menuButton = document.getElementById("menu-button");
  const pauseButton = document.getElementById("pause-button");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const overlayButton = document.getElementById("overlay-button");
  const scoreElement = document.getElementById("score");
  const bestElement = document.getElementById("best-score");
  const worldLabel = document.getElementById("world-label");
  const animationToggle = document.getElementById("animation-toggle");
  const scanlineToggle = document.getElementById("scanline-toggle");

  const gameCanvas = document.getElementById("game-canvas");
  const ctx = gameCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const menuCanvas = document.getElementById("menu-canvas");
  const menuCtx = menuCanvas.getContext("2d");
  menuCtx.imageSmoothingEnabled = false;

  const gridSize = 20;
  const tileSize = gameCanvas.width / gridSize;

  const themes = {
    anacondaPond: {
      name: "ANACONDA POND",
      targetName: "KOI",
      background: "pond",
      snakeStyle: "anaconda",
      unlockScore: 0,
      snake: {
        main: "#075a3f",
        alt: "#08684a",
        light: "#08724e",
        dark: "#102e31",
        accent: "#a99a55",
        eye: "#c3b262"
      },
      target: {
        main: "#f38550",
        light: "#f6a268",
        dark: "#d95e3f"
      }
    },
    bambooBallPython: {
      name: "BAMBOO BALL PYTHON",
      targetName: "GREY MOUSE",
      background: "grass",
      snakeStyle: "bamboo",
      unlockScore: 200,
      snake: {
        main: "#757c7b",
        alt: "#8b918e",
        light: "#b7bab5",
        dark: "#49352e",
        accent: "#5b4035",
        white: "#eeeae1",
        eye: "#172222"
      },
      target: {
        main: "#777b7d",
        light: "#a8aaab",
        dark: "#3f4244",
        pink: "#d78e96"
      }
    }
  };

  let selectedThemeKey = localStorage.getItem("koiHuntTheme") || "anacondaPond";
  if (selectedThemeKey === "thornbackTrail") selectedThemeKey = "anacondaPond";
  if (!themes[selectedThemeKey]) selectedThemeKey = "anacondaPond";

  let snake = [];
  let target = { x: 14, y: 10 };
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let score = 0;
  let gameRunning = false;
  let paused = false;
  let timer = null;
  let animationFrame = 0;
  let animateBackground = localStorage.getItem("koiHuntAnimate") !== "false";

  const bestScores = JSON.parse(localStorage.getItem("koiHuntBestScores") || "{}");
  const BAMBOO_UNLOCK_SCORE = 200;

  function highestScore() {
    return Math.max(0, ...Object.values(bestScores).map(value => Number(value) || 0));
  }

  function bambooUnlocked() {
    return highestScore() >= BAMBOO_UNLOCK_SCORE;
  }

  function ensureValidSelectedTheme() {
    if (selectedThemeKey === "bambooBallPython" && !bambooUnlocked()) {
      selectedThemeKey = "anacondaPond";
      localStorage.setItem("koiHuntTheme", selectedThemeKey);
    }
  }

  ensureValidSelectedTheme();
  if (!themeUnlocked(selectedThemeKey)) {
    selectedThemeKey = "anacondaPond";
    localStorage.setItem("koiHuntTheme", selectedThemeKey);
  }

  const pondDecorations = [
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

  const grassDecorations = [
    { type: "tuft", x: 1, y: 2 },
    { type: "tuft", x: 17, y: 16 },
    { type: "tuft", x: 3, y: 13 },
    { type: "flower", x: 15, y: 3 },
    { type: "flower", x: 7, y: 16 },
    { type: "stone", x: 2, y: 17 },
    { type: "stone", x: 18, y: 8 },
    { type: "patch", x: 9, y: 5 },
    { type: "patch", x: 13, y: 14 }
  ];

  function currentTheme() {
    return themes[selectedThemeKey];
  }

  function bambooUnlocked() {
    return Number(bestScores.anacondaPond || 0) >= 200;
  }

  function themeUnlocked(key) {
    return key === "anacondaPond" || bambooUnlocked();
  }

  function showScreen(name) {
    Object.values(screens).forEach(screen => screen.classList.add("hidden"));
    screens[name].classList.remove("hidden");

    if (name === "home") drawMenuScene();
    if (name === "collection") drawThemePreviews();
  }

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
    overlay.classList.add("hidden");
    pauseButton.textContent = "PAUSE";
    showScreen("home");
  }

  function startGame() {
    stopGame();
    showScreen("game");

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
    bestElement.textContent = bestScores[selectedThemeKey] || 0;
    worldLabel.textContent = currentTheme().name;
    paused = false;
    gameRunning = true;
    pauseButton.textContent = "PAUSE";
    overlay.classList.add("hidden");

    placeTarget();
    drawGame();
    timer = setInterval(updateGame, 125);
  }

  function updateGame() {
    if (!gameRunning || paused) return;

    if (animateBackground) animationFrame += 1;
    direction = nextDirection;

    const newHead = {
      x: (snake[0].x + direction.x + gridSize) % gridSize,
      y: (snake[0].y + direction.y + gridSize) % gridSize
    };

    const eatsTarget = newHead.x === target.x && newHead.y === target.y;
    const bodyToCheck = eatsTarget ? snake : snake.slice(0, -1);
    const bitesItself = bodyToCheck.some(
      segment => segment.x === newHead.x && segment.y === newHead.y
    );

    if (bitesItself) {
      endGame();
      return;
    }

    snake.unshift(newHead);

    if (eatsTarget) {
      score += 10;
      scoreElement.textContent = score;

      if (score > (bestScores[selectedThemeKey] || 0)) {
        bestScores[selectedThemeKey] = score;
        bestElement.textContent = score;
        localStorage.setItem("koiHuntBestScores", JSON.stringify(bestScores));

        if (score >= BAMBOO_UNLOCK_SCORE) {
          drawThemePreviews();
        }
      }

      placeTarget();
    } else {
      snake.pop();
    }

    drawGame();
  }

  function endGame() {
    stopGame();
    overlayTitle.textContent = "SELF BITTEN";
    overlayText.textContent = `THE SNAKE CAUGHT ITS OWN BODY. SCORE: ${score}`;
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
      overlayText.textContent = "PRESS SPACE OR CONTINUE TO RETURN.";
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

  function placeTarget() {
    let open = false;
    while (!open) {
      target = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
      open = !snake.some(segment => segment.x === target.x && segment.y === target.y);
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
    const reversing = candidate.x === -direction.x && candidate.y === -direction.y;
    if (!reversing) nextDirection = candidate;
  }

  function drawGame() {
    drawWorldBackground(ctx, gameCanvas.width, gameCanvas.height, currentTheme().background, animationFrame);
    drawWorldDecorations(ctx, currentTheme().background, tileSize, false);
    drawTarget(ctx, target.x * tileSize, target.y * tileSize, currentTheme(), tileSize);
    drawSnake(ctx, snake, currentTheme(), tileSize, direction);
    ctx.strokeStyle = currentTheme().background === "pond" ? "#16443a" : "#324e2b";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, gameCanvas.width - 8, gameCanvas.height - 8);
  }

  function drawWorldBackground(context, width, height, kind, frame = 0) {
    if (kind === "pond") {
      context.fillStyle = "#078cc4";
      context.fillRect(0, 0, width, height);
      const cell = width / 20;
      for (let y = 0; y < 20; y += 1) {
        for (let x = 0; x < 20; x += 1) {
          const v = (x * 5 + y * 7) % 5;
          context.fillStyle = v === 0 ? "#0879aa" : v === 1 ? "#0b96c5" : v === 2 ? "#087fae" : "#078abd";
          context.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      context.fillStyle = "rgba(5,92,91,.30)";
      for (let i = 0; i < 18; i += 1) {
        const x = ((i * 109) + frame * 3) % width;
        const y = (i * 71) % height;
        context.fillRect(x, y, cell * 2, Math.max(4, cell / 4));
      }
    } else {
      context.fillStyle = "#6f9840";
      context.fillRect(0, 0, width, height);
      const cell = width / 20;
      for (let y = 0; y < 20; y += 1) {
        for (let x = 0; x < 20; x += 1) {
          const v = (x * 7 + y * 11) % 6;
          context.fillStyle = v === 0 ? "#5f8737" : v === 1 ? "#7ca448" : v === 2 ? "#688f3d" : "#739b42";
          context.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      context.fillStyle = "rgba(55,96,40,.28)";
      for (let i = 0; i < 24; i += 1) {
        const x = ((i * 83) + frame * 2) % width;
        const y = (i * 53) % height;
        context.fillRect(x, y, cell, Math.max(3, cell / 5));
      }
    }
  }

  function drawWorldDecorations(context, kind, cell, preview) {
    const scale = preview ? cell : tileSize;
    const items = kind === "pond" ? pondDecorations : grassDecorations;

    items.forEach(item => {
      const x = item.x * scale;
      const y = item.y * scale;

      if (kind === "pond") {
        if (item.type === "weed") {
          context.fillStyle = "#126650";
          context.fillRect(x + scale * .12, y + scale * .34, scale * .2, scale * .66);
          context.fillRect(x + scale * .4, y + scale * .08, scale * .2, scale * .92);
          context.fillRect(x + scale * .7, y + scale * .25, scale * .18, scale * .75);
        }
        if (item.type === "lily") {
          context.fillStyle = "#285d2b";
          context.fillRect(x + scale * .08, y + scale * .2, scale * .84, scale * .62);
          context.fillStyle = "#477b34";
          context.fillRect(x + scale * .25, y + scale * .08, scale * .6, scale * .66);
          context.fillStyle = "#078abd";
          context.fillRect(x + scale * .58, y + scale * .08, scale * .2, scale * .35);
        }
        if (item.type === "shadow") {
          context.fillStyle = "rgba(9,78,75,.35)";
          context.fillRect(x, y + scale * .35, scale * 2, scale * .28);
        }
      } else {
        if (item.type === "tuft") {
          context.fillStyle = "#365f2e";
          context.fillRect(x + scale * .1, y + scale * .35, scale * .18, scale * .65);
          context.fillRect(x + scale * .4, y + scale * .1, scale * .18, scale * .9);
          context.fillRect(x + scale * .7, y + scale * .28, scale * .18, scale * .72);
        }
        if (item.type === "flower") {
          context.fillStyle = "#e4d06a";
          context.fillRect(x + scale * .35, y + scale * .35, scale * .3, scale * .3);
          context.fillStyle = "#eee0a1";
          context.fillRect(x + scale * .2, y + scale * .42, scale * .18, scale * .16);
          context.fillRect(x + scale * .62, y + scale * .42, scale * .18, scale * .16);
        }
        if (item.type === "stone") {
          context.fillStyle = "#586754";
          context.fillRect(x + scale * .12, y + scale * .3, scale * .76, scale * .48);
          context.fillStyle = "#75806e";
          context.fillRect(x + scale * .28, y + scale * .18, scale * .48, scale * .34);
        }
        if (item.type === "patch") {
          context.fillStyle = "rgba(47,95,42,.28)";
          context.fillRect(x, y + scale * .3, scale * 2, scale * .3);
        }
      }
    });
  }

  function drawSnake(context, segments, theme, cell, facing) {
    for (let index = segments.length - 1; index >= 0; index -= 1) {
      const segment = segments[index];
      const x = segment.x * cell;
      const y = segment.y * cell;
      if (index === 0) drawSnakeHead(context, x, y, theme, cell, facing);
      else drawSnakeBody(context, x, y, index, theme, cell);
    }
  }

  function drawSnakeBody(context, x, y, index, theme, cell) {
    const pad = Math.max(1, cell * .05);
    context.fillStyle = index % 2 === 0 ? theme.snake.main : theme.snake.alt;
    context.fillRect(x + pad, y + cell * .08, cell - pad * 2, cell * .84);

    context.fillStyle = theme.snake.dark;
    if (theme.name === "BAMBOO BALL PYTHON") {
      // Irregular dark-brown bamboo pattern over a silver-grey body.
      context.fillRect(x + cell * .12, y + cell * .08, cell * .18, cell * .84);
      context.fillRect(x + cell * .62, y + cell * .02, cell * .2, cell * .6);
      context.fillRect(x + cell * .28, y + cell * .38, cell * .5, cell * .16);
      context.fillStyle = theme.snake.accent;
      context.fillRect(x + cell * .04, y + cell * .18, cell * .25, cell * .18);
      context.fillRect(x + cell * .74, y + cell * .66, cell * .24, cell * .2);
      if (index % 2 === 0) {
        context.fillRect(x + cell * .42, y + cell * .04, cell * .16, cell * .28);
      } else {
        context.fillRect(x + cell * .35, y + cell * .62, cell * .16, cell * .3);
      }
    } else {
      if (index % 3 === 0) {
        context.fillRect(x + cell * .12, y + cell * .16, cell * .32, cell * .68);
        context.fillRect(x + cell * .62, y + cell * .08, cell * .24, cell * .45);
      } else if (index % 3 === 1) {
        context.fillRect(x + cell * .16, y + cell * .2, cell * .68, cell * .28);
        context.fillRect(x + cell * .42, y + cell * .62, cell * .42, cell * .24);
      } else {
        context.fillRect(x + cell * .2, y + cell * .08, cell * .28, cell * .45);
        context.fillRect(x + cell * .58, y + cell * .42, cell * .28, cell * .48);
      }
      context.fillStyle = theme.snake.accent;
      context.fillRect(x + cell * .16, y + cell * .12, cell * .2, cell * .2);
      context.fillRect(x + cell * .65, y + cell * .66, cell * .2, cell * .2);
    }
  }

  function drawSnakeHead(context, x, y, theme, cell, facing) {
    context.fillStyle = theme.snake.main;
    context.fillRect(x + cell * .04, y + cell * .04, cell * .92, cell * .92);
    context.fillStyle = theme.snake.light;
    context.fillRect(x + cell * .16, y + cell * .16, cell * .68, cell * .68);
    context.fillStyle = theme.snake.dark;

    if (theme.name === "BAMBOO BALL PYTHON") {
      // White-edged, dark-centered head based on the bamboo ball python painting.
      context.fillStyle = theme.snake.headWhite;
      context.fillRect(x + cell * .08, y + cell * .16, cell * .84, cell * .68);
      context.fillStyle = theme.snake.headBlack;
      context.fillRect(x + cell * .2, y + cell * .24, cell * .62, cell * .52);
      context.fillStyle = theme.snake.main;
      context.fillRect(x + cell * .38, y + cell * .3, cell * .28, cell * .4);
      context.fillStyle = theme.snake.headWhite;
      context.fillRect(x + cell * .14, y + cell * .38, cell * .18, cell * .2);
      context.fillRect(x + cell * .7, y + cell * .38, cell * .18, cell * .2);
    } else {
      context.fillRect(x + cell * .28, y + cell * .28, cell * .25, cell * .25);
      context.fillRect(x + cell * .58, y + cell * .58, cell * .25, cell * .2);
    }

    let eyes;
    if (facing.x === 1) eyes = [[.72,.2],[.72,.62]];
    else if (facing.x === -1) eyes = [[.12,.2],[.12,.62]];
    else if (facing.y === -1) eyes = [[.2,.12],[.62,.12]];
    else eyes = [[.2,.72],[.62,.72]];

    context.fillStyle = theme.snake.eye;
    eyes.forEach(([ex,ey]) => context.fillRect(x + cell * ex, y + cell * ey, cell * .18, cell * .18));
    context.fillStyle = "#111d1d";
    eyes.forEach(([ex,ey]) => context.fillRect(x + cell * (ex + .07), y + cell * (ey + .04), cell * .07, cell * .1));
  }

  function drawTarget(context, x, y, theme, cell) {
    if (theme.background === "pond") {
      context.fillStyle = theme.target.main;
      context.fillRect(x + cell * .3, y + cell * .24, cell * .46, cell * .52);
      context.fillStyle = theme.target.light;
      context.fillRect(x + cell * .12, y + cell * .34, cell * .25, cell * .35);
      context.fillRect(x + cell * .68, y + cell * .1, cell * .2, cell * .25);
      context.fillRect(x + cell * .68, y + cell * .66, cell * .2, cell * .25);
      context.fillStyle = theme.target.dark;
      context.fillRect(x + cell * .42, y + cell * .32, cell * .18, cell * .18);
      context.fillStyle = "#172322";
      context.fillRect(x + cell * .7, y + cell * .36, cell * .1, cell * .1);
    } else {
      context.fillStyle = theme.target.main;
      context.fillRect(x + cell * .22, y + cell * .32, cell * .58, cell * .42);
      context.fillStyle = theme.target.light;
      context.fillRect(x + cell * .54, y + cell * .2, cell * .2, cell * .22);
      context.fillStyle = theme.target.pink;
      context.fillRect(x + cell * .66, y + cell * .18, cell * .12, cell * .12);
      context.fillRect(x + cell * .05, y + cell * .5, cell * .2, cell * .08);
      context.fillStyle = theme.target.dark;
      context.fillRect(x + cell * .68, y + cell * .4, cell * .08, cell * .08);
      context.fillRect(x + cell * .28, y + cell * .72, cell * .12, cell * .12);
      context.fillRect(x + cell * .58, y + cell * .72, cell * .12, cell * .12);
    }
  }

  function drawMenuScene() {
    drawWorldBackground(menuCtx, menuCanvas.width, menuCanvas.height, "pond", animationFrame);
    drawMenuPondDecorations();
    drawMenuSnakeBorder();
  }

  function drawMenuPondDecorations() {
    const c = menuCtx;
    const pads = [
      [36,60,56],[455,70,58],[28,470,64],[456,480,66],[60,560,46],[430,580,48]
    ];
    pads.forEach(([x,y,s]) => {
      c.fillStyle = "#285d2b";
      c.fillRect(x, y, s, s * .65);
      c.fillStyle = "#477b34";
      c.fillRect(x + s*.2, y - s*.12, s*.62, s*.62);
      c.fillStyle = "#078abd";
      c.fillRect(x + s*.55, y - s*.12, s*.18, s*.3);
    });

    [[18,150],[510,140],[16,350],[520,330]].forEach(([x,y]) => {
      c.fillStyle = "#126650";
      c.fillRect(x, y + 20, 8, 55);
      c.fillRect(x + 12, y, 8, 75);
      c.fillRect(x + 24, y + 12, 8, 63);
      c.fillStyle = "#a7873f";
      c.fillRect(x + 12, y, 8, 22);
    });
  }

  function drawMenuSnakeBorder() {
    const c = menuCtx;
    const left = 92;
    const top = 82;
    const right = 468;
    const bottom = 575;
    const step = 25;
    const path = [];

    // A thick, gameplay-sized anaconda wraps around the inner menu panel.
    // Its tapered tail points toward the koi; its large head follows behind it.
    for (let x = 250; x >= left; x -= step) path.push({x, y: top});
    for (let y = top + step; y <= bottom; y += step) path.push({x: left, y});
    for (let x = left + step; x <= right; x += step) path.push({x, y: bottom});
    for (let y = bottom - step; y >= top; y -= step) path.push({x: right, y});
    for (let x = right - step; x >= 352; x -= step) path.push({x, y: top});

    path.forEach((p, index) => {
      const size = index < 4 ? 13 + index * 4 : 28;
      c.fillStyle = index % 2 === 0 ? themes.anacondaPond.snake.main : themes.anacondaPond.snake.alt;
      c.fillRect(Math.round(p.x - size / 2), Math.round(p.y - size / 2), size, size);

      c.fillStyle = themes.anacondaPond.snake.dark;
      if (index % 3 === 0) {
        c.fillRect(p.x - size * .32, p.y - size * .22, size * .42, size * .5);
        c.fillRect(p.x + size * .08, p.y - size * .34, size * .28, size * .45);
      } else {
        c.fillRect(p.x - size * .28, p.y - size * .12, size * .58, size * .28);
      }

      c.fillStyle = themes.anacondaPond.snake.accent;
      c.fillRect(p.x - size * .31, p.y - size * .32, size * .2, size * .2);
      c.fillRect(p.x + size * .12, p.y + size * .1, size * .2, size * .2);
    });

    // Large koi between the approaching tail and hunting head.
    drawTarget(c, 267, 55, themes.anacondaPond, 52);

    // Large anaconda head, matching the scale used during gameplay.
    const hx = 350;
    const hy = 56;
    const hs = 54;
    c.fillStyle = themes.anacondaPond.snake.main;
    c.fillRect(hx, hy, hs, hs - 8);
    c.fillStyle = themes.anacondaPond.snake.light;
    c.fillRect(hx + 7, hy + 7, hs - 14, hs - 22);
    c.fillStyle = themes.anacondaPond.snake.dark;
    c.fillRect(hx + 15, hy + 13, 15, 14);
    c.fillRect(hx + 30, hy + 25, 14, 11);
    c.fillStyle = themes.anacondaPond.snake.accent;
    c.fillRect(hx + 7, hy + 7, 9, 9);
    c.fillRect(hx + 25, hy + 31, 9, 9);
    c.fillStyle = themes.anacondaPond.snake.eye;
    c.fillRect(hx + 43, hy + 10, 7, 7);
    c.fillRect(hx + 43, hy + 31, 7, 7);
    c.fillStyle = "#111d1d";
    c.fillRect(hx + 46, hy + 12, 2, 4);
    c.fillRect(hx + 46, hy + 33, 2, 4);
  }

  function drawThemePreviews() {
    document.querySelectorAll(".theme-card").forEach(card => {
      const key = card.dataset.theme;
      const theme = themes[key];
      const canvas = card.querySelector("canvas");
      const pctx = canvas.getContext("2d");
      pctx.imageSmoothingEnabled = false;

      drawWorldBackground(pctx, canvas.width, canvas.height, theme.background, 0);
      const cell = canvas.width / 20;
      drawWorldDecorations(pctx, theme.background, cell, true);

      const previousTheme = selectedThemeKey;
      selectedThemeKey = key;
      const previewSnake = [
        {x: 10,y: 7},{x: 9,y: 7},{x: 8,y: 7},{x: 7,y: 7},{x: 6,y: 7},{x: 5,y: 7}
      ];
      drawSnake(pctx, previewSnake, theme, cell, {x:1,y:0});
      drawTarget(pctx, 14 * cell, 7 * cell, theme, cell);
      selectedThemeKey = previousTheme;

      const unlocked = themeUnlocked(key);
      const selected = key === selectedThemeKey;
      card.classList.toggle("selected", selected);
      card.classList.toggle("locked", !unlocked);
      card.classList.toggle("unlocked", unlocked);

      const button = card.querySelector(".theme-select");
      button.disabled = !unlocked;
      button.textContent = selected ? "EQUIPPED" : unlocked ? "SELECT" : "LOCKED · 200";

      const note = card.querySelector("[data-unlock-note]");
      if (note) {
        note.textContent = unlocked
          ? "UNLOCKED — CHASE THE GREY MOUSE"
          : `${Math.min(Number(bestScores.anacondaPond || 0), 200)} / 200 POINTS IN ANACONDA POND`;
      }
    });
  }

  function selectTheme(key) {
    if (!themeUnlocked(key)) return;
    selectedThemeKey = key;
    localStorage.setItem("koiHuntTheme", key);
    drawThemePreviews();
    drawMenuScene();
  }

  playButton.addEventListener("click", startGame);
  collectionButton.addEventListener("click", () => showScreen("collection"));
  settingsButton.addEventListener("click", () => showScreen("settings"));
  creditsButton.addEventListener("click", () => showScreen("credits"));
  menuButton.addEventListener("click", showHome);
  pauseButton.addEventListener("click", togglePause);

  document.querySelectorAll("[data-back-home]").forEach(button => {
    button.addEventListener("click", showHome);
  });

  document.querySelectorAll(".theme-select").forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      selectTheme(button.closest(".theme-card").dataset.theme);
    });
  });

  animationToggle.checked = animateBackground;
  animationToggle.addEventListener("change", () => {
    animateBackground = animationToggle.checked;
    localStorage.setItem("koiHuntAnimate", String(animateBackground));
  });

  scanlineToggle.checked = localStorage.getItem("koiHuntScanlines") === "true";
  app.classList.toggle("scanlines", scanlineToggle.checked);
  scanlineToggle.addEventListener("change", () => {
    app.classList.toggle("scanlines", scanlineToggle.checked);
    localStorage.setItem("koiHuntScanlines", String(scanlineToggle.checked));
  });

  overlayButton.addEventListener("click", () => {
    if (overlayButton.dataset.action === "continue") resumeGame();
    else startGame();
  });

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

  showHome();
})();
