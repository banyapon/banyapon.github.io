const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const radius = 24;
const xSpan = radius * Math.sqrt(3);
let noiseSeed = Math.random() * 1000;

// ฟังก์ชันสร้าง Noise
function noise(x, y, t) {
    return Math.abs(Math.sin(x * 0.01 + y * 0.01 + t));
}

// ฟังก์ชันวาดเส้นระหว่างจุด
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// ฟังก์ชันวาดหกเหลี่ยม
function drawHexagon(x, y, radius, t) {
    const vertices = [];
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const vx = x + radius * Math.cos(angle);
        const vy = y + radius * Math.sin(angle);
        vertices.push({ x: vx, y: vy });
    }

    // วาดเส้นตาม noise
    for (let i = 0; i < vertices.length; i++) {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % vertices.length];
        const noiseValue = noise((v1.x + v2.x) * 0.05, (v1.y + v2.y) * 0.05, t);
        if (noiseValue > 0.25 && noiseValue < 0.75) {
            drawLine(v1.x, v1.y, v2.x, v2.y);
        }
    }
}

// ฟังก์ชันวาดทั้งหมด
function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    let flg = true;
    for (let y = 0; y < canvas.height + radius; y += radius * 1.5) {
        for (let x = 0; x < canvas.width + radius; x += xSpan) {
            const offsetX = flg ? 0 : xSpan / 2;
            drawHexagon(x + offsetX, y, radius * 0.9, t);
        }
        flg = !flg;
    }
}

// ฟังก์ชัน Animation Loop
function animate(t) {
    draw(t * 0.0005);
    requestAnimationFrame(animate);
}

animate(0);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
