const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const presetSelect = document.getElementById(
  'presetSelect',
) as HTMLSelectElement;
const applyPresetButton = document.getElementById(
  'applyPreset',
) as HTMLButtonElement;
const particleCountInput = document.getElementById(
  'particleCount',
) as HTMLInputElement;
const frictionInput = document.getElementById('friction') as HTMLInputElement;
const forceFactorInput = document.getElementById(
  'forceFactor',
) as HTMLInputElement;
const interactionRangeInput = document.getElementById(
  'interactionRange',
) as HTMLInputElement;
const trailEffectInput = document.getElementById(
  'trailEffect',
) as HTMLInputElement;
const trailIntensityInput = document.getElementById(
  'trailIntensity',
) as HTMLInputElement;
const particleSizeInput = document.getElementById(
  'particleSize',
) as HTMLInputElement;
const resetSimulationButton = document.getElementById(
  'resetSimulation',
) as HTMLButtonElement;
const resetViewButton = document.getElementById(
  'resetView',
) as HTMLButtonElement;

let particleCount: number = 2000;
const particleTypes: number = 5;
let particles: Particle[] = [];
let interactionMatrix: number[][] = [];
let friction: number = 0.9;
let forceFactor: number = 1;
let interactionRange: number = 200;
let trailEffect: boolean = true;
let trailIntensity: number = 0.05;
let particleSize: number = 1.5;

// Apply default values to controls
particleCountInput.value = particleCount.toString();
frictionInput.value = friction.toString();
forceFactorInput.value = forceFactor.toString();
interactionRangeInput.value = interactionRange.toString();
trailEffectInput.checked = trailEffect;
trailIntensityInput.value = trailIntensity.toString();
particleSizeInput.value = particleSize.toString();

const colors: string[] = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#FF33F5',
  '#33FFF5',
];

// Update pan and zoom variables
let scale: number = 1;
let translateX: number = 0;
let translateY: number = 0;
let isDragging: boolean = false;
let lastMouseX: number = 0;
let lastMouseY: number = 0;
let mapWidth: number = 2000;
let mapHeight: number = 2000;

function resizeCanvas(): void {
  canvas.width = mapWidth;
  canvas.height = mapHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: number;

  constructor(x: number, y: number, type: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.type = type;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x += mapWidth;
    if (this.x > mapWidth) this.x -= mapWidth;
    if (this.y < 0) this.y += mapHeight;
    if (this.y > mapHeight) this.y -= mapHeight;

    this.vx *= friction;
    this.vy *= friction;
  }

  draw(): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, particleSize, 0, Math.PI * 2);
    ctx.fillStyle = colors[this.type];
    ctx.fill();
  }
}

function initializeParticles(): void {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * mapWidth;
    const y = Math.random() * mapHeight;
    const type = Math.floor(Math.random() * particleTypes);
    particles.push(new Particle(x, y, type));
  }
}

function generateRandomMatrix(): void {
  interactionMatrix = [];
  for (let i = 0; i < particleTypes; i++) {
    interactionMatrix[i] = [];
    for (let j = 0; j < particleTypes; j++) {
      interactionMatrix[i][j] = Math.random() * 2 - 1;
    }
  }
}

function interact(p1: Particle, p2: Particle): void {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0 && distance < interactionRange) {
    const force =
      forceFactor *
      interactionMatrix[p1.type][p2.type] *
      (1 - distance / interactionRange);
    p1.vx += (force * dx) / distance;
    p1.vy += (force * dy) / distance;
  }
}

function update(): void {
  if (trailEffect) {
    ctx.fillStyle = `rgba(0, 0, 0, ${trailIntensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      interact(particles[i], particles[j]);
      interact(particles[j], particles[i]);
    }
  }

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  ctx.restore();

  requestAnimationFrame(update);
}

function applyTransform(): void {
  canvas.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
}

function applyPreset(preset: string): void {
  switch (preset) {
    case 'random':
      generateRandomMatrix();
      break;
    case 'galaxies':
      interactionMatrix = [
        [1.0, -0.2, -0.1, 0.0, 0.1],
        [-0.2, 1.0, -0.2, -0.1, 0.0],
        [-0.1, -0.2, 1.0, -0.2, -0.1],
        [0.0, -0.1, -0.2, 1.0, -0.2],
        [0.1, 0.0, -0.1, -0.2, 1.0],
      ];
      break;
    case 'bubbles':
      interactionMatrix = [
        [-0.5, 1.0, 0.0, -1.0, 0.0],
        [1.0, -0.5, 1.0, 0.0, -1.0],
        [0.0, 1.0, -0.5, 1.0, 0.0],
        [-1.0, 0.0, 1.0, -0.5, 1.0],
        [0.0, -1.0, 0.0, 1.0, -0.5],
      ];
      break;
    case 'snakes':
      interactionMatrix = [
        [0.0, 1.0, -0.8, -0.8, 0.8],
        [-0.8, 0.0, 1.0, -0.8, -0.8],
        [-0.8, -0.8, 0.0, 1.0, -0.8],
        [0.8, -0.8, -0.8, 0.0, 1.0],
        [1.0, 0.8, -0.8, -0.8, 0.0],
      ];
      forceFactor = 2;
      friction = 0.95;
      interactionRange = 100;
      break;
    case 'flocking':
      interactionMatrix = [
        [1.0, 0.5, 0.5, 0.5, 0.5],
        [0.5, 1.0, 0.5, 0.5, 0.5],
        [0.5, 0.5, 1.0, 0.5, 0.5],
        [0.5, 0.5, 0.5, 1.0, 0.5],
        [0.5, 0.5, 0.5, 0.5, 1.0],
      ];
      break;
  }
  initializeParticles();
  updateControlsFromPreset();
}

function updateControlsFromPreset(): void {
  frictionInput.value = friction.toString();
  forceFactorInput.value = forceFactor.toString();
  interactionRangeInput.value = interactionRange.toString();
}

applyPresetButton.addEventListener('click', () => {
  applyPreset(presetSelect.value);
});

particleCountInput.addEventListener('change', () => {
  particleCount = parseInt(particleCountInput.value);
  initializeParticles();
});

frictionInput.addEventListener('input', () => {
  friction = parseFloat(frictionInput.value);
});

forceFactorInput.addEventListener('input', () => {
  forceFactor = parseFloat(forceFactorInput.value);
});

interactionRangeInput.addEventListener('input', () => {
  interactionRange = parseInt(interactionRangeInput.value);
});

trailEffectInput.addEventListener('change', () => {
  trailEffect = trailEffectInput.checked;
});

trailIntensityInput.addEventListener('input', () => {
  trailIntensity = parseFloat(trailIntensityInput.value);
});

particleSizeInput.addEventListener('input', () => {
  particleSize = parseFloat(particleSizeInput.value);
});

resetSimulationButton.addEventListener('click', () => {
  generateRandomMatrix();
  initializeParticles();
});

resetViewButton.addEventListener('click', () => {
  scale = 1;
  translateX = 0;
  translateY = 0;
  applyTransform();
});

// Updated pan functionality
canvas.addEventListener('mousedown', (e: MouseEvent) => {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e: MouseEvent) => {
  if (isDragging) {
    const deltaX = (e.clientX - lastMouseX) / scale;
    const deltaY = (e.clientY - lastMouseY) / scale;
    translateX += deltaX;
    translateY += deltaY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    applyTransform();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
});

// Updated zoom functionality
canvas.addEventListener('wheel', (e: WheelEvent) => {
  e.preventDefault();
  const zoomIntensity = 0.1;
  const mouseX = e.clientX - canvas.offsetLeft;
  const mouseY = e.clientY - canvas.offsetTop;
  const wheel = e.deltaY < 0 ? 1 : -1;
  const zoom = Math.exp(wheel * zoomIntensity);

  const newScale = scale * zoom;
  if (newScale > 0.1 && newScale < 10) {
    const mouseXBeforeZoom = mouseX / scale - translateX;
    const mouseYBeforeZoom = mouseY / scale - translateY;
    scale = newScale;
    const mouseXAfterZoom = mouseX / scale - translateX;
    const mouseYAfterZoom = mouseY / scale - translateY;

    translateX += mouseXAfterZoom - mouseXBeforeZoom;
    translateY += mouseYAfterZoom - mouseYBeforeZoom;

    applyTransform();
  }
});

generateRandomMatrix();
initializeParticles();
resetViewButton.click(); // Center the view initially
update();
