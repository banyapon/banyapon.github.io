// app.js

const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
let mouseXPos = 0;

// Resize the canvas to fill the viewport
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Listen for mouse movement to update the x-position of the mouse
window.addEventListener('mousemove', (event) => {
    mouseXPos = event.clientX;
});

function drawPattern() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dotSpacing = 30;                      // Space between dots
    const rows = Math.ceil(canvas.height / dotSpacing); // Number of rows
    const cols = Math.ceil(canvas.width / dotSpacing);  // Number of columns
    const waveIntensity = (mouseXPos / canvas.width) * 15; // Wave effect based on mouse position

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Calculate size with sine wave effect
            const size = 8 + Math.sin((x + y) * 0.5 + waveIntensity) * 6;
            ctx.beginPath();
            ctx.arc(x * dotSpacing, y * dotSpacing, size, 0, Math.PI * 2);
            
            // Set color with slight variation
            ctx.fillStyle = `rgb(${200 - y * 5}, ${200 - x * 5}, 200)`;
            ctx.fill();
        }
    }
}

function animate() {
    drawPattern();
    requestAnimationFrame(animate);
}

animate();
