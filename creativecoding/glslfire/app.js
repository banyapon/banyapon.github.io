let yOffset = 0; // Offset สำหรับแกน y ของ noise
let waveHeight = 100; // ความสูงของคลื่น
let waveSpeed = 0.02; // ความเร็วของการเคลื่อนที่ของคลื่น
let numWaves = 10; // จำนวนเลเยอร์ของคลื่น

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}

function draw() {
    background(200, 23, 23); // พื้นหลังสีแดงเข้ม
    drawWaves();
}

// ฟังก์ชันสำหรับวาดเลเยอร์ของไฟ
function drawWaves() {
    for (let i = 0; i < numWaves; i++) {
        let yPos = map(i, 0, numWaves, height / 5, height);
        let color1 = color(255, 67, 55, 120 - i * 10);
        let color2 = color(255, 240, 0, 80 - i * 10);

        drawWave(yPos, color1, color2, i);
    }
}

// ฟังก์ชันสำหรับวาดคลื่นเดียว
function drawWave(yPos, color1, color2, layer) {
    let xOffset = layer * 0.07; // Offset สำหรับเลเยอร์แต่ละชั้นเพื่อสร้างเอฟเฟกต์ parallax
    let waveWidth = 800;
    let yOff = yOffset + layer * 0.2;

    fill(lerpColor(color1, color2, 0.5));

    beginShape();
    for (let x = 0; x <= width; x += 8) {
        let y = yPos + sin(x * 0.03 + yOff) * waveHeight * noise(x * 0.01 + xOffset, yOff);
        vertex(x, y);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);

    yOffset += waveSpeed * 0.15;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
