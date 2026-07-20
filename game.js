(() => {
  const app = document.getElementById("koi-hunt");
  const screens = {
    home: document.getElementById("home-screen"),
    collection: document.getElementById("collection-screen"),
    settings: document.getElementById("settings-screen"),
    credits: document.getElementById("credits-screen"),
    game: document.getElementById("game-screen")
  };

  const ui = {
    play: document.getElementById("play-button"),
    collection: document.getElementById("collection-button"),
    settings: document.getElementById("settings-button"),
    credits: document.getElementById("credits-button"),
    menu: document.getElementById("menu-button"),
    pause: document.getElementById("pause-button"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlay-title"),
    overlayText: document.getElementById("overlay-text"),
    overlayButton: document.getElementById("overlay-button"),
    score: document.getElementById("score"),
    best: document.getElementById("best-score"),
    worldLabel: document.getElementById("world-label"),
    animationToggle: document.getElementById("animation-toggle"),
    scanlineToggle: document.getElementById("scanline-toggle"),
    musicToggle: document.getElementById("music-toggle"),
    musicVolume: document.getElementById("music-volume")
  };

  const gameCanvas = document.getElementById("game-canvas");
  const ctx = gameCanvas.getContext("2d");
  const menuCanvas = document.getElementById("menu-canvas");
  const menuCtx = menuCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  menuCtx.imageSmoothingEnabled = false;


  const musicTracks = {
    menu: "audio/better.mp3",
    anacondaPond: "audio/medusa.mp3",
    bambooBallPython: "audio/tts2.mp3",
    greenTreePython: "audio/gasoline-takes.mp3",
    rattlesnakeDesert: "audio/loop-demona-finished.mp3",
    anacondaSwimmer: "audio/goldie-complete.mp3"
  };
  const music = new Audio();
  music.loop = true;
  music.preload = "auto";
  let musicEnabled = localStorage.getItem("koiHuntMusic") !== "false";
  let musicVolume = Number(localStorage.getItem("koiHuntMusicVolume") || 0.55);
  let activeTrackKey = null;
  let audioUnlocked = false;
  music.volume = musicVolume;

  function unlockAudio() {
    audioUnlocked = true;
    playMusic(activeTrackKey || "menu");
  }

  function playMusic(trackKey) {
    activeTrackKey = trackKey;
    const source = musicTracks[trackKey] || musicTracks.menu;
    if (!musicEnabled || !audioUnlocked) {
      music.pause();
      return;
    }
    if (!music.src.endsWith(source)) {
      music.src = source;
      music.currentTime = 0;
    }
    music.volume = musicVolume;
    music.play().catch(() => {});
  }

  const gridSize = 20;
  const tileSize = gameCanvas.width / gridSize;

  const themes = {
    anacondaPond: {
      name: "ANACONDA POND",
      targetName: "ORANGE KOI",
      background: "pond",
      snakeStyle: "anaconda",
      unlockScore: 0,
      unlockText: "AVAILABLE FROM THE START",
      snake: { main: "#086b48", alt: "#0a7a53", light: "#15945f", dark: "#102e31", accent: "#c3ae59", eye: "#f0d56e" },
      target: { main: "#f38550", light: "#ffc06f", dark: "#cf4f36" }
    },
    bambooBallPython: {
      name: "BAMBOO BALL PYTHON",
      targetName: "GREY MOUSE",
      background: "brightGrass",
      snakeStyle: "bamboo",
      unlockScore: 100,
      unlockText: "UNLOCK AT 100 POINTS",
      snake: { main: "#d4d8cf", alt: "#eef0e9", light: "#ffffff", dark: "#60473a", accent: "#82604a", white: "#ffffff", eye: "#111818" },
      target: { main: "#34383b", light: "#dfe4e6", dark: "#101214", pink: "#ff9aa5" }
    },
    greenTreePython: {
      name: "GREEN TREE PYTHON",
      targetName: "TREE FROG",
      background: "canopy",
      snakeStyle: "treePython",
      unlockScore: 150,
      unlockText: "UNLOCK AT 150 POINTS",
      snake: { main: "#60c93f", alt: "#83e75b", light: "#b4f47d", dark: "#164f27", accent: "#f4e36f", eye: "#ffdc4e" },
      target: { main: "#61d85b", light: "#b7f58d", dark: "#185633", pink: "#ff8b70" }
    },
    rattlesnakeDesert: {
      name: "RATTLESNAKE DESERT",
      targetName: "DESERT LIZARD",
      background: "desert",
      snakeStyle: "rattlesnake",
      unlockScore: 220,
      unlockText: "UNLOCK AT 220 POINTS",
      snake: { main: "#bd9a58", alt: "#d4b86f", light: "#ead58c", dark: "#5c472e", accent: "#2e2b22", eye: "#f4ca52" },
      target: { main: "#6da34b", light: "#a8d16f", dark: "#34512c", pink: "#df805c" }
    },
    anacondaSwimmer: {
      name: "ANACONDA DEEP WATER",
      targetName: "SWIMMER",
      background: "deepPond",
      snakeStyle: "anaconda",
      unlockScore: 300,
      unlockText: "UNLOCK AT 300 POINTS",
      snake: { main: "#086b48", alt: "#0a7a53", light: "#15945f", dark: "#102e31", accent: "#c3ae59", eye: "#f0d56e" },
      target: { skin: "#9a5d3c", suit: "#2e83d0", hair: "#251b18", foam: "#d7f4ff" }
    }
  };

  let selectedThemeKey = localStorage.getItem("koiHuntTheme") || "anacondaPond";
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
  let menuAnimationId = null;
  let animateBackground = localStorage.getItem("koiHuntAnimate") !== "false";
  const bestScores = JSON.parse(localStorage.getItem("koiHuntBestScores") || "{}");

  function highestScore() {
    return Math.max(0, ...Object.values(bestScores).map(v => Number(v) || 0));
  }

  function currentTheme() { return themes[selectedThemeKey]; }
  function themeUnlocked(key) { return highestScore() >= themes[key].unlockScore; }

  function ensureValidSelectedTheme() {
    if (!themeUnlocked(selectedThemeKey)) {
      selectedThemeKey = "anacondaPond";
      localStorage.setItem("koiHuntTheme", selectedThemeKey);
    }
  }
  ensureValidSelectedTheme();

  function showScreen(name) {
    Object.values(screens).forEach(screen => screen.classList.add("hidden"));
    screens[name].classList.remove("hidden");
    if (name === "home") startMenuAnimation();
    else stopMenuAnimation();
    if (name === "collection") drawThemePreviews();
    playMusic(name === "game" ? selectedThemeKey : "menu");
  }

  function stopGame() {
    gameRunning = false;
    paused = false;
    if (timer !== null) clearInterval(timer);
    timer = null;
  }

  function showHome() {
    stopGame();
    ui.overlay.classList.add("hidden");
    ui.pause.textContent = "PAUSE";
    showScreen("home");
  }

  function startGame() {
    stopGame();
    showScreen("game");
    snake = [{x:7,y:10},{x:6,y:10},{x:5,y:10},{x:4,y:10},{x:3,y:10}];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    ui.score.textContent = score;
    ui.best.textContent = bestScores[selectedThemeKey] || 0;
    ui.worldLabel.textContent = currentTheme().name;
    paused = false;
    gameRunning = true;
    ui.pause.textContent = "PAUSE";
    ui.overlay.classList.add("hidden");
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
    if (bodyToCheck.some(s => s.x === newHead.x && s.y === newHead.y)) return endGame();
    snake.unshift(newHead);
    if (eatsTarget) {
      score += 10;
      ui.score.textContent = score;
      if (score > (bestScores[selectedThemeKey] || 0)) {
        bestScores[selectedThemeKey] = score;
        ui.best.textContent = score;
        localStorage.setItem("koiHuntBestScores", JSON.stringify(bestScores));
      }
      placeTarget();
    } else snake.pop();
    drawGame();
  }

  function endGame() {
    stopGame();
    ui.overlayTitle.textContent = "SELF BITTEN";
    ui.overlayText.textContent = `THE SNAKE CAUGHT ITS OWN BODY. SCORE: ${score}`;
    ui.overlayButton.textContent = "PLAY AGAIN";
    ui.overlayButton.dataset.action = "restart";
    ui.overlay.classList.remove("hidden");
  }

  function togglePause() {
    if (!gameRunning) return;
    paused = !paused;
    if (paused) {
      ui.pause.textContent = "RESUME";
      ui.overlayTitle.textContent = "PAUSED";
      ui.overlayText.textContent = "PRESS SPACE OR CONTINUE TO RETURN.";
      ui.overlayButton.textContent = "CONTINUE";
      ui.overlayButton.dataset.action = "continue";
      ui.overlay.classList.remove("hidden");
    } else resumeGame();
  }

  function resumeGame() {
    if (!gameRunning) return;
    paused = false;
    ui.pause.textContent = "PAUSE";
    ui.overlay.classList.add("hidden");
  }

  function placeTarget() {
    do {
      target = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    } while (snake.some(s => s.x === target.x && s.y === target.y));
  }

  function setDirection(name) {
    const dirs = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
    const candidate = dirs[name];
    if (!(candidate.x === -direction.x && candidate.y === -direction.y)) nextDirection = candidate;
  }

  const decorations = {
    pond: [
      ["weed",1,2],["weed",17,16],["weed",2,15],["lily",16,2],["lily",3,17],["lily",17,10],["shadow",7,4],["shadow",12,15]
    ],
    brightGrass: [
      ["tuft",1,2],["tuft",17,16],["flower",15,3],["flower",7,16],["stone",2,17],["stone",18,8]
    ],
    canopy: [
      ["branch",0,4],["branch",10,13],["moss",2,4],["moss",12,13],["bug",4,2],["bug",16,6],["bug",7,17],["leaf",17,15]
    ],
    desert: [
      ["cactus",2,3],["cactus",16,14],["rock",4,16],["rock",15,4],["scrub",8,3],["scrub",12,17]
    ],
    deepPond: [
      ["weed",1,2],["weed",17,16],["lily",16,2],["lily",3,17],["bubble",5,5],["bubble",14,12],["shadow",9,16]
    ]
  };

  function drawGame() {
    const theme = currentTheme();
    drawWorldBackground(ctx, gameCanvas.width, gameCanvas.height, theme.background, animationFrame);
    drawWorldDecorations(ctx, theme.background, tileSize);
    drawTarget(ctx, target.x * tileSize, target.y * tileSize, theme, tileSize);
    drawSnake(ctx, snake, theme, tileSize, direction);
    ctx.strokeStyle = theme.background.includes("pond") || theme.background === "deepPond" ? "#16443a" : "#493c27";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, gameCanvas.width - 8, gameCanvas.height - 8);
  }

  function drawWorldBackground(c, width, height, kind, frame = 0) {
    const cell = width / 20;
    const palettes = {
      pond: ["#078cc4","#0879aa","#0b96c5","#087fae"],
      deepPond: ["#075f88","#084e72","#0a7397","#086488"],
      brightGrass: ["#a8c96a","#b6d878","#97bc5a","#c5df89"],
      canopy: ["#174f2d","#1c6334","#245b31","#0f4228"],
      desert: ["#d4a95d","#e1bd72","#c9974f","#eccb84"]
    };
    const palette = palettes[kind] || palettes.pond;
    c.fillStyle = palette[0];
    c.fillRect(0, 0, width, height);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
      c.fillStyle = palette[(x * 5 + y * 7) % palette.length];
      c.fillRect(x * cell, y * cell, cell, cell);
    }
    if (kind === "pond" || kind === "deepPond") {
      c.fillStyle = "rgba(220,250,255,.18)";
      for (let i=0;i<18;i++) c.fillRect(((i*109)+(frame*3))%width,(i*71)%height,cell*1.8,Math.max(3,cell/5));
    } else if (kind === "brightGrass") {
      c.fillStyle = "rgba(255,255,210,.17)";
      for (let i=0;i<20;i++) c.fillRect(((i*83)+(frame*2))%width,(i*53)%height,cell,Math.max(3,cell/5));
    } else if (kind === "canopy") {
      c.fillStyle = "rgba(120,230,90,.10)";
      for (let i=0;i<16;i++) c.fillRect((i*97)%width,((i*59)+(frame%30))%height,cell*.7,cell*.7);
    } else {
      c.fillStyle = "rgba(255,238,176,.16)";
      for (let i=0;i<20;i++) c.fillRect(((i*91)+(frame*2))%width,(i*47)%height,cell*1.2,Math.max(2,cell/7));
    }
  }

  function drawWorldDecorations(c, kind, cell) {
    (decorations[kind] || []).forEach(([type,gx,gy]) => {
      const x=gx*cell, y=gy*cell;
      if (type === "weed" || type === "tuft") {
        c.fillStyle = type === "weed" ? "#126650" : "#4f7a31";
        c.fillRect(x+cell*.1,y+cell*.35,cell*.18,cell*.65); c.fillRect(x+cell*.4,y+cell*.1,cell*.18,cell*.9); c.fillRect(x+cell*.7,y+cell*.28,cell*.18,cell*.72);
      } else if (type === "lily") {
        c.fillStyle="#285d2b"; c.fillRect(x+cell*.08,y+cell*.2,cell*.84,cell*.62); c.fillStyle="#5a8f43"; c.fillRect(x+cell*.25,y+cell*.08,cell*.6,cell*.66);
      } else if (type === "shadow") {
        c.fillStyle="rgba(5,55,66,.3)"; c.fillRect(x,y+cell*.35,cell*2,cell*.28);
      } else if (type === "flower") {
        c.fillStyle="#fff3a0"; c.fillRect(x+cell*.3,y+cell*.3,cell*.4,cell*.4); c.fillStyle="#f29ac0"; c.fillRect(x+cell*.12,y+cell*.4,cell*.22,cell*.18); c.fillRect(x+cell*.66,y+cell*.4,cell*.22,cell*.18);
      } else if (type === "stone" || type === "rock") {
        c.fillStyle=type==="rock"?"#765d3e":"#657064"; c.fillRect(x+cell*.12,y+cell*.3,cell*.76,cell*.48); c.fillStyle=type==="rock"?"#a17c4f":"#8c9687"; c.fillRect(x+cell*.28,y+cell*.18,cell*.48,cell*.34);
      } else if (type === "branch") {
        c.fillStyle="#614325"; c.fillRect(x,y+cell*.3,cell*9,cell*.55); c.fillStyle="#8a6334"; c.fillRect(x,y+cell*.28,cell*9,cell*.15);
      } else if (type === "moss") {
        c.fillStyle="#5e9a42"; for(let i=0;i<5;i++) c.fillRect(x+i*cell*.3,y+cell*.6+(i%2)*cell*.1,cell*.25,cell*.35);
      } else if (type === "bug") {
        c.fillStyle="#ffd75b"; c.fillRect(x+cell*.35,y+cell*.35,cell*.22,cell*.22); c.fillStyle="#222"; c.fillRect(x+cell*.42,y+cell*.38,cell*.08,cell*.14);
      } else if (type === "leaf") {
        c.fillStyle="#3c8c48"; c.fillRect(x+cell*.1,y+cell*.2,cell*.8,cell*.55);
      } else if (type === "cactus") {
        c.fillStyle="#397a42"; c.fillRect(x+cell*.38,y,cell*.25,cell); c.fillRect(x+cell*.12,y+cell*.35,cell*.35,cell*.2); c.fillRect(x+cell*.58,y+cell*.55,cell*.3,cell*.2);
      } else if (type === "scrub") {
        c.fillStyle="#8a7a3a"; c.fillRect(x+cell*.1,y+cell*.5,cell*.8,cell*.25);
      } else if (type === "bubble") {
        c.strokeStyle="rgba(215,248,255,.7)"; c.lineWidth=Math.max(2,cell*.08); c.strokeRect(x+cell*.3,y+cell*.3,cell*.35,cell*.35);
      }
    });
  }

  function drawSnake(c, segments, theme, cell, facing) {
    const last = Math.max(1, segments.length - 1);
    for (let index = segments.length - 1; index >= 0; index--) {
      const s = segments[index];
      const x=s.x*cell, y=s.y*cell;
      if (index === 0) drawSnakeHead(c,x,y,theme,cell,facing);
      else {
        const tailProgress = index / last;
        const scale = 1 - tailProgress * 0.58;
        drawSnakeBody(c,x,y,theme,cell,index,scale);
      }
    }
  }

  function drawSnakeBody(c,x,y,theme,cell,index,scale=1) {
    const size=cell*.82*scale;
    const ox=x+(cell-size)/2, oy=y+(cell-size)/2;
    c.fillStyle=index%2?theme.snake.main:theme.snake.alt;
    c.fillRect(ox,oy,size,size);
    c.fillStyle=theme.snake.dark;
    if (theme.snakeStyle === "bamboo") {
      c.fillRect(ox+size*.15,oy+size*.15,size*.7,size*.22); c.fillRect(ox+size*.34,oy+size*.45,size*.46,size*.34);
      c.fillStyle=theme.snake.white; c.fillRect(ox+size*.08,oy+size*.62,size*.28,size*.22);
    } else if (theme.snakeStyle === "treePython") {
      c.fillRect(ox+size*.32,oy,size*.2,size); c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.08,oy+size*.18,size*.2,size*.2);
    } else if (theme.snakeStyle === "rattlesnake") {
      c.fillRect(ox+size*.18,oy+size*.18,size*.28,size*.28); c.fillRect(ox+size*.55,oy+size*.55,size*.28,size*.28);
      c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.45,oy,size*.12,size);
    } else {
      c.fillRect(ox+size*.15,oy+size*.18,size*.34,size*.48); c.fillRect(ox+size*.55,oy+size*.44,size*.28,size*.35);
      c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.08,oy+size*.08,size*.18,size*.18);
    }
  }

  function drawSnakeHead(c,x,y,theme,cell,facing) {
    c.fillStyle=theme.snake.main; c.fillRect(x+cell*.08,y+cell*.08,cell*.84,cell*.84);
    c.fillStyle=theme.snake.light; c.fillRect(x+cell*.18,y+cell*.18,cell*.64,cell*.58);
    c.fillStyle=theme.snake.dark;
    if (theme.snakeStyle === "bamboo") {
      c.fillRect(x+cell*.15,y+cell*.22,cell*.7,cell*.5); c.fillStyle=theme.snake.white; c.fillRect(x+cell*.1,y+cell*.12,cell*.28,cell*.22); c.fillRect(x+cell*.62,y+cell*.12,cell*.28,cell*.22);
    } else if (theme.snakeStyle === "treePython") {
      c.fillRect(x+cell*.35,y+cell*.12,cell*.22,cell*.68); c.fillStyle=theme.snake.accent; c.fillRect(x+cell*.1,y+cell*.38,cell*.22,cell*.18);
    } else if (theme.snakeStyle === "rattlesnake") {
      c.fillRect(x+cell*.18,y+cell*.18,cell*.28,cell*.28); c.fillRect(x+cell*.55,y+cell*.5,cell*.25,cell*.25);
    } else {
      c.fillRect(x+cell*.24,y+cell*.25,cell*.25,cell*.25); c.fillRect(x+cell*.55,y+cell*.55,cell*.24,cell*.2);
    }
    let eyes;
    if(facing.x===1) eyes=[[.72,.2],[.72,.62]]; else if(facing.x===-1) eyes=[[.12,.2],[.12,.62]]; else if(facing.y===-1) eyes=[[.2,.12],[.62,.12]]; else eyes=[[.2,.72],[.62,.72]];
    c.fillStyle=theme.snake.eye; eyes.forEach(([ex,ey])=>c.fillRect(x+cell*ex,y+cell*ey,cell*.16,cell*.16));
    c.fillStyle="#101717"; eyes.forEach(([ex,ey])=>c.fillRect(x+cell*(ex+.06),y+cell*(ey+.04),cell*.06,cell*.09));
  }

  function drawTarget(c,x,y,theme,cell) {
    if (theme.targetName === "ORANGE KOI") {
      c.fillStyle=theme.target.main; c.fillRect(x+cell*.28,y+cell*.25,cell*.5,cell*.48); c.fillStyle=theme.target.light; c.fillRect(x+cell*.08,y+cell*.36,cell*.28,cell*.3); c.fillRect(x+cell*.68,y+cell*.1,cell*.2,cell*.25); c.fillRect(x+cell*.68,y+cell*.66,cell*.2,cell*.25); c.fillStyle=theme.target.dark; c.fillRect(x+cell*.44,y+cell*.34,cell*.16,cell*.16); c.fillStyle="#111"; c.fillRect(x+cell*.7,y+cell*.36,cell*.09,cell*.09);
    } else if (theme.targetName === "GREY MOUSE") {
      c.fillStyle="#f9fbfc"; c.fillRect(x+cell*.06,y+cell*.18,cell*.88,cell*.68); c.fillStyle=theme.target.main; c.fillRect(x+cell*.2,y+cell*.31,cell*.58,cell*.42); c.fillStyle=theme.target.light; c.fillRect(x+cell*.54,y+cell*.18,cell*.22,cell*.22); c.fillStyle=theme.target.pink; c.fillRect(x+cell*.66,y+cell*.16,cell*.13,cell*.13); c.fillRect(x+cell*.03,y+cell*.5,cell*.22,cell*.08); c.fillStyle=theme.target.dark; c.fillRect(x+cell*.68,y+cell*.39,cell*.09,cell*.09);
    } else if (theme.targetName === "TREE FROG") {
      c.fillStyle=theme.target.main; c.fillRect(x+cell*.2,y+cell*.3,cell*.6,cell*.46); c.fillStyle=theme.target.light; c.fillRect(x+cell*.12,y+cell*.18,cell*.28,cell*.26); c.fillRect(x+cell*.6,y+cell*.18,cell*.28,cell*.26); c.fillStyle="#fff"; c.fillRect(x+cell*.18,y+cell*.22,cell*.13,cell*.13); c.fillRect(x+cell*.69,y+cell*.22,cell*.13,cell*.13); c.fillStyle="#111"; c.fillRect(x+cell*.22,y+cell*.25,cell*.07,cell*.07); c.fillRect(x+cell*.72,y+cell*.25,cell*.07,cell*.07); c.fillStyle=theme.target.pink; c.fillRect(x+cell*.38,y+cell*.6,cell*.25,cell*.08);
    } else if (theme.targetName === "DESERT LIZARD") {
      c.fillStyle=theme.target.main; c.fillRect(x+cell*.22,y+cell*.36,cell*.56,cell*.3); c.fillRect(x+cell*.68,y+cell*.24,cell*.22,cell*.24); c.fillRect(x+cell*.05,y+cell*.48,cell*.25,cell*.1); c.fillStyle=theme.target.light; c.fillRect(x+cell*.35,y+cell*.28,cell*.2,cell*.12); c.fillStyle=theme.target.dark; c.fillRect(x+cell*.76,y+cell*.29,cell*.07,cell*.07); c.fillRect(x+cell*.26,y+cell*.65,cell*.12,cell*.18); c.fillRect(x+cell*.58,y+cell*.65,cell*.12,cell*.18);
    } else {
      c.fillStyle=theme.target.foam; c.fillRect(x+cell*.04,y+cell*.18,cell*.9,cell*.65); c.fillStyle=theme.target.skin; c.fillRect(x+cell*.55,y+cell*.2,cell*.24,cell*.24); c.fillRect(x+cell*.25,y+cell*.42,cell*.48,cell*.2); c.fillStyle=theme.target.suit; c.fillRect(x+cell*.32,y+cell*.44,cell*.32,cell*.24); c.fillStyle=theme.target.hair; c.fillRect(x+cell*.55,y+cell*.16,cell*.22,cell*.1);
    }
  }

  function startMenuAnimation() {
    if (menuAnimationId) return;
    const loop = () => {
      if (screens.home.classList.contains("hidden")) { menuAnimationId=null; return; }
      if (animateBackground) animationFrame += 0.35;
      drawMenuScene(animationFrame);
      menuAnimationId = requestAnimationFrame(loop);
    };
    loop();
  }
  function stopMenuAnimation() { if(menuAnimationId){cancelAnimationFrame(menuAnimationId);menuAnimationId=null;} }

  function drawMenuScene(frame=0) {
    drawWorldBackground(menuCtx,menuCanvas.width,menuCanvas.height,"pond",frame);
    drawMenuPondDecorations(frame);
    drawMovingMenuSnake(frame);
  }

  function drawMenuPondDecorations(frame) {
    const c=menuCtx;
    [[36,60,56],[455,70,58],[28,470,64],[456,480,66],[60,560,46],[430,580,48]].forEach(([x,y,s],i)=>{
      const bob=Math.sin(frame*.03+i)*3; c.fillStyle="#285d2b"; c.fillRect(x,y+bob,s,s*.65); c.fillStyle="#477b34"; c.fillRect(x+s*.2,y-s*.12+bob,s*.62,s*.62);
    });
    [[18,150],[510,140],[16,350],[520,330]].forEach(([x,y],i)=>{const sway=Math.sin(frame*.04+i)*4;c.fillStyle="#126650";c.fillRect(x+sway,y+20,8,55);c.fillRect(x+12,y,8,75);c.fillRect(x+24-sway,y+12,8,63);});
  }

  function drawMovingMenuSnake(frame) {
    const c=menuCtx, points=[];
    const cx=280, cy=330, rx=220, ry=265;
    const count=56, phase=frame*.012;
    for(let i=0;i<count;i++){
      const t=(i/(count-1))*Math.PI*2+phase;
      const wobble=Math.sin(t*3+phase*2)*10;
      points.push({x:cx+(rx+wobble)*Math.cos(t),y:cy+(ry+wobble)*Math.sin(t)});
    }
    for(let i=points.length-1;i>=1;i--){
      const p=points[i], progress=i/(points.length-1), size=30-progress*17;
      c.fillStyle=i%2?themes.anacondaPond.snake.main:themes.anacondaPond.snake.alt;c.fillRect(p.x-size/2,p.y-size/2,size,size);
      c.fillStyle=themes.anacondaPond.snake.dark;c.fillRect(p.x-size*.25,p.y-size*.2,size*.48,size*.35);
      c.fillStyle=themes.anacondaPond.snake.accent;c.fillRect(p.x-size*.34,p.y-size*.34,size*.18,size*.18);
    }
    const koiAngle=phase+0.55, kx=cx+rx*Math.cos(koiAngle), ky=cy+ry*Math.sin(koiAngle);
    drawTarget(c,kx-25,ky-25,themes.anacondaPond,50);
    const h=points[0], next=points[1], facing={x:Math.sign(next.x-h.x)||1,y:Math.sign(next.y-h.y)};
    drawSnakeHead(c,h.x-29,h.y-29,themes.anacondaPond,58,facing);
  }

  function drawThemePreviews() {
    document.querySelectorAll(".theme-card").forEach(card=>{
      const key=card.dataset.theme, theme=themes[key], canvas=card.querySelector("canvas"), pctx=canvas.getContext("2d");
      pctx.imageSmoothingEnabled=false;
      drawWorldBackground(pctx,canvas.width,canvas.height,theme.background,0);
      drawWorldDecorations(pctx,theme.background,canvas.width/20);
      const cell=canvas.width/20;
      drawSnake(pctx,[{x:10,y:7},{x:9,y:7},{x:8,y:7},{x:7,y:7},{x:6,y:7},{x:5,y:7}],theme,cell,{x:1,y:0});
      drawTarget(pctx,14*cell,7*cell,theme,cell);
      const unlocked=themeUnlocked(key), selected=key===selectedThemeKey;
      card.classList.toggle("selected",selected); card.classList.toggle("locked",!unlocked);
      const button=card.querySelector(".theme-select"); button.disabled=!unlocked; button.textContent=selected?"EQUIPPED":unlocked?"SELECT":`LOCKED · ${theme.unlockScore}`;
      const note=card.querySelector("[data-unlock-note]");
      if(note) note.textContent=unlocked?`UNLOCKED — CHASE THE ${theme.targetName}`:`${Math.min(highestScore(),theme.unlockScore)} / ${theme.unlockScore} TOTAL BEST POINTS`;
    });
  }

  function selectTheme(key) {
    if(!themeUnlocked(key)) return;
    selectedThemeKey=key; localStorage.setItem("koiHuntTheme",key); drawThemePreviews();
  }

  document.addEventListener("pointerdown", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });

  ui.play.addEventListener("click",startGame);
  ui.collection.addEventListener("click",()=>showScreen("collection"));
  ui.settings.addEventListener("click",()=>showScreen("settings"));
  ui.credits.addEventListener("click",()=>showScreen("credits"));
  ui.menu.addEventListener("click",showHome);
  ui.pause.addEventListener("click",togglePause);
  document.querySelectorAll("[data-back-home]").forEach(b=>b.addEventListener("click",showHome));
  document.querySelectorAll(".theme-select").forEach(b=>b.addEventListener("click",()=>selectTheme(b.closest(".theme-card").dataset.theme)));

  ui.animationToggle.checked=animateBackground;
  ui.animationToggle.addEventListener("change",()=>{animateBackground=ui.animationToggle.checked;localStorage.setItem("koiHuntAnimate",String(animateBackground));});
  ui.scanlineToggle.checked=localStorage.getItem("koiHuntScanlines")==="true";
  app.classList.toggle("scanlines",ui.scanlineToggle.checked);
  ui.scanlineToggle.addEventListener("change",()=>{app.classList.toggle("scanlines",ui.scanlineToggle.checked);localStorage.setItem("koiHuntScanlines",String(ui.scanlineToggle.checked));});
  ui.musicToggle.checked = musicEnabled;
  ui.musicVolume.value = Math.round(musicVolume * 100);
  ui.musicToggle.addEventListener("change",()=>{
    musicEnabled = ui.musicToggle.checked;
    localStorage.setItem("koiHuntMusic", String(musicEnabled));
    if (musicEnabled) playMusic(activeTrackKey || "menu"); else music.pause();
  });
  ui.musicVolume.addEventListener("input",()=>{
    musicVolume = Number(ui.musicVolume.value) / 100;
    music.volume = musicVolume;
    localStorage.setItem("koiHuntMusicVolume", String(musicVolume));
  });
  ui.overlayButton.addEventListener("click",()=>ui.overlayButton.dataset.action==="continue"?resumeGame():startGame());

  document.addEventListener("keydown",event=>{
    const key=event.key.toLowerCase(), controls={arrowup:"up",w:"up",arrowdown:"down",s:"down",arrowleft:"left",a:"left",arrowright:"right",d:"right"};
    if(controls[key]&&gameRunning&&!paused){event.preventDefault();setDirection(controls[key]);}
    if(event.code==="Space"&&gameRunning){event.preventDefault();togglePause();}
  });

  showHome();
})();
