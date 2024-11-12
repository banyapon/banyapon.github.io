const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Array to store points and lines
let points = [];
const numPoints = 150;  // Number of points
const lineColor = 'rgba(255, 255, 255, 0.5)';  // Line color with opacity

// Mouse object to store the current mouse position
const mouse = {
  x: null,
  y: null,
  radius: 100 // Radius of influence for mouse interaction
};

// Helper function to generate a random position within canvas bounds
function randomPosition() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
    size: 3 + Math.random() * 3,
  };
}

// Initialize points
for (let i = 0; i < numPoints; i++) {
  points.push(randomPosition());
}

// Track the mouse movement
canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// Draw each frame
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

  // Draw lines between points
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      if (dist < 150) {  // Only draw lines if points are close enough
        ctx.strokeStyle = lineColor;
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
      }
    }
  }
  ctx.stroke();

  // Draw points and animate them
  points.forEach((point) => {
    // Mouse interaction - push points away if close to the mouse
    const dx = point.x - mouse.x;
    const dy = point.y - mouse.y;
    const distance = Math.hypot(dx, dy);

    if (distance < mouse.radius) {
      // Move point away from the mouse position
      const angle = Math.atan2(dy, dx);
      const force = (mouse.radius - distance) / mouse.radius;
      point.dx += Math.cos(angle) * force * 0.5;
      point.dy += Math.sin(angle) * force * 0.5;
    }

    // Draw point
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;  // Colorful points
    ctx.fill();

    // Update point position with some noise/randomness
    point.x += point.dx;
    point.y += point.dy;

    // Slow down point movement for smoother animation
    point.dx *= 0.98;
    point.dy *= 0.98;

    // Bounce points off the canvas edges
    if (point.x < 0 || point.x > canvas.width) point.dx *= -1;
    if (point.y < 0 || point.y > canvas.height) point.dy *= -1;
  });

  requestAnimationFrame(animate);  // Continue the animation loop
}

// Handle canvas resizing
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push(randomPosition());
  }
});

// Start the animation
animate();
