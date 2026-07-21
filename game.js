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
    musicVolume: document.getElementById("music-volume"),
    lunarToggle: document.getElementById("lunar-toggle"),
    lunarStatus: document.getElementById("lunar-status"),
    passwordInput: document.getElementById("password-input"),
    passwordMessage: document.getElementById("password-message"),
    resetProgress: document.getElementById("reset-progress-button"),
    unlockAll: document.getElementById("unlock-all-button"),
    collectionPrev: document.getElementById("collection-prev"),
    collectionNext: document.getElementById("collection-next")
  };

  const gameCanvas = document.getElementById("game-canvas");
  const ctx = gameCanvas.getContext("2d");
  const menuCanvas = document.getElementById("menu-canvas");
  const secretGoldenKoiButton = document.getElementById("secret-golden-koi");
  const menuCtx = menuCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  menuCtx.imageSmoothingEnabled = false;


  const musicTracks = {
    menu: "audio/better.mp3",
    anacondaPond: "audio/medusa.mp3",
    bambooBallPython: "audio/tts2.mp3",
    greenTreePython: "audio/gasoline-takes.mp3",
    leucisticCherry: "audio/ipayforu.m4a",
    rattlesnakeDesert: "audio/loop-demona-finished.mp3",
    giantSeaSnake: "audio/goldie-complete.mp3",
    dragonHoard: "audio/body.wav"
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
      name: "ANACONDA POND", targetName: "POND FISH", background: "pond",
      snakeStyle: "anaconda", unlockScore: 0, unlockText: "AVAILABLE FROM THE START",
      preyUnlocks: [0,50,100], preyNames:["KOHAKU KOI","SHOWA KOI","YAMABUKI KOI"],
      preyPalettes:[
        {main:"#f7f2df",light:"#ffffff",dark:"#d53d2f",spot:"#d53d2f"},
        {main:"#f4efe2",light:"#ffffff",dark:"#171a1d",spot:"#d34232",spot2:"#171a1d"},
        {main:"#e9bd35",light:"#fff08a",dark:"#8f6816",spot:"#f6d75a"}
      ],
      goldenName:"GOLDEN KOI",
      snake: { main: "#086b48", alt: "#0a7a53", light: "#15945f", dark: "#102e31", accent: "#c3ae59", eye: "#f0d56e" }
    },
    bambooBallPython: {
      name: "BAMBOO BALL PYTHON", targetName: "MOUSE", background: "brightGrass",
      snakeStyle: "bamboo", unlockScore: 100, unlockText: "UNLOCK AT 100 POINTS",
      preyUnlocks:[0,50,100], preyNames:["BLACK MOUSE","BROWN MOUSE","PINK MOUSE"],
      preyPalettes:[
        {main:"#24282b",light:"#62696d",dark:"#08090a",pink:"#ff9aa5"},
        {main:"#7a5238",light:"#b78a65",dark:"#3d281d",pink:"#ff9aa5"},
        {main:"#ef8eb0",light:"#ffd0de",dark:"#a84f71",pink:"#ffb1c8"}
      ],
      goldenName:"GOLDEN MOUSE",
      snake: { main: "#d4d8cf", alt: "#eef0e9", light: "#ffffff", dark: "#60473a", accent: "#82604a", white: "#ffffff", eye: "#111818" }
    },
    greenTreePython: {
      name: "GREEN TREE PYTHON", targetName: "TREE FROG", background: "canopy",
      snakeStyle: "treePython", unlockScore: 170, unlockText: "UNLOCK AT 170 POINTS",
      preyUnlocks:[0,50,100], preyNames:["EMERALD FROG","SKY BLUE FROG","BLACK & RED FROG"],
      preyPalettes:[
        {main:"#61d85b",light:"#b7f58d",dark:"#185633",pink:"#ff8b70"},
        {main:"#4fbbe8",light:"#a8e9ff",dark:"#185a7a",pink:"#ff8b70"},
        {main:"#1b171b",light:"#e83636",dark:"#050405",pink:"#ff5555"}
      ],
      goldenName:"GOLDEN TREE FROG",
      snake: { main: "#60c93f", alt: "#83e75b", light: "#b4f47d", dark: "#164f27", accent: "#f4e36f", eye: "#ffdc4e" }
    },
    leucisticCherry: {
      name: "BLUE-EYED LEUCISTIC BALL PYTHON", targetName: "CARDINAL", background: "cherry",
      snakeStyle: "leucistic", unlockScore: 420, unlockText: "UNLOCK AT 420 POINTS",
      preyUnlocks:[0,50,100], preyNames:["RED CARDINAL","WHITE CARDINAL","YELLOW CARDINAL"],
      preyPalettes:[
        {main:"#d92f3b",light:"#ff747d",dark:"#6e1420",beak:"#f2b14d"},
        {main:"#f2eee4",light:"#ffffff",dark:"#aaa69d",beak:"#f2b14d"},
        {main:"#f0c83f",light:"#fff08a",dark:"#a77a17",beak:"#f28b38"}
      ],
      goldenName:"GOLDEN CARDINAL",
      snake: { main:"#f4f2e8",alt:"#ffffff",light:"#ffffff",dark:"#c9c5b9",accent:"#f3d6ea",white:"#ffffff",eye:"#35a7ff" }
    },
    rattlesnakeDesert: {
      name: "RATTLESNAKE DESERT", targetName: "DESERT LIZARD", background: "desert",
      snakeStyle: "rattlesnake", unlockScore: 260, unlockText: "UNLOCK AT 260 POINTS",
      preyUnlocks:[0,50,100], preyNames:["LIME LIZARD","ORANGE LIZARD","TURQUOISE LIZARD"],
      preyPalettes:[
        {main:"#8dcc42",light:"#d0ef77",dark:"#3d6a22"},
        {main:"#ee7c2f",light:"#ffc56e",dark:"#9b3e1d"},
        {main:"#31c8bd",light:"#8af0e8",dark:"#126d68"}
      ],
      goldenName:"GOLDEN LIZARD",
      snake: { main: "#bd9a58", alt: "#d4b86f", light: "#ead58c", dark: "#5c472e", accent: "#2e2b22", eye: "#f4ca52" }
    },
    giantSeaSnake: {
      name: "GIANT SEA SNAKE", targetName: "SEA PREY", background: "openOcean",
      snakeStyle: "seaSnake", unlockScore: 340, unlockText: "UNLOCK AT 340 POINTS",
      preyUnlocks:[0,50,100], preyNames:["SWIMMER · PINK SHORTS","SWIMMER · GREEN SHORTS","PUFFERFISH"],
      preyPalettes:[
        {kind:"swimmer",skin:"#9a5d3c",suit:"#f06da9",hair:"#251b18",foam:"#d7f4ff"},
        {kind:"swimmer",skin:"#f0c6a6",suit:"#52bd63",hair:"#6b432b",foam:"#d7f4ff"},
        {kind:"puffer",main:"#e6c05b",light:"#fff08e",dark:"#7c6330"}
      ],
      goldenName:"GOLDEN MERMAID",
      snake: { main: "#176f85", alt: "#238ea1", light: "#67d0d8", dark: "#0b3442", accent: "#f0d05a", eye: "#fff08a" }
    },
    dragonHoard: {
      name: "DRAGON'S HOARD", targetName: "TREASURE HUNTER", background: "dragonCave",
      snakeStyle: "dragon", unlockScore: 300, unlockText: "SECRET WORLD · SCORE 300 TO KEEP",
      preyUnlocks:[0], preyNames:["RUNNING TREASURE HUNTER"],
      preyPalettes:[
        {kind:"runner",skin:"#d7a06f",suit:"#4da3d9",hair:"#4a2d1c",boots:"#39251b"}
      ],
      goldenName:"GOLDEN KNIGHT",
      snake: { main:"#b73a2b",alt:"#d25a34",light:"#f28b45",dark:"#5b1b1a",accent:"#f2c84b",eye:"#fff06a" }
    },
  };
  let selectedThemeKey = localStorage.getItem("koiHuntTheme") || "anacondaPond";
  if (selectedThemeKey === "anacondaSwimmer") selectedThemeKey = "giantSeaSnake";
  if (!themes[selectedThemeKey]) selectedThemeKey = "anacondaPond";
  let snake = [];
  let target = { x: 14, y: 10, variant: 0, golden: false, value: 10 };
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let score = 0;
  let gameRunning = false;
  let paused = false;
  let timer = null;
  let animationFrame = 0;
  let ambientStart = 0;
  let ambientType = 0;
  let lunarMode = false;
  let menuAnimationId = null;
  let menuFish = [];
  let goldenKoiAvailable = false;
  let goldenKoiVisibleUntil = 0;
  let nextGoldenKoiAt = performance.now() + 120000 + Math.random() * 120000;
  let secretDragonSession = false;
  let animateBackground = localStorage.getItem("koiHuntAnimate") !== "false";
  const bestScores = JSON.parse(localStorage.getItem("koiHuntBestScores") || "{}");

  // Progressive world unlocks. Pond starts open; each later world uses a higher score in the previous world.
  const worldOrder = ["anacondaPond","bambooBallPython","greenTreePython","rattlesnakeDesert","giantSeaSnake","leucisticCherry"];
  const completionScores = {anacondaPond:100,bambooBallPython:180,greenTreePython:260,rattlesnakeDesert:340,giantSeaSnake:420,leucisticCherry:500};
  let allLevelsUnlocked = localStorage.getItem("koiHuntUnlockAll") === "true";

  function highestScore() {
    return Math.max(0, ...Object.values(bestScores).map(Number));
  }

  function currentTheme() { return themes[selectedThemeKey]; }
  function dragonPermanentlyUnlocked(){ return allLevelsUnlocked || (bestScores.dragonHoard || 0) >= 300; }
  function themeUnlocked(key) {
    if (key === "dragonHoard") return dragonPermanentlyUnlocked() || secretDragonSession;
    if (allLevelsUnlocked || key === worldOrder[0]) return true;
    const index = worldOrder.indexOf(key);
    if (index < 1) return false;
    const previous = worldOrder[index - 1];
    return (bestScores[previous] || 0) >= completionScores[previous];
  }

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
    if (name === "collection") { drawThemePreviews(); updateCollectionScroller(); }
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
    ambientStart = performance.now();
    ambientType = Math.floor(Math.random()*3);
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
      score += target.value || 10;
      ui.score.textContent = score;
      if (score > (bestScores[selectedThemeKey] || 0)) {
        bestScores[selectedThemeKey] = score;
        ui.best.textContent = score;
        localStorage.setItem("koiHuntBestScores", JSON.stringify(bestScores));
        if(selectedThemeKey==="dragonHoard" && score>=300){ secretDragonSession=false; drawThemePreviews(); }
        if (gameCompleted()) {
          localStorage.setItem("koiHuntLunarUnlocked","true");
          updateLunarControls();
        }
      }
      if (target.golden) playGoldenChime();
      placeTarget();
    } else snake.pop();
    drawGame();
  }

  function endGame() {
    stopGame();
    ui.overlayTitle.textContent = "SELF BITTEN";
    if(selectedThemeKey==="dragonHoard" && !dragonPermanentlyUnlocked()){
      secretDragonSession=false;
      selectedThemeKey="anacondaPond";
      localStorage.setItem("koiHuntTheme",selectedThemeKey);
      scheduleNextGoldenKoi(120000,240000);
      ui.overlayText.textContent = `THE DRAGON LOST THE HOARD. SCORE: ${score} · WAIT FOR THE GOLDEN KOI TO RETURN.`;
      ui.overlayButton.textContent = "RETURN TO MENU";
      ui.overlayButton.dataset.action = "home";
    } else {
      ui.overlayText.textContent = selectedThemeKey==="dragonHoard" && (bestScores.dragonHoard||0)>=300 ? `DRAGON'S HOARD UNLOCKED! SCORE: ${score}` : `THE SNAKE CAUGHT ITS OWN BODY. SCORE: ${score}`;
      ui.overlayButton.textContent = "PLAY AGAIN";
      ui.overlayButton.dataset.action = "restart";
    }
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

  function availablePreyVariants(theme) {
    return (theme.preyPalettes || []).map((_, index) => index);
  }

  function placeTarget() {
    const theme=currentTheme();
    do {
      target = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    } while (snake.some(s => s.x === target.x && s.y === target.y));
    const choices=availablePreyVariants(theme);
    target.variant=choices[Math.floor(Math.random()*choices.length)] || 0;
    target.golden=Math.random()<0.006;
    target.value=target.golden?100:10;
  }

  function playGoldenChime(){
    try{
      const ac=new (window.AudioContext||window.webkitAudioContext)();
      [523,659,784].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.08,ac.currentTime+i*.08);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.35+i*.08);o.start(ac.currentTime+i*.08);o.stop(ac.currentTime+.4+i*.08);});
    }catch(e){}
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
      ["moss",4,3],["moss",12,8],["moss",6,14],["moss",13,17],
      ["bug",4,2],["bug",15,5],["bug",8,11],["bug",12,16],
      ["leaf",2,17],["leaf",16,1]
    ],
    cherry: [["flower",2,2],["flower",16,3],["stone",4,16],["stone",15,15],["leaf",9,3]],
    desert: [
      ["cactus",2,3],["cactus",16,14],["rock",4,16],["rock",15,4],["scrub",8,3],["scrub",12,17]
    ],
    deepPond: [
      ["weed",1,2],["weed",17,16],["lily",16,2],["lily",3,17],["bubble",5,5],["bubble",14,12],["shadow",9,16]
    ],
    openOcean: [
      ["coral",2,16],["coral",16,3],["seaweed",1,4],["seaweed",18,14],["bubble",5,5],["bubble",14,12],["rock",9,17]
    ]
  };


  function targetEscapeDirection() {
    if (!snake.length) return { x: 1, y: 0 };
    let dx = target.x - snake[0].x;
    let dy = target.y - snake[0].y;
    if (Math.abs(dx) >= Math.abs(dy)) return { x: dx >= 0 ? 1 : -1, y: 0 };
    return { x: 0, y: dy >= 0 ? 1 : -1 };
  }
  function drawGame() {
    const theme = currentTheme();
    drawWorldBackground(ctx, gameCanvas.width, gameCanvas.height, theme.background, animationFrame);
    drawWorldDecorations(ctx, theme.background, tileSize);

    if (lunarMode) {
      // Darken the world before drawing characters so their glow stays vivid.
      ctx.save();
      ctx.fillStyle = "rgba(2, 7, 28, .64)";
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      const pulse = .72 + Math.sin(performance.now() / 310) * .18;
      const glow = theme.snake.accent || "#66ddff";

      // Large soft halos under every snake segment.
      ctx.globalCompositeOperation = "screen";
      snake.forEach((seg, i) => {
        const cx = seg.x * tileSize + tileSize / 2;
        const cy = seg.y * tileSize + tileSize / 2;
        const radius = tileSize * (i === 0 ? 1.15 : .95);
        const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
        g.addColorStop(0, glow + "cc");
        g.addColorStop(.35, glow + "77");
        g.addColorStop(1, glow + "00");
        ctx.globalAlpha = pulse;
        ctx.fillStyle = g;
        ctx.fillRect(cx-radius, cy-radius, radius*2, radius*2);
      });

      // Strong prey halo, brighter still for golden prey.
      const tx = target.x * tileSize + tileSize / 2;
      const ty = target.y * tileSize + tileSize / 2;
      const preyGlow = target.golden ? "#ffd84d" : glow;
      const tr = tileSize * (target.golden ? 1.65 : 1.28);
      const tg = ctx.createRadialGradient(tx, ty, 1, tx, ty, tr);
      tg.addColorStop(0, preyGlow + "ee");
      tg.addColorStop(.32, preyGlow + "99");
      tg.addColorStop(1, preyGlow + "00");
      ctx.globalAlpha = target.golden ? 1 : pulse;
      ctx.fillStyle = tg;
      ctx.fillRect(tx-tr, ty-tr, tr*2, tr*2);
      ctx.restore();

      // Multiple luminous render passes make the sprites themselves glow.
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = preyGlow;
      ctx.shadowBlur = target.golden ? 34 : 25;
      ctx.globalAlpha = .92;
      drawTarget(ctx, target.x * tileSize, target.y * tileSize, theme, tileSize, targetEscapeDirection());
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = glow;
      ctx.shadowBlur = 30;
      ctx.globalAlpha = .9;
      drawSnake(ctx, snake, theme, tileSize, direction);
      ctx.restore();
    }

    drawTarget(ctx, target.x * tileSize, target.y * tileSize, theme, tileSize, targetEscapeDirection());
    drawSnake(ctx, snake, theme, tileSize, direction);
    drawAmbientEvent(ctx, theme, performance.now());
    drawLunarCreatures(ctx, theme, performance.now());

    if (lunarMode) {
      // Bright eye and sparkle highlights on top of the normal sprites.
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 18;
      const head = snake[0];
      if (head) {
        ctx.fillStyle = "rgba(255,255,255,.95)";
        ctx.fillRect(head.x*tileSize + tileSize*.34, head.y*tileSize + tileSize*.27, 3, 3);
        ctx.fillRect(head.x*tileSize + tileSize*.62, head.y*tileSize + tileSize*.27, 3, 3);
      }
      ctx.restore();
    }

    ctx.strokeStyle = theme.background.includes("pond") || theme.background === "deepPond" || theme.background === "openOcean" ? "#16443a" : "#493c27";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, gameCanvas.width - 8, gameCanvas.height - 8);
  }

  function drawWorldBackground(c, width, height, kind, frame = 0) {
    const cell = width / 20;
    const palettes = {
      pond: ["#078cc4","#0879aa","#0b96c5","#087fae"],
      deepPond: ["#075f88","#084e72","#0a7397","#086488"],
      openOcean: ["#064f78","#075f8e","#08709c","#0a5a83"],
      dragonCave: ["#3a211c","#4b2a20","#2b1918","#5c321f"],
      brightGrass: ["#a8c96a","#b6d878","#97bc5a","#c5df89"],
      canopy: ["#174f2d","#1c6334","#245b31","#0f4228"],
      cherry: [["flower",2,2],["flower",16,3],["stone",4,16],["stone",15,15],["leaf",9,3]],
    desert: ["#d4a95d","#e1bd72","#c9974f","#eccb84"],
      cherry: ["#efb7cf","#f8d8e5","#d999ba","#f6c8d9"]
    };
    const palette = palettes[kind] || palettes.pond;
    c.fillStyle = palette[0];
    c.fillRect(0, 0, width, height);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
      c.fillStyle = palette[(x * 5 + y * 7) % palette.length];
      c.fillRect(x * cell, y * cell, cell, cell);
    }
    if (kind === "dragonCave") {
      // The entire floor is a dense treasure hoard: coins, swords and chests.
      c.fillStyle="#8a5a17"; c.fillRect(0,0,width,height);
      for(let i=0;i<260;i++){
        const x=(i*67+31)%width, y=(i*101+17)%height;
        c.fillStyle=i%3===0?"#ffd65a":i%3===1?"#e5ad2f":"#b97d1d";
        c.fillRect(x,y,cell*.24,cell*.18);
        c.fillStyle="rgba(255,245,150,.8)";
        c.fillRect(x+cell*.06,y+cell*.03,cell*.08,cell*.05);
      }
      // Treasure chests.
      for(let i=0;i<30;i++){
        const x=(i*149+55)%width, y=(i*83+92)%height;
        c.fillStyle="#6f351d"; c.fillRect(x,y,cell*1.35,cell*.9);
        c.fillStyle="#9c5127"; c.fillRect(x+cell*.10,y-cell*.22,cell*1.12,cell*.40);
        c.fillStyle="#f2c14d"; c.fillRect(x+cell*.58,y+cell*.25,cell*.18,cell*.34);
        c.fillStyle="#d89d32"; c.fillRect(x,y+cell*.12,cell*1.35,cell*.12);
      }
      // Crossed swords scattered through the gold.
      c.save();
      for(let i=0;i<38;i++){
        const x=(i*113+25)%width, y=(i*157+48)%height;
        c.save(); c.translate(x,y); c.rotate((i%4)*Math.PI/4);
        c.fillStyle="#dfe7ea"; c.fillRect(-cell*.05,-cell*.65,cell*.10,cell*1.05);
        c.fillStyle="#ffffff"; c.fillRect(-cell*.02,-cell*.62,cell*.035,cell*.72);
        c.fillStyle="#8b5a2b"; c.fillRect(-cell*.10,cell*.34,cell*.20,cell*.30);
        c.fillStyle="#f0c14b"; c.fillRect(-cell*.26,cell*.27,cell*.52,cell*.10);
        c.restore();
      }
      c.restore();
    } else if (kind === "pond" || kind === "deepPond" || kind === "openOcean") {
      c.fillStyle = "rgba(220,250,255,.18)";
      for (let i=0;i<18;i++) c.fillRect(((i*109)+(frame*3))%width,(i*71)%height,cell*1.8,Math.max(3,cell/5));
    } else if (kind === "brightGrass") {
      c.fillStyle = "rgba(255,255,210,.17)";
      for (let i=0;i<20;i++) c.fillRect(((i*83)+(frame*2))%width,(i*53)%height,cell,Math.max(3,cell/5));
    } else if (kind === "cherry") {
      c.fillStyle="#7f9d62"; c.fillRect(0,height*.64,width,height*.36);
      c.fillStyle="#8b5a3c";
      for(let i=0;i<5;i++){const tx=(i*.23+.05)*width;c.fillRect(tx,height*.16,cell*.55,height*.58);c.fillStyle=i%2?"#f59bc2":"#ffd2e2";c.fillRect(tx-cell*1.2,height*.08,cell*2.8,cell*2.2);c.fillStyle="#8b5a3c";}
      c.fillStyle="rgba(255,245,252,.35)";for(let i=0;i<20;i++)c.fillRect(((i*83)+(frame*2))%width,(i*47)%height,cell*.35,cell*.18);
    } else if (kind === "canopy") {
      // This level is viewed from directly above a massive moss-covered trunk.
      const trunkX = width * .18;
      const trunkW = width * .64;
      c.fillStyle = "#694625";
      c.fillRect(trunkX, 0, trunkW, height);
      c.fillStyle = "#8a6030";
      c.fillRect(trunkX + cell * .7, 0, trunkW - cell * 1.4, height);
      c.fillStyle = "#4c321e";
      for (let y = 0; y < height; y += cell * 2.4) {
        c.fillRect(trunkX + cell * .3, y, cell * .7, cell * 1.1);
        c.fillRect(trunkX + trunkW - cell * 1.1, y + cell, cell * .65, cell * .9);
      }
      c.fillStyle = "#60963e";
      for (let i=0;i<22;i++) {
        const mx = trunkX + ((i * 71) % Math.max(1, trunkW - cell));
        const my = ((i * 113) + frame) % height;
        c.fillRect(mx, my, cell * .65, cell * .3);
      }
      c.fillStyle = "rgba(146,238,92,.18)";
      for (let i=0;i<16;i++) c.fillRect(trunkX + ((i*97)%trunkW),((i*59)+(frame%30))%height,cell*.7,cell*.7);
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
      } else if (type === "coral") {
        c.fillStyle="#ef765d"; c.fillRect(x+cell*.42,y+cell*.18,cell*.18,cell*.76); c.fillRect(x+cell*.18,y+cell*.38,cell*.28,cell*.18); c.fillRect(x+cell*.56,y+cell*.52,cell*.28,cell*.18);
        c.fillStyle="#ffb06f"; c.fillRect(x+cell*.36,y+cell*.12,cell*.30,cell*.18);
      } else if (type === "seaweed") {
        c.fillStyle="#1f8b62"; c.fillRect(x+cell*.15,y+cell*.25,cell*.16,cell*.72); c.fillRect(x+cell*.42,y+cell*.08,cell*.16,cell*.89); c.fillRect(x+cell*.70,y+cell*.34,cell*.16,cell*.63);
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
    if (theme.snakeStyle === "dragon") {
      // Armored dragon body viewed from above: ridge, scales and side spikes.
      c.fillStyle=index%2?"#a92226":"#c43b2f"; c.fillRect(ox,oy,size,size);
      c.fillStyle="#6b1119"; c.fillRect(ox+size*.42,oy,size*.16,size);
      c.fillStyle="#ef9a34"; c.fillRect(ox+size*.15,oy+size*.20,size*.22,size*.22); c.fillRect(ox+size*.62,oy+size*.58,size*.20,size*.20);
      c.fillStyle="#e7c05d";
      c.fillRect(ox-size*.10,oy+size*.22,size*.16,size*.18); c.fillRect(ox+size*.94,oy+size*.58,size*.16,size*.18);
    } else if (theme.snakeStyle === "leucistic") {
      c.fillRect(ox+size*.18,oy+size*.18,size*.28,size*.28); c.fillRect(ox+size*.55,oy+size*.55,size*.25,size*.25);
      c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.42,oy,size*.12,size);
    } else if (theme.snakeStyle === "bamboo") {
      c.fillRect(ox+size*.15,oy+size*.15,size*.7,size*.22); c.fillRect(ox+size*.34,oy+size*.45,size*.46,size*.34);
      c.fillStyle=theme.snake.white; c.fillRect(ox+size*.08,oy+size*.62,size*.28,size*.22);
    } else if (theme.snakeStyle === "treePython") {
      c.fillRect(ox+size*.32,oy,size*.2,size); c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.08,oy+size*.18,size*.2,size*.2);
    } else if (theme.snakeStyle === "rattlesnake") {
      c.fillRect(ox+size*.18,oy+size*.18,size*.28,size*.28); c.fillRect(ox+size*.55,oy+size*.55,size*.28,size*.28);
      c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.45,oy,size*.12,size);
    } else if (theme.snakeStyle === "seaSnake") {
      c.fillRect(ox+size*.08,oy+size*.38,size*.84,size*.24);
      c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.18,oy+size*.12,size*.18,size*.18); c.fillRect(ox+size*.62,oy+size*.70,size*.18,size*.18);
    } else {
      c.fillRect(ox+size*.15,oy+size*.18,size*.34,size*.48); c.fillRect(ox+size*.55,oy+size*.44,size*.28,size*.35);
      c.fillStyle=theme.snake.accent; c.fillRect(ox+size*.08,oy+size*.08,size*.18,size*.18);
    }
  }

  function drawSnakeHead(c,x,y,theme,cell,facing) {
    c.fillStyle=theme.snake.main; c.fillRect(x+cell*.08,y+cell*.08,cell*.84,cell*.84);
    c.fillStyle=theme.snake.light; c.fillRect(x+cell*.18,y+cell*.18,cell*.64,cell*.58);
    c.fillStyle=theme.snake.dark;
    if (theme.snakeStyle === "dragon") {
      // Large horned dragon head with a gold brow and fiery nostrils.
      c.fillStyle="#b62b2d"; c.fillRect(x+cell*.04,y+cell*.10,cell*.92,cell*.78);
      c.fillStyle="#e45a32"; c.fillRect(x+cell*.18,y+cell*.18,cell*.64,cell*.54);
      c.fillStyle="#f2c552"; c.fillRect(x+cell*.12,y+cell*.02,cell*.18,cell*.30); c.fillRect(x+cell*.70,y+cell*.02,cell*.18,cell*.30);
      c.fillStyle="#6d1117"; c.fillRect(x+cell*.30,y+cell*.52,cell*.14,cell*.14); c.fillRect(x+cell*.58,y+cell*.52,cell*.14,cell*.14);
      c.fillStyle="#ff8a2a"; c.fillRect(x+cell*.34,y+cell*.56,cell*.06,cell*.06); c.fillRect(x+cell*.62,y+cell*.56,cell*.06,cell*.06);
    } else if (theme.snakeStyle === "leucistic") {
      c.fillStyle=theme.snake.accent;
      c.fillRect(x+cell*.18,y+cell*.20,cell*.24,cell*.24);
      c.fillRect(x+cell*.58,y+cell*.54,cell*.22,cell*.22);
      c.fillRect(x+cell*.44,y+cell*.10,cell*.12,cell*.70);
    } else if (theme.snakeStyle === "bamboo") {
      c.fillRect(x+cell*.15,y+cell*.22,cell*.7,cell*.5); c.fillStyle=theme.snake.white; c.fillRect(x+cell*.1,y+cell*.12,cell*.28,cell*.22); c.fillRect(x+cell*.62,y+cell*.12,cell*.28,cell*.22);
    } else if (theme.snakeStyle === "treePython") {
      c.fillRect(x+cell*.35,y+cell*.12,cell*.22,cell*.68); c.fillStyle=theme.snake.accent; c.fillRect(x+cell*.1,y+cell*.38,cell*.22,cell*.18);
    } else if (theme.snakeStyle === "rattlesnake") {
      c.fillRect(x+cell*.18,y+cell*.18,cell*.28,cell*.28); c.fillRect(x+cell*.55,y+cell*.5,cell*.25,cell*.25);
    } else if (theme.snakeStyle === "seaSnake") {
      c.fillRect(x+cell*.12,y+cell*.38,cell*.76,cell*.22);
      c.fillStyle=theme.snake.accent; c.fillRect(x+cell*.18,y+cell*.15,cell*.18,cell*.18); c.fillRect(x+cell*.64,y+cell*.66,cell*.18,cell*.18);
    } else {
      c.fillRect(x+cell*.24,y+cell*.25,cell*.25,cell*.25); c.fillRect(x+cell*.55,y+cell*.55,cell*.24,cell*.2);
    }
    let eyes;
    if(facing.x===1) eyes=[[.72,.2],[.72,.62]]; else if(facing.x===-1) eyes=[[.12,.2],[.12,.62]]; else if(facing.y===-1) eyes=[[.2,.12],[.62,.12]]; else eyes=[[.2,.72],[.62,.72]];
    c.fillStyle=theme.snake.eye; eyes.forEach(([ex,ey])=>c.fillRect(x+cell*ex,y+cell*ey,cell*.16,cell*.16));
    c.fillStyle="#101717"; eyes.forEach(([ex,ey])=>c.fillRect(x+cell*(ex+.06),y+cell*(ey+.04),cell*.06,cell*.09));
  }

  function drawTarget(c,x,y,theme,cell,facing={x:1,y:0}) {
    c.save(); c.translate(x+cell/2,y+cell/2);
    const angle=facing.x===1?0:facing.x===-1?Math.PI:facing.y===1?Math.PI/2:-Math.PI/2;
    c.rotate(angle); c.translate(-cell/2,-cell/2);
    let pal=(theme.preyPalettes||[])[target.variant||0]||theme.preyPalettes?.[0]||{};
    if(target.golden) pal={main:"#f2c83f",light:"#fff29a",dark:"#9b6b12",pink:"#ffd65c",beak:"#fff0a0",skin:"#e5b94f",suit:"#fff08a",hair:"#8a611c",foam:"#fff8bd",kind:theme.targetName==="SEA PREY"?"mermaid":pal.kind};

    if(theme.targetName==="POND FISH"){
      // True bird's-eye koi: symmetrical fins, tapered body and dorsal markings.
      c.fillStyle=pal.light;c.fillRect(cell*.03,cell*.37,cell*.22,cell*.26);c.fillRect(cell*.04,cell*.20,cell*.14,cell*.20);c.fillRect(cell*.04,cell*.60,cell*.14,cell*.20);
      c.fillStyle=pal.main;c.fillRect(cell*.20,cell*.25,cell*.58,cell*.50);c.fillRect(cell*.70,cell*.32,cell*.22,cell*.36);
      c.fillStyle=pal.spot||pal.dark;c.fillRect(cell*.31,cell*.29,cell*.18,cell*.18);c.fillRect(cell*.55,cell*.51,cell*.16,cell*.16);
      if(pal.spot2){c.fillStyle=pal.spot2;c.fillRect(cell*.46,cell*.39,cell*.15,cell*.14);c.fillRect(cell*.69,cell*.34,cell*.10,cell*.12);}
      c.fillStyle=pal.dark;c.fillRect(cell*.80,cell*.39,cell*.05,cell*.05);c.fillRect(cell*.80,cell*.56,cell*.05,cell*.05);
    } else if(theme.targetName==="MOUSE"){
      c.fillStyle=pal.pink;c.fillRect(cell*.02,cell*.46,cell*.27,cell*.09);
      c.fillStyle=pal.main;c.fillRect(cell*.24,cell*.28,cell*.49,cell*.44);c.fillRect(cell*.68,cell*.35,cell*.22,cell*.30);
      c.fillStyle=pal.light;c.fillRect(cell*.30,cell*.18,cell*.19,cell*.19);c.fillRect(cell*.30,cell*.63,cell*.19,cell*.19);
      c.fillStyle=pal.dark;c.fillRect(cell*.73,cell*.39,cell*.07,cell*.07);c.fillRect(cell*.73,cell*.57,cell*.07,cell*.07);
    } else if(theme.targetName==="TREE FROG"){
      c.fillStyle=pal.dark;c.fillRect(cell*.05,cell*.12,cell*.28,cell*.13);c.fillRect(cell*.05,cell*.75,cell*.28,cell*.13);c.fillRect(cell*.65,cell*.08,cell*.28,cell*.13);c.fillRect(cell*.65,cell*.79,cell*.28,cell*.13);
      c.fillStyle=pal.main;c.fillRect(cell*.25,cell*.23,cell*.52,cell*.54);c.fillRect(cell*.60,cell*.18,cell*.25,cell*.25);c.fillRect(cell*.60,cell*.58,cell*.25,cell*.25);
      c.fillStyle=pal.light;c.fillRect(cell*.34,cell*.30,cell*.26,cell*.40);
    } else if(theme.targetName==="CARDINAL"){
      // Bird's-eye bird with wings spread evenly from the body.
      c.fillStyle=pal.dark;c.fillRect(cell*.08,cell*.22,cell*.30,cell*.20);c.fillRect(cell*.08,cell*.58,cell*.30,cell*.20);
      c.fillRect(cell*.28,cell*.16,cell*.20,cell*.18);c.fillRect(cell*.28,cell*.66,cell*.20,cell*.18);
      c.fillStyle=pal.main;c.fillRect(cell*.30,cell*.25,cell*.46,cell*.50);c.fillRect(cell*.66,cell*.34,cell*.20,cell*.32);
      c.fillStyle=pal.light;c.fillRect(cell*.39,cell*.34,cell*.18,cell*.32);
      c.fillStyle=pal.beak;c.fillRect(cell*.84,cell*.44,cell*.12,cell*.12);
      c.fillStyle="#111";c.fillRect(cell*.73,cell*.34,cell*.05,cell*.05);c.fillRect(cell*.73,cell*.61,cell*.05,cell*.05);
    } else if(theme.targetName==="DESERT LIZARD"){
      c.fillStyle=pal.dark;c.fillRect(cell*.02,cell*.46,cell*.30,cell*.09);c.fillRect(cell*.20,cell*.37,cell*.17,cell*.09);c.fillRect(cell*.20,cell*.56,cell*.17,cell*.09);
      c.fillStyle=pal.main;c.fillRect(cell*.25,cell*.34,cell*.50,cell*.32);c.fillRect(cell*.69,cell*.29,cell*.24,cell*.42);
      c.fillStyle=pal.light;c.fillRect(cell*.38,cell*.38,cell*.22,cell*.12);
    } else if(theme.targetName==="TREASURE HUNTER"){
      if(target.golden){
        c.fillStyle="#f6d85e";c.fillRect(cell*.32,cell*.22,cell*.38,cell*.48);c.fillStyle="#fff4aa";c.fillRect(cell*.38,cell*.08,cell*.26,cell*.22);
        c.fillStyle="#9b6b12";c.fillRect(cell*.18,cell*.35,cell*.18,cell*.12);c.fillRect(cell*.68,cell*.35,cell*.18,cell*.12);c.fillRect(cell*.33,cell*.68,cell*.13,cell*.24);c.fillRect(cell*.56,cell*.68,cell*.13,cell*.24);
      } else {
        // High-contrast running adventurer, readable at a glance from above.
        c.fillStyle="rgba(0,0,0,.55)"; c.fillRect(cell*.16,cell*.10,cell*.70,cell*.82);
        c.fillStyle=pal.skin;c.fillRect(cell*.38,cell*.08,cell*.27,cell*.24);
        c.fillStyle=pal.hair;c.fillRect(cell*.34,cell*.04,cell*.35,cell*.10);
        c.fillStyle="#f3e25a"; c.fillRect(cell*.29,cell*.30,cell*.44,cell*.34);
        c.fillStyle="#d94132"; c.fillRect(cell*.29,cell*.30,cell*.12,cell*.34); c.fillRect(cell*.61,cell*.30,cell*.12,cell*.34);
        c.fillStyle="#4b2d1d"; c.fillRect(cell*.40,cell*.34,cell*.22,cell*.25); // backpack
        c.fillStyle=pal.skin;c.fillRect(cell*.08,cell*.34,cell*.27,cell*.13);c.fillRect(cell*.67,cell*.51,cell*.27,cell*.13);
        c.fillStyle="#2957a4";c.fillRect(cell*.31,cell*.62,cell*.17,cell*.29);c.fillRect(cell*.55,cell*.62,cell*.17,cell*.29);
        c.fillStyle="#f6f0db"; c.fillRect(cell*.30,cell*.86,cell*.20,cell*.09); c.fillRect(cell*.54,cell*.86,cell*.20,cell*.09);
      }
    } else {
      const kind=pal.kind||"swimmer";
      if(kind==="puffer"){
        c.fillStyle=pal.dark;for(let i=0;i<6;i++)c.fillRect(cell*(.18+i*.11),cell*(i%2?.16:.75),cell*.08,cell*.1);
        c.fillStyle=pal.main;c.fillRect(cell*.22,cell*.22,cell*.58,cell*.56);c.fillStyle=pal.light;c.fillRect(cell*.34,cell*.31,cell*.28,cell*.24);c.fillStyle="#111";c.fillRect(cell*.68,cell*.34,cell*.07,cell*.07);
      } else {
        c.fillStyle=pal.foam;c.fillRect(cell*.02,cell*.18,cell*.16,cell*.15);c.fillRect(cell*.02,cell*.67,cell*.16,cell*.15);
        c.fillStyle=pal.skin;c.fillRect(cell*.08,cell*.28,cell*.32,cell*.13);c.fillRect(cell*.08,cell*.59,cell*.32,cell*.13);c.fillRect(cell*.34,cell*.34,cell*.32,cell*.32);c.fillRect(cell*.55,cell*.18,cell*.32,cell*.12);c.fillRect(cell*.55,cell*.70,cell*.32,cell*.12);c.fillRect(cell*.67,cell*.37,cell*.24,cell*.26);
        c.fillStyle=pal.suit;c.fillRect(cell*.31,cell*.35,cell*.32,cell*.30);c.fillStyle=pal.hair;c.fillRect(cell*.72,cell*.36,cell*.17,cell*.10);
        if(kind==="mermaid"){c.fillStyle="#f3d35c";c.fillRect(cell*.06,cell*.40,cell*.30,cell*.20);c.fillRect(cell*.00,cell*.27,cell*.16,cell*.18);c.fillRect(cell*.00,cell*.55,cell*.16,cell*.18);}
      }
    }
    if(target.golden){c.fillStyle="rgba(255,255,190,.9)";const t=(animationFrame%8)/8;for(let i=0;i<4;i++)c.fillRect(cell*(.15+((i*37+t*20)%70)/100),cell*(.12+((i*29+t*18)%70)/100),cell*.07,cell*.07);}
    c.fillStyle="#111";c.fillRect(cell*.80,cell*.34,cell*.06,cell*.06);
    c.restore();
  }

  function drawAmbientEvent(c,theme,now){
    const cycle=42000, elapsed=(now-ambientStart)%cycle;
    if(elapsed<30000) return;
    const p=(elapsed-30000)/12000, w=gameCanvas.width, h=gameCanvas.height;
    c.save(); c.globalAlpha=Math.min(1,p*4,(1-p)*4);
    if(theme.background==="dragonCave"){
      const burst=Math.sin(p*Math.PI);
      c.fillStyle="rgba(255,102,20,.22)";c.fillRect(0,0,w,h);
      c.fillStyle="#ff5a19";for(let i=0;i<9;i++)c.fillRect(w*.22+i*28,h*.22+i*6,44+burst*35,20);
      c.fillStyle="#ffd34e";for(let i=0;i<7;i++)c.fillRect(w*.25+i*31,h*.235+i*6,28+burst*24,9);
      c.fillStyle="#ff9a35";for(let i=0;i<18;i++)c.fillRect((w*.25+i*53+p*w*.2)%w,h*.12+(i%5)*26,6,6);
    } else if(theme.background==="pond"){
      const x=p*w;c.fillStyle="#55b83e";c.fillRect(x,h*.66,52,30);c.fillStyle="#d9f27a";c.fillRect(x+36,h*.61,22,22);
      c.fillStyle="#f5aac8";for(let i=0;i<26;i++)c.fillRect((p*w+i*47)%w,(i*31+p*h*.55)%h,9,6);
    } else if(theme.background==="brightGrass"){
      c.fillStyle="#171717";c.fillRect(w*.02,h*.24,80,90);c.fillStyle="#f4efe0";c.fillRect(w*.04,h*.28,28,28);c.fillRect(w*.11,h*.28,28,28);
      c.fillStyle="#88a83d";for(let i=0;i<28;i++)c.fillRect((p*w+i*37)%w,(i*67)%h,10,6);
    } else if(theme.background==="canopy"){
      c.fillStyle="#ed3c38";for(let i=0;i<4;i++){let x=(p*w+i*145)%w;c.fillRect(x,45+(i%2)*60,58,24);c.fillStyle="#ffd34d";c.fillRect(x+44,51+(i%2)*60,14,10);c.fillStyle="#ed3c38";}
      c.fillStyle="#84542d";c.fillRect(p*w,h*.74,65,38);
    } else if(theme.background==="cherry"){
      c.fillStyle="#f7a4c8";for(let i=0;i<36;i++)c.fillRect((p*w+i*53)%w,(i*37+elapsed*.05)%h,10,7);
      c.fillStyle="#a97951";c.fillRect(w*.05+p*w*.68,h*.72,58,34);c.fillStyle="#f4e4c8";c.fillRect(w*.09+p*w*.68,h*.67,26,24);
    } else if(theme.background==="desert"){
      const x=p*w;c.fillStyle="#7a552d";c.fillRect(x,h*.68,70,27);c.fillStyle="#e1bd72";c.fillRect(x-30,h*.62,38,16);
      c.strokeStyle="rgba(224,184,105,.75)";c.lineWidth=12;c.beginPath();c.arc(w*(1-p),h*.5,45+p*30,0,Math.PI*2);c.stroke();
    } else {
      const x=w*(1-p);c.fillStyle="#4b8fa7";c.fillRect(x,h*.20,190,68);c.fillStyle="#a9d7e0";c.fillRect(x+135,h*.27,28,10);
      c.fillStyle="#6fc6a2";c.fillRect(p*w,h*.65,95,48);
      c.fillStyle="#d7f4ff";for(let i=0;i<24;i++)c.fillRect((i*41+p*w)%w,h-(i*29%h),7,7);
    }
    c.restore();
  }
  function drawLunarCreatures(c,theme,now){
    if(!lunarMode) return; const w=gameCanvas.width,h=gameCanvas.height,t=now/1000; c.save();c.globalCompositeOperation="screen";
    if(theme.background==="openOcean"){
      for(let i=0;i<5;i++){const x=((t*(22+i*5)+i*130)%(w+100))-50,y=70+i*105+Math.sin(t+i)*20;c.shadowColor=i%2?"#8c7bff":"#54e5ff";c.shadowBlur=24;c.fillStyle=i%2?"#9a83ff":"#63e8ff";c.fillRect(x,y,35+i*3,22);for(let j=0;j<4;j++)c.fillRect(x+5+j*8,y+22,3,22+Math.sin(t*3+j)*5);}
    } else {
      const color=theme.background==="desert"?"#ffc957":theme.background==="cherry"?"#ff9cda":theme.background==="canopy"?"#a9ff54":theme.background==="brightGrass"?"#62ff9c":"#55eaff";
      c.shadowColor=color;c.shadowBlur=14;c.fillStyle=color;for(let i=0;i<28;i++){const x=(i*83+Math.sin(t*.8+i)*52+w)%w,y=(i*47+t*(8+i%4))%h;c.globalAlpha=.35+.65*Math.abs(Math.sin(t*2+i));c.fillRect(x,y,4+(i%2)*2,4+(i%2)*2);}
    } c.restore();
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
    const c = menuCtx;
    drawWorldBackground(c,menuCanvas.width,menuCanvas.height,"pond",frame);
    const cell = menuCanvas.width / 20;
    // faint gameplay grid makes the menu feel like a living match
    c.strokeStyle = "rgba(7,65,80,.22)";
    c.lineWidth = 1;
    for (let i=0;i<=20;i++) {
      c.beginPath(); c.moveTo(i*cell,0); c.lineTo(i*cell,menuCanvas.height); c.stroke();
      c.beginPath(); c.moveTo(0,i*cell); c.lineTo(menuCanvas.width,i*cell); c.stroke();
    }
    drawMenuPondDecorations(frame);
    drawMenuFish(frame);
  }

  function scheduleNextGoldenKoi(delayMin=120000, delayMax=240000){
    goldenKoiAvailable=false;
    goldenKoiVisibleUntil=0;
    nextGoldenKoiAt=performance.now()+delayMin+Math.random()*(delayMax-delayMin);
    if(secretGoldenKoiButton){
      secretGoldenKoiButton.classList.remove("golden-koi-active");
      secretGoldenKoiButton.style.display="none";
    }
  }
  function launchDragonHoardFromGoldenKoi(event){
    if(event){event.preventDefault();event.stopPropagation();}
    if(!goldenKoiAvailable) return;
    goldenKoiAvailable=false;
    goldenKoiVisibleUntil=0;
    if(secretGoldenKoiButton){secretGoldenKoiButton.classList.remove("golden-koi-active");secretGoldenKoiButton.style.display="none";}
    secretDragonSession=true;
    selectedThemeKey="dragonHoard";
    localStorage.setItem("koiHuntTheme",selectedThemeKey);
    startGame();
  }
  function initMenuFish(){
    if(menuFish.length) return;
    for(let i=0;i<12;i++) menuFish.push({x:Math.random()*560,y:Math.random()*680,speed:.35+Math.random()*.7,size:16+Math.random()*12,golden:false,phase:Math.random()*20});
    
  }
  function drawMenuFish(frame){
    initMenuFish(); const c=menuCtx, now=performance.now();
    if(!goldenKoiAvailable && now>=nextGoldenKoiAt){
      goldenKoiAvailable=true;
      goldenKoiVisibleUntil=now+12000;
      if(secretGoldenKoiButton){
        secretGoldenKoiButton.style.top=(12+Math.random()*48)+"%";
        secretGoldenKoiButton.style.display="block";
        secretGoldenKoiButton.classList.remove("golden-koi-active");
        void secretGoldenKoiButton.offsetWidth;
        secretGoldenKoiButton.classList.add("golden-koi-active");
      }
    }
    if(goldenKoiAvailable && now>goldenKoiVisibleUntil) scheduleNextGoldenKoi();
    menuFish.forEach((f,i)=>{
      if(f.golden && !goldenKoiAvailable) return;
      f.x += f.speed; f.y += Math.sin(frame*.025+f.phase)*.18;
      if(f.x>590){
        if(f.golden){ scheduleNextGoldenKoi(); return; }
        f.x=-35;f.y=35+Math.random()*610;
      }
      c.save(); c.translate(f.x,f.y);
      if(f.golden){c.shadowColor="#ffe45d";c.shadowBlur=18+Math.sin(frame*.08)*6;}
      c.fillStyle=f.golden?"#f7cf3e":(i%3===0?"#f07d42":i%3===1?"#f3eee2":"#d75a35");
      c.fillRect(-f.size*.45,-f.size*.22,f.size*.72,f.size*.44);
      c.fillRect(f.size*.18,-f.size*.14,f.size*.3,f.size*.28);
      c.fillRect(-f.size*.68,-f.size*.28,f.size*.25,f.size*.22); c.fillRect(-f.size*.68,f.size*.06,f.size*.25,f.size*.22);
      c.fillStyle="#111";c.fillRect(f.size*.3,-f.size*.1,3,3); c.restore();
    });
  }
  const menuStage = document.querySelector(".menu-stage");
  menuStage.addEventListener("pointerdown",event=>{
    if(screens.home.classList.contains("hidden")) return;
    const r=menuCanvas.getBoundingClientRect();
    const x=(event.clientX-r.left)*menuCanvas.width/r.width;
    const y=(event.clientY-r.top)*menuCanvas.height/r.height;
    const gold=menuFish.find(f=>f.golden && goldenKoiAvailable && Math.hypot(x-f.x,y-f.y)<42);
    if(gold){
      event.preventDefault();
      event.stopPropagation();
      goldenKoiAvailable=false;
      goldenKoiVisibleUntil=0;
      secretDragonSession=true;
      selectedThemeKey="dragonHoard";
      startGame();
    }
  }, true);
  if(secretGoldenKoiButton){
    secretGoldenKoiButton.addEventListener("pointerdown",launchDragonHoardFromGoldenKoi,true);
    secretGoldenKoiButton.addEventListener("click",launchDragonHoardFromGoldenKoi,true);
    secretGoldenKoiButton.addEventListener("animationend",()=>{if(goldenKoiAvailable)scheduleNextGoldenKoi();});
  }

  function drawMenuPondDecorations(frame) {
    const c=menuCtx;
    [[36,72,56],[455,74,58],[28,490,64],[456,500,66],[60,590,46],[430,600,48]].forEach(([x,y,s],i)=>{
      const bob=Math.sin(frame*.03+i)*3; c.fillStyle="#285d2b"; c.fillRect(x,y+bob,s,s*.65); c.fillStyle="#477b34"; c.fillRect(x+s*.2,y-s*.12+bob,s*.62,s*.62);
    });
    [[18,165],[510,150],[16,370],[520,350]].forEach(([x,y],i)=>{const sway=Math.sin(frame*.04+i)*4;c.fillStyle="#126650";c.fillRect(x+sway,y+20,8,55);c.fillRect(x+12,y,8,75);c.fillRect(x+24-sway,y+12,8,63);});

  }

  function drawMovingMenuSnake(frame) {
    const c=menuCtx, points=[];
    const cx=280, cy=355, rx=220, ry=270;
    const count=50, phase=frame*.012;
    for(let i=0;i<count;i++){
      const t=(i/(count-1))*Math.PI*2+phase;
      const wobble=Math.sin(t*3+phase*2)*12;
      points.push({x:cx+(rx+wobble)*Math.cos(t),y:cy+(ry+wobble)*Math.sin(t)});
    }
    // prey runs just in front of the head
    const head=points[0], next=points[1];
    const vx=head.x-next.x, vy=head.y-next.y;
    const mag=Math.hypot(vx,vy)||1;
    const facing=Math.abs(vx)>=Math.abs(vy)?{x:Math.sign(vx)||1,y:0}:{x:0,y:Math.sign(vy)||1};
    const kx=head.x+(vx/mag)*58, ky=head.y+(vy/mag)*58;
    drawTarget(c,kx-24,ky-24,themes.anacondaPond,48,facing);
    for(let i=points.length-1;i>=1;i--){
      const p=points[i], progress=i/(points.length-1), size=31-progress*19;
      c.fillStyle=i%2?themes.anacondaPond.snake.main:themes.anacondaPond.snake.alt;c.fillRect(p.x-size/2,p.y-size/2,size,size);
      c.fillStyle=themes.anacondaPond.snake.dark;c.fillRect(p.x-size*.25,p.y-size*.2,size*.48,size*.35);
      c.fillStyle=themes.anacondaPond.snake.accent;c.fillRect(p.x-size*.34,p.y-size*.34,size*.18,size*.18);
    }
    drawSnakeHead(c,head.x-29,head.y-29,themes.anacondaPond,58,facing);
  }

  function drawThemePreviews() {
    document.querySelectorAll(".theme-card").forEach(card=>{
      const key=card.dataset.theme, theme=themes[key], canvas=card.querySelector("canvas"), pctx=canvas.getContext("2d");
      pctx.imageSmoothingEnabled=false;
      drawWorldBackground(pctx,canvas.width,canvas.height,theme.background,0);
      drawWorldDecorations(pctx,theme.background,canvas.width/20);
      const cell=canvas.width/16;
      drawSnake(pctx,[{x:8,y:5},{x:7,y:5},{x:6,y:5},{x:5,y:5},{x:4,y:5},{x:3,y:5}],theme,cell,{x:1,y:0});
      const savedTarget={...target};target.variant=0;target.golden=false;drawTarget(pctx,12*cell,5*cell,theme,cell*1.25,{x:1,y:0});target=savedTarget;
      const unlocked=themeUnlocked(key), selected=key===selectedThemeKey;
      if(key==="dragonHoard") card.classList.toggle("secret-hidden",!dragonPermanentlyUnlocked());
      card.classList.toggle("selected",selected); card.classList.toggle("locked",!unlocked);
      const button=card.querySelector(".theme-select"); button.disabled=!unlocked; button.textContent=selected?"EQUIPPED":unlocked?"SELECT":"LOCKED";
      const note=card.querySelector("[data-unlock-note]");
      if(note) {
        if(key==="dragonHoard") note.textContent=dragonPermanentlyUnlocked()?"SECRET WORLD UNLOCKED":"SCORE 300 IN THE SECRET LEVEL";
        else { const index=worldOrder.indexOf(key); const previous=worldOrder[index-1]; note.textContent=unlocked ? "AVAILABLE" : `SCORE ${completionScores[previous]} IN ${themes[previous].name}`; }
      }
    });
  }

  function selectTheme(key) {
    if(!themeUnlocked(key)) return;
    selectedThemeKey=key; localStorage.setItem("koiHuntTheme",key); drawThemePreviews();
  }


  let collectionPage=0;
  function updateCollectionScroller(){
    const grid=document.querySelector(".theme-grid");
    const cards=[...document.querySelectorAll(".theme-card:not(.secret-hidden)")];
    const maxPage=Math.max(0,Math.ceil(cards.length/2)-1);
    collectionPage=Math.max(0,Math.min(collectionPage,maxPage));
    if(grid) grid.style.transform=`translateX(-${collectionPage*100}%)`;
    if(ui.collectionPrev) ui.collectionPrev.disabled=collectionPage===0;
    if(ui.collectionNext) ui.collectionNext.disabled=collectionPage===maxPage;
  }
  ui.collectionPrev?.addEventListener("click",()=>{collectionPage--;updateCollectionScroller();});
  ui.collectionNext?.addEventListener("click",()=>{collectionPage++;updateCollectionScroller();});

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
  const gameCompleted = () => worldOrder.every(k => (bestScores[k] || 0) >= completionScores[k]);
  const lunarUnlocked = () => gameCompleted() || allLevelsUnlocked;
  function updateLunarControls(){
    if(!ui.lunarToggle) return;
    ui.lunarToggle.disabled=!lunarUnlocked();
    lunarMode=lunarUnlocked() && localStorage.getItem("koiHuntLunar")==="true";
    ui.lunarToggle.checked=lunarMode;
    if(ui.lunarStatus) ui.lunarStatus.textContent=lunarUnlocked()?"UNLOCKED · PASSWORD: MONSTERA":"COMPLETE ALL LEVELS";
  }
  updateLunarControls();
  if(ui.lunarToggle){
    ui.lunarToggle.addEventListener("change",()=>{lunarMode=ui.lunarToggle.checked;localStorage.setItem("koiHuntLunar",String(lunarMode));});
  }

  function passwordAccepted(){
    return (ui.passwordInput?.value || "").trim().toLowerCase() === "monstera";
  }
  function showPasswordMessage(text, ok=false){
    if(!ui.passwordMessage) return;
    ui.passwordMessage.textContent=text;
    ui.passwordMessage.dataset.ok=ok?"true":"false";
  }
  ui.unlockAll?.addEventListener("click",()=>{
    if(!passwordAccepted()) return showPasswordMessage("INCORRECT PASSWORD");
    allLevelsUnlocked=true;
    localStorage.setItem("koiHuntUnlockAll","true");
    showPasswordMessage("ALL LEVELS UNLOCKED",true);
    drawThemePreviews();
    updateLunarControls();
  });
  ui.resetProgress?.addEventListener("click",()=>{
    if(!passwordAccepted()) return showPasswordMessage("INCORRECT PASSWORD");
    Object.keys(bestScores).forEach(k=>delete bestScores[k]);
    localStorage.setItem("koiHuntBestScores","{}");
    localStorage.removeItem("koiHuntUnlockAll");
    localStorage.removeItem("koiHuntLunar");
    allLevelsUnlocked=false; lunarMode=false; secretDragonSession=false; selectedThemeKey="anacondaPond";
    localStorage.setItem("koiHuntTheme",selectedThemeKey);
    showPasswordMessage("LEVELS AND SCORES RESET",true);
    drawThemePreviews();
    updateLunarControls();
  });
  ui.overlayButton.addEventListener("click",()=>{const action=ui.overlayButton.dataset.action;if(action==="continue") resumeGame(); else if(action==="home") showHome(); else startGame();});


  document.querySelectorAll(".dpad-button[data-direction]").forEach(button => {
    const move = event => {
      event.preventDefault();
      if (gameRunning && !paused) setDirection(button.dataset.direction);
    };
    button.addEventListener("pointerdown", move);
    button.addEventListener("touchstart", move, { passive: false });
  });
  const mobilePause = document.querySelector(".dpad-button[data-action='pause']");
  if (mobilePause) mobilePause.addEventListener("pointerdown", event => {
    event.preventDefault();
    if (gameRunning) togglePause();
  });

  document.addEventListener("keydown",event=>{
    const key=event.key.toLowerCase(), controls={arrowup:"up",w:"up",arrowdown:"down",s:"down",arrowleft:"left",a:"left",arrowright:"right",d:"right"};
    if(controls[key]&&gameRunning&&!paused){event.preventDefault();setDirection(controls[key]);}
    if(event.code==="Space"&&gameRunning){event.preventDefault();togglePause();}
  });

  showHome();
})();
