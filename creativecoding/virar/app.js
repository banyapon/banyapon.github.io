// app.js

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randomColor() {
    const colors = ['#3333ff', '#ff6600', '#9966cc', '#cc3300'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawSquare(x, y, size, color, opacity) {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.stroke();
    ctx.globalAlpha = 1; // Reset alpha for the next drawing
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseSize = 60; // Base size of the squares
    const offset = 5;    // Offset for random variation in positions
    const squareCount = 300; // Number of squares to draw

    for (let i = 0; i < squareCount; i++) {
        let x = (i % 10) * baseSize + Math.random() * offset - offset / 2 + canvas.width / 3;
        let y = Math.floor(i / 10) * baseSize + Math.random() * offset - offset / 2 + canvas.height / 3;
        let size = baseSize + Math.random() * 10 - 5; // Randomize size slightly
        let color = randomColor();
        let opacity = Math.random() * 0.5 + 0.2; // Random opacity for layering effect

        drawSquare(x, y, size, color, opacity);
    }

    requestAnimationFrame(animate);
}

animate();
