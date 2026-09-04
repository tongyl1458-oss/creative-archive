// Browser-compatible version of the Stardew Valley desktop pet.
// Original game logic preserved from kele-desktop-pet-master/src/renderer.js
// Only Electron-specific APIs (ipcRenderer, require, path, file://) are adapted.

// ===== Inline character config (from characters.js) =====
const CHARACTERS = {
  cat2: {
    name: '猫猫',
    sprite: 'cat2.png',
    frameWidth: 32,
    frameHeight: 32,
    cols: 4,
    scale: 3,
    walkSpeed: 0.08,
    states: {
      walk: {
        directionRows: { down: 0, right: 1, up: 2, left: 3 },
        frameInterval: 350,
      },
      idle: { row: 4, frameInterval: 450, loops: false },
      lick: { row: 5, frameInterval: 400, loops: true },
      lie_down: { row: 6, frameInterval: 400, loops: false },
      sleep: { row: 7, frameInterval: 600, loops: false },
      eat: { row: 5, frameInterval: 300, loops: true },
      play: { row: 0, frameInterval: 150, loops: true },
    },
    transitions: {
      walk: [
        { state: 'idle', weight: 0.25 },
        { state: 'walk', weight: 0.25 },
        { state: 'lie_down', weight: 0.15 },
        { state: 'lick', weight: 0.15 },
        { state: 'sleep', weight: 0.20 },
      ],
      idle: { waitMin: 3000, waitMax: 6000, next: 'walk' },
      lick: { repeatMin: 2, repeatMax: 4, next: 'walk' },
      lie_down: { waitMin: 3000, waitMax: 6000, next: 'walk' },
      sleep: { waitMin: 5000, waitMax: 10000, next: 'walk' },
      eat: { repeatMin: 3, repeatMax: 5, next: 'walk' },
      play: { repeatMin: 4, repeatMax: 6, next: 'walk' },
    },
    walkDurationMin: 2000,
    walkDurationMax: 5000,
    doubleClickActions: [
      { state: 'lick', weight: 0.4 },
      { state: 'lie_down', weight: 0.3 },
      { state: 'sleep', weight: 0.3 },
    ],
  },
};

let currentCharKey = 'cat2';
let charConfig = CHARACTERS[currentCharKey];

// ===== Stub ipcRenderer (no-op in browser) =====
const ipcRenderer = {
  send: () => {},
  on: () => {},
  once: () => {},
};

// ===== Sound system (kept, but gracefully fails if files missing) =====
const sounds = {
  walk: new Audio(),
  meow1: new Audio(),
  meow2: new Audio(),
  lick: new Audio(),
  eat: new Audio(),
  play: new Audio(),
};

function loadSounds() {
  // Sounds are optional in browser mode - don't block if missing
  try {
    sounds.walk.src = 'cat_walk.wav';
    sounds.walk.loop = true;
    sounds.meow1.src = 'cat1.wav';
    sounds.meow2.src = 'cat2.wav';
    sounds.lick.src = 'cat_lick.wav';
    sounds.eat.src = 'cat_lick.wav';
    sounds.play.src = 'cat1.wav';
  } catch (e) {}
}

let walkSoundPlaying = false;
let lickSoundPlaying = false;

function playWalkSound() {
  if (!walkSoundPlaying && currentCharKey === 'cat2') {
    sounds.walk.currentTime = 0;
    sounds.walk.play().catch(() => {});
    walkSoundPlaying = true;
  }
}

function stopWalkSound() {
  if (walkSoundPlaying) {
    sounds.walk.pause();
    sounds.walk.currentTime = 0;
    walkSoundPlaying = false;
  }
}

function playLickSound() {
  if (!lickSoundPlaying && currentCharKey === 'cat2') {
    sounds.lick.currentTime = 0;
    sounds.lick.play().catch(() => {});
    lickSoundPlaying = true;
  }
}

function stopLickSound() {
  if (lickSoundPlaying) {
    sounds.lick.pause();
    sounds.lick.currentTime = 0;
    lickSoundPlaying = false;
  }
}

function playMeow() {
  if (currentCharKey !== 'cat2') return;
  const meow = Math.random() < 0.5 ? sounds.meow1 : sounds.meow2;
  meow.currentTime = 0;
  meow.play().catch(() => {});
}

function playEatSound() {
  if (currentCharKey !== 'cat2') return;
  sounds.eat.currentTime = 0;
  sounds.eat.play().catch(() => {});
}

function playPlaySound() {
  if (currentCharKey !== 'cat2') return;
  sounds.play.currentTime = 0;
  sounds.play.play().catch(() => {});
}

// ===== Food sprite sheet config =====
const FOOD_COLS = 3;
const FOOD_ROWS = 5;
const FOOD_SHEET_WIDTH = 272;
const FOOD_SHEET_HEIGHT = 428;
const FOOD_CELL_WIDTH = Math.floor(FOOD_SHEET_WIDTH / FOOD_COLS);
const FOOD_CELL_HEIGHT = Math.floor(FOOD_SHEET_HEIGHT / FOOD_ROWS);
const foodIcons = [];
let foodIconsLoaded = false;

function loadFoodIcons() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      for (let row = 0; row < FOOD_ROWS; row++) {
        for (let col = 0; col < FOOD_COLS; col++) {
          const idx = row * FOOD_COLS + col;
          if (idx >= 13) break;
          const sx = col * FOOD_CELL_WIDTH;
          const sy = row * FOOD_CELL_HEIGHT;
          const c = document.createElement('canvas');
          c.width = FOOD_CELL_WIDTH;
          c.height = FOOD_CELL_HEIGHT;
          const cx = c.getContext('2d');
          cx.drawImage(img, sx, sy, FOOD_CELL_WIDTH, FOOD_CELL_HEIGHT, 0, 0, FOOD_CELL_WIDTH, FOOD_CELL_HEIGHT);
          const imageData = cx.getImageData(0, 0, FOOD_CELL_WIDTH, FOOD_CELL_HEIGHT);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r > 248 && g > 248 && b > 248) data[i + 3] = 0;
          }
          cx.putImageData(imageData, 0, 0);
          foodIcons[idx] = c;
        }
      }
      foodIconsLoaded = true;
      resolve();
    };
    img.onerror = () => { resolve(); };
    img.src = 'foods.png';
  });
}

// ===== Bowl image =====
let bowlImage = null;
let bowlLoaded = false;
const BOWL_DISPLAY_SIZE = 20;

function loadBowl() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      bowlImage = removeBackground(img, 245);
      bowlLoaded = true;
      resolve();
    };
    img.onerror = () => { resolve(); };
    img.src = 'bowl.png';
  });
}

// ===== Heart bubble image =====
let heartBubbleImage = null;
let heartBubbleLoaded = false;
const HEART_BUBBLE_SIZE = 24;

function loadHeartBubble() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      heartBubbleImage = removeBackground(img, 245);
      heartBubbleLoaded = true;
      resolve();
    };
    img.onerror = () => { resolve(); };
    img.src = 'heart_bubble.png';
  });
}

// ===== Helper: Remove white/black background =====
function removeBackground(img, threshold) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const cx = c.getContext('2d');
  cx.drawImage(img, 0, 0);
  const imageData = cx.getImageData(0, 0, c.width, c.height);
  const data = imageData.data;
  const thr = threshold || 240;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if ((r > thr && g > thr && b > thr) || (r < 30 && g < 30 && b < 30)) {
      data[i + 3] = 0;
    }
  }
  cx.putImageData(imageData, 0, 0);
  return c;
}

// ===== Particle system =====
let particles = [];
let showHearts = false;
let heartTimer = 0;
let isPlaying = false;
let playBounceY = 0;
let playBounceDir = 1;

let currentFoodIndex = -1;
let showBowl = false;
let bowlTimer = 0;
let showHeartBubble = false;
let heartBubbleTimer = 0;
let heartBubbleY = 0;

function spawnFoodParticles(foodIdx) {
  if (currentCharKey !== 'cat2') return;
  const actualFoodIdx = foodIdx !== undefined ? foodIdx : Math.floor(Math.random() * 12);
  for (let i = 0; i < 4; i++) {
    particles.push({
      x: canvasWidth / 2 + 25 + (Math.random() - 0.5) * 15,
      y: canvasHeight - 15 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 2 - 0.5,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.015,
      foodIndex: actualFoodIdx,
      type: 'food_icon',
      scale: 0.35 + Math.random() * 0.2,
    });
  }
}

function spawnHeartParticles() {
  if (currentCharKey !== 'cat2') return;
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: canvasWidth / 2 + (Math.random() - 0.5) * 20,
      y: canvasHeight / 2 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 1,
      vy: -Math.random() * 1.5 - 0.3,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.01,
      color: '#FF6B9D',
      size: 4 + Math.random() * 3,
      type: 'heart',
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function getDisplayFoodIndex(foodIndex) {
  if (foodIndex === 10) return 12;
  if (foodIndex === 12) return 10;
  return foodIndex;
}

function drawParticles(ctx) {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    if (p.type === 'heart') {
      ctx.fillStyle = p.color;
      ctx.font = `${p.size}px Arial`;
      ctx.fillText('❤', p.x - p.size / 2, p.y);
    } else if (p.type === 'food_icon' && foodIconsLoaded && foodIcons[p.foodIndex]) {
      const s = p.scale;
      const displayIdx = getDisplayFoodIndex(p.foodIndex);
      const iconW = FOOD_CELL_WIDTH * s;
      const iconH = FOOD_CELL_HEIGHT * s;
      ctx.drawImage(foodIcons[displayIdx], p.x - iconW / 2, p.y - iconH / 2, iconW, iconH);
    }
  }
  ctx.globalAlpha = 1.0;
}

// ===== State variables =====
let lastColIndex = -1;
let walkStepCount = 0;
let lastInteractionTime = Date.now();
let isSleeping = false;
let spriteImage = null;
let spriteLoaded = false;

let canvasWidth = 0;
let canvasHeight = 0;

const DIR = { DOWN: 0, RIGHT: 1, UP: 2, LEFT: 3 };
const STATE = { WALK: 'walk', IDLE: 'idle' };

let state = STATE.WALK;
let direction = DIR.LEFT;
let stateTimer = 0;
let stateDuration = randomWalkDuration();
let colIndex = 0;
let colTimer = 0;
let moveX = 0;
let moveY = 0;
let loopRepeats = 0;
let loopCurrentRepeat = 0;
let isLoopAnim = false;
let isStaticAnim = false;
let waiting = false;
let waitTimer = 0;
let waitDuration = 0;

let petX = 0;
let petY = 0;
let screenW = window.innerWidth;
let screenH = window.innerHeight;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastTime = 0;
let initialized = false;

const canvas = document.getElementById('petCanvas');
const ctx = canvas.getContext('2d');
const speechBubble = document.getElementById('speechBubble');

function randomWalkDuration() {
  return charConfig.walkDurationMin + Math.random() * (charConfig.walkDurationMax - charConfig.walkDurationMin);
}

function randomDirection() {
  const dirs = [DIR.DOWN, DIR.RIGHT, DIR.UP, DIR.LEFT];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function applyCanvasSize() {
  canvasWidth = charConfig.frameWidth * charConfig.scale;
  canvasHeight = charConfig.frameHeight * charConfig.scale;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';
}

function loadSprite(src) {
  return new Promise((resolve, reject) => {
    spriteImage = new Image();
    spriteImage.onload = () => { spriteLoaded = true; resolve(); };
    spriteImage.onerror = (err) => { reject(err); };
    spriteImage.src = src;
  });
}

function drawFrame(ctx, row, col) {
  if (!spriteLoaded) return;
  const fw = charConfig.frameWidth;
  const fh = charConfig.frameHeight;
  const sx = col * fw;
  const sy = row * fh;
  const dw = fw * charConfig.scale;
  const dh = fh * charConfig.scale;
  ctx.drawImage(spriteImage, sx, sy, fw, fh, 0, 0, dw, dh);
}

function getWalkRow(dir) {
  const dirRows = charConfig.states.walk.directionRows;
  switch (dir) {
    case DIR.DOWN: return dirRows.down;
    case DIR.RIGHT: return dirRows.right;
    case DIR.UP: return dirRows.up;
    case DIR.LEFT: return dirRows.left;
    default: return dirRows.down;
  }
}

function getCurrentRow() {
  const stateConf = charConfig.states[state];
  if (state === STATE.WALK) return getWalkRow(direction);
  return stateConf.row;
}

function setState(newState, foodIdx) {
  state = newState;
  stateTimer = 0;
  colIndex = 0;
  colTimer = 0;
  moveX = 0;
  moveY = 0;
  waiting = false;
  waitTimer = 0;
  lastColIndex = -1;
  walkStepCount = 0;

  if (newState === 'sleep') {
    isSleeping = true;
  } else {
    isSleeping = false;
  }

  isPlaying = (newState === 'play');
  playBounceY = 0;
  playBounceDir = 1;

  showBowl = false;
  showHeartBubble = false;

  stopLickSound();

  if (newState === 'lick') playLickSound();
  if (newState === 'eat') {
    playEatSound();
    currentFoodIndex = foodIdx !== undefined ? foodIdx : Math.floor(Math.random() * 12);
    showBowl = true;
    bowlTimer = 0;
    showHeartBubble = true;
    heartBubbleTimer = 0;
    heartBubbleY = 0;
    spawnFoodParticles(currentFoodIndex);
    showHearts = true;
    heartTimer = 0;
  }
  if (newState === 'play') {
    playPlaySound();
    showHeartBubble = true;
    heartBubbleTimer = 0;
    heartBubbleY = 0;
    spawnHeartParticles();
    showHearts = true;
    heartTimer = 0;
  }

  const stateConf = charConfig.states[newState];
  isLoopAnim = stateConf.loops === true;
  isStaticAnim = stateConf.static === true;

  if (isStaticAnim && stateConf.col !== undefined) {
    colIndex = stateConf.col;
  }

  if (isLoopAnim && stateConf.loops === true) {
    const trans = charConfig.transitions[newState];
    if (trans && trans.repeatMin !== undefined) {
      loopRepeats = trans.repeatMin + Math.floor(Math.random() * (trans.repeatMax - trans.repeatMin + 1));
      loopCurrentRepeat = 0;
    } else {
      loopRepeats = 1;
      loopCurrentRepeat = 0;
    }
  } else {
    loopRepeats = 0;
    loopCurrentRepeat = 0;
  }

  if (isStaticAnim) {
    const trans = charConfig.transitions[newState];
    if (trans && trans.waitMin !== undefined) {
      startWaiting(trans.waitMin + Math.random() * (trans.waitMax - trans.waitMin));
    }
  }

  if (newState === STATE.WALK) {
    stateDuration = randomWalkDuration();
    direction = randomDirection();
  } else if (newState === STATE.IDLE) {
  } else {
    direction = DIR.DOWN;
  }
}

function startWaiting(duration) {
  waiting = true;
  waitTimer = 0;
  waitDuration = duration;
}

function getStateInterval() {
  const stateConf = charConfig.states[state];
  return stateConf.frameInterval;
}

function updateState(dt) {
  stateTimer += dt;
  colTimer += dt;

  if (showBowl) {
    bowlTimer += dt;
    if (bowlTimer > 400) {
      bowlTimer = 0;
      spawnFoodParticles(currentFoodIndex);
    }
  }

  if (showHeartBubble) {
    heartBubbleTimer += dt;
    heartBubbleY = Math.sin(heartBubbleTimer * 0.008) * 2;
    if (heartBubbleTimer > 2500) showHeartBubble = false;
  }

  if (waiting) {
    waitTimer += dt;
    if (waitTimer >= waitDuration) {
      waiting = false;
      setState(STATE.WALK);
    }
    return;
  }

  if (showHearts) {
    heartTimer += dt;
    if (heartTimer > 300) {
      heartTimer = 0;
      if (state === 'eat') spawnFoodParticles(currentFoodIndex);
      if (state === 'play') spawnHeartParticles();
    }
  }

  const interval = getStateInterval();

  if (state === 'play') {
    playBounceY += playBounceDir * 0.5;
    if (playBounceY > 6) playBounceDir = -1;
    if (playBounceY < -6) playBounceDir = 1;
  }

  if (state === STATE.WALK) {
    if (colTimer >= interval) {
      colTimer -= interval;
      colIndex = (colIndex + 1) % charConfig.cols;
      if (colIndex !== lastColIndex) {
        lastColIndex = colIndex;
        walkStepCount++;
        if (walkStepCount % 3 === 0 && Math.random() < 0.1) playMeow();
      }
    }
    moveX = 0;
    moveY = 0;
    const walkSpeed = charConfig.walkSpeed;
    switch (direction) {
      case DIR.LEFT: moveX = -walkSpeed; break;
      case DIR.RIGHT: moveX = walkSpeed; break;
      case DIR.UP: moveY = -walkSpeed; break;
      case DIR.DOWN: moveY = walkSpeed; break;
    }
    if (stateTimer >= stateDuration) {
      const transitions = charConfig.transitions.walk;
      let r = Math.random();
      let cumulativeWeight = 0;
      const timeSinceInteraction = Date.now() - lastInteractionTime;
      for (const t of transitions) {
        cumulativeWeight += t.weight;
        if (r <= cumulativeWeight) {
          if (t.state === 'sleep' && timeSinceInteraction < 60000) {
            setState(STATE.WALK);
            return;
          }
          if (t.state === STATE.WALK) {
            stateTimer = 0;
            stateDuration = randomWalkDuration();
            direction = randomDirection();
          } else {
            setState(t.state);
          }
          return;
        }
      }
    }
    return;
  }

  const stateConf = charConfig.states[state];

  if (isStaticAnim) {
  } else if (colTimer >= interval) {
    colTimer -= interval;
    if (isLoopAnim) {
      colIndex = (colIndex + 1) % charConfig.cols;
      if (colIndex === 0) {
        loopCurrentRepeat++;
        if (state === 'lick') {
          sounds.lick.currentTime = 0;
          sounds.lick.play().catch(() => {});
        }
        if (loopCurrentRepeat >= loopRepeats) {
          const trans = charConfig.transitions[state];
          if (trans && trans.next) setState(trans.next);
          else setState(STATE.WALK);
          return;
        }
      }
    } else {
      if (colIndex < charConfig.cols - 1) colIndex++;
    }
  }

  if (!isLoopAnim && !isStaticAnim && colIndex >= charConfig.cols - 1 && !waiting) {
    const trans = charConfig.transitions[state];
    if (trans) {
      if (trans.waitMin !== undefined) {
        startWaiting(trans.waitMin + Math.random() * (trans.waitMax - trans.waitMin));
      } else if (trans.next) {
        setState(trans.next);
      }
    } else {
      setState(STATE.WALK);
    }
  }
}

// ===== Browser adaptation: move canvas instead of Electron window =====
function updateCanvasPosition() {
  canvas.style.left = Math.round(petX) + 'px';
  canvas.style.top = Math.round(petY) + 'px';
}

function setupInteraction() {
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      e.preventDefault();
      lastInteractionTime = Date.now();
      if (isSleeping) {
        isSleeping = false;
        setState(STATE.WALK);
        return;
      }
      isDragging = true;
      dragOffsetX = e.clientX - petX;
      dragOffsetY = e.clientY - petY;
      waiting = false;
      setState(STATE.IDLE);
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      petX = e.clientX - dragOffsetX;
      petY = e.clientY - dragOffsetY;
      petX = Math.max(0, Math.min(screenW - canvasWidth, petX));
      petY = Math.max(0, Math.min(screenH - canvasHeight, petY));
      updateCanvasPosition();
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0 && isDragging) {
      isDragging = false;
      setState(STATE.WALK);
    }
  });

  canvas.addEventListener('dblclick', () => {
    lastInteractionTime = Date.now();
    const actions = charConfig.doubleClickActions;
    let r = Math.random();
    let cumulative = 0;
    for (const a of actions) {
      cumulative += a.weight;
      if (r <= cumulative) {
        setState(a.state);
        return;
      }
    }
    setState(STATE.IDLE);
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}

function update(dt) {
  if (isDragging || isSleeping) return;

  updateState(dt);

  if (moveX !== 0 || moveY !== 0) {
    petX += moveX * dt;
    petY += moveY * dt;

    if (petX < 0) {
      petX = 0;
      direction = DIR.RIGHT;
    } else if (petX > screenW - canvasWidth) {
      petX = screenW - canvasWidth;
      direction = DIR.LEFT;
    }

    if (petY < 0) {
      petY = 0;
      direction = DIR.DOWN;
    } else if (petY > screenH - canvasHeight) {
      petY = screenH - canvasHeight;
      direction = DIR.UP;
    }

    updateCanvasPosition();
  }
}

function render() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = false;

  ctx.save();
  if (isPlaying) ctx.translate(0, playBounceY);

  const row = getCurrentRow();
  const col = colIndex % charConfig.cols;

  if (showBowl && bowlImage && bowlLoaded) {
    const bowlX = canvasWidth - BOWL_DISPLAY_SIZE - 2;
    const bowlY = canvasHeight - BOWL_DISPLAY_SIZE - 2;
    ctx.drawImage(bowlImage, bowlX, bowlY, BOWL_DISPLAY_SIZE, BOWL_DISPLAY_SIZE);
  }

  drawFrame(ctx, row, col);
  ctx.restore();

  if (showHeartBubble && heartBubbleImage && heartBubbleLoaded) {
    const hbX = canvasWidth / 2 - HEART_BUBBLE_SIZE / 2;
    const hbY = 2 + heartBubbleY;
    ctx.drawImage(heartBubbleImage, hbX, hbY, HEART_BUBBLE_SIZE, HEART_BUBBLE_SIZE);
  }

  updateParticles(16);
  drawParticles(ctx);
}

function gameLoop(timestamp) {
  if (!initialized || !spriteLoaded) {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (lastTime === 0) lastTime = timestamp;

  const dt = Math.min(timestamp - lastTime, 100);
  lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

function showSpeechBubble(text, duration) {
  if (!speechBubble) return;
  speechBubble.textContent = text;
  speechBubble.style.opacity = '1';

  const bubbleX = petX + canvasWidth / 2 - 80;
  const bubbleY = petY - 40;
  speechBubble.style.left = Math.max(10, bubbleX) + 'px';
  speechBubble.style.top = Math.max(10, bubbleY) + 'px';

  setTimeout(() => {
    speechBubble.style.opacity = '0';
  }, duration || 3000);
}

async function init() {
  applyCanvasSize();
  loadSounds();

  await Promise.all([
    loadFoodIcons(),
    loadBowl(),
    loadHeartBubble(),
  ]);

  await loadSprite('cat2.png');

  // Browser: use window dimensions
  screenW = window.innerWidth;
  screenH = window.innerHeight;

  // Start at center of screen
  petX = (screenW - canvasWidth) / 2;
  petY = (screenH - canvasHeight) / 2;
  updateCanvasPosition();

  // Show welcome speech bubble
  setTimeout(() => {
    showSpeechBubble('你是来看我主人的吗？欢迎你！', 5000);
  }, 800);

  // Handle window resize
  window.addEventListener('resize', () => {
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    petX = Math.max(0, Math.min(screenW - canvasWidth, petX));
    petY = Math.max(0, Math.min(screenH - canvasHeight, petY));
    updateCanvasPosition();
  });

  setupInteraction();

  initialized = true;
  requestAnimationFrame(gameLoop);
}

init().catch(console.error);
