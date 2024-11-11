const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fit the screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let rows = 20, cols = 50;
let size = 60;
let grid = [];
let rotation = 0;
let divisions = 10;
let rotationDirection = 1; // Used to alternate rotation between 0 and 90
let color = getRandomColor();
let invertColors = false; // Track color inversion state

const rotationSlider = document.getElementById('rotation');
const divisionsSlider = document.getElementById('divisions');
const controls = document.getElementById('controls');

// Mouse position tracking
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

// Toggle visibility of controls when ESC key is pressed
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
  }
});

// Track mouse position and update variables
canvas.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Toggle color inversion on mouse down
canvas.addEventListener('mousedown', () => {
  invertColors = !invertColors;
});

// Generate a random color
function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

// Initialize grid
function makeGrid() {
  rows = divisionsSlider.value;
  cols = divisionsSlider.value;
  grid = [];
  for (let c = 0; c < cols; c++) {
    grid.push([]);
    for (let r = 0; r < rows; r++) {
      const w = canvas.width / cols;
      const h = canvas.height / rows;
      const xOff = w / 2;
      const yOff = h / 2;
      const pos = { x: c * w + xOff, y: r * h + yOff };
      grid[c].push(new Cell(pos));
    }
  }
}

// Cell class to represent each cell in the grid
class Cell {
  constructor(pos) {
    this.x = pos.x;
    this.y = pos.y;
  }

  display() {
    ctx.save();

    // Calculate distance from mouse and scale based on proximity
    const dist = Math.hypot(this.x - mouseX, this.y - mouseY);
    const maxDist = Math.hypot(canvas.width, canvas.height) / 2;
    const scaleFactor = 1 + (1 - dist / maxDist) * 1.5; // Adjust scale based on distance

    // Set color based on inversion state
    ctx.strokeStyle = invertColors ? `rgb(0, 0, 0)` : color;
    ctx.fillStyle = invertColors ? color : `rgb(0, 0, 0)`;

    // Apply transformations
    ctx.translate(this.x, this.y);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.rotate(rotation * Math.PI / 180);

    // Draw the rectangle
    ctx.beginPath();
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// Animation loop
function animate() {
  // Clear the canvas with inverted background color based on invertColors
  ctx.fillStyle = invertColors ? `#ffffff` : `#000000`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Toggle rotation between 0 and 90
  rotation += rotationDirection;
  if (rotation >= 90 || rotation <= 0) {
    rotationDirection *= -1; // Reverse direction
  }

  if (rows !== parseInt(divisionsSlider.value)) {
    makeGrid();
  }

  // Draw the grid
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      grid[c][r].display();
    }
  }

  requestAnimationFrame(animate);
}

// Change color every 2 seconds
setInterval(() => {
  color = getRandomColor();
}, 2000);

// Initial setup and start the animation
makeGrid();
animate();
