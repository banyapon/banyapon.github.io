let img; // ตัวแปรสำหรับเก็บ density map
let pos = []; // ตำแหน่งของจุดทั้งหมด
const cols = 2; // จำนวนคอลัมน์
const rows = 1; // จำนวนแถว
let zoneWidth, zoneHeight; // ขนาดของแต่ละโซน
const exportWidth = 1920; // ขนาดความกว้างของภาพ Export
const exportHeight = 1080; // ขนาดความสูงของภาพ Export

function preload() {
  // โหลด density map
  img = loadImage('images/density_khon.png'); // ใช้ภาพ density_map.png
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // คำนวณขนาดของแต่ละโซน
  zoneWidth = width / cols;
  zoneHeight = height / rows;

  // ปรับขนาดของภาพ density map ให้พอดีกับจอ (stretch)
  img.resize(width, height);

  // วาดพื้นหลังด้วยโซน
  drawZones();

  strokeWeight(1);

  // สร้างจุดแบบสุ่ม
  for (let i = 0; i < 10000; i++) {
    pos[i] = {
      x: random(width),
      y: random(height),
    };
  }
}

function draw() {
  // โหลดพิกเซลของภาพ density map ที่ปรับขนาด
  img.loadPixels();

  for (let i = 0; i < pos.length; i++) {
    let px = floor(pos[i].x);
    let py = floor(pos[i].y);

    // ตรวจสอบว่า px และ py อยู่ในขอบเขตของภาพ
    if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
      // คำนวณตำแหน่งพิกเซลในภาพ
      let index = (px + py * img.width) * 4;
      let brightness = img.pixels[index]; // ความสว่าง (ใช้สีแดงจาก grayscale image)

      // คำนวณโซนที่จุดอยู่
      let zoneX = floor(pos[i].x / zoneWidth);
      let zoneY = floor(pos[i].y / zoneHeight);

      if (brightness > 200) {
        // โซนสีขาว: เส้นสีเทา 50%
        stroke(217, 32, 10);
        let w = 10000;
        let dx = 3 * sin(TWO_PI * noise(pos[i].x / w, pos[i].y / w, frameCount * 0.02));
        let dy = 3 * cos(TWO_PI * noise(pos[i].x / w, pos[i].y / w, frameCount * 0.02));
        pos[i].x = constrain(pos[i].x + dx, zoneX * zoneWidth, (zoneX + 1) * zoneWidth);
        pos[i].y = constrain(pos[i].y + dy, zoneY * zoneHeight, (zoneY + 1) * zoneHeight);
      } else if (brightness > 190) {
        // โซนเทา: เส้นสีขาว
        stroke(0);
        let w = 500;
        let dx = 2 * sin(TWO_PI * noise(pos[i].x / w, pos[i].y / w, frameCount * 0.01));
        let dy = 2 * cos(TWO_PI * noise(pos[i].x / w, pos[i].y / w, frameCount * 0.01));
        pos[i].x = constrain(pos[i].x + dx, zoneX * zoneWidth, (zoneX + 1) * zoneWidth);
        pos[i].y = constrain(pos[i].y + dy, zoneY * zoneHeight, (zoneY + 1) * zoneHeight);
      } else {
        // โซนสีดำ: เส้นดำ
        stroke(0); // สีดำ

        // การเคลื่อนที่อิสระ
        let w = 500;
        let dx = 5 * sin(0.5 - noise(pos[i].x / w * 5, pos[i].y / w * 5, 0.1));
        let dy = 0.5 - noise(pos[i].x / w * 25, pos[i].y / w * 15, 7.2);
        pos[i].x = constrain(pos[i].x + dx, zoneX * zoneWidth, (zoneX + 1) * zoneWidth);
        pos[i].y = constrain(pos[i].y + dy + dx / 5, zoneY * zoneHeight, (zoneY + 1) * zoneHeight);
      }

      // วาดจุด
      point(pos[i].x, pos[i].y);
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    // สร้างกราฟิกใหม่สำหรับ Export
    let exportGraphics = createGraphics(exportWidth, exportHeight);

    // วาดภาพลงบนกราฟิกใหม่
    exportGraphics.image(img, 0, 0, exportWidth, exportHeight);

    // วาดพื้นหลังและจุดแบบเดียวกับ Canvas หลัก
    exportGraphics.strokeWeight(1);
    exportGraphics.noStroke();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if ((row + col) % 2 === 0) {
          exportGraphics.fill(255);
        } else {
          exportGraphics.fill(217, 32, 10);
        }
        exportGraphics.rect(col * (exportWidth / cols), row * (exportHeight / rows), exportWidth / cols, exportHeight / rows);
      }
    }

    // วาดจุด
    exportGraphics.stroke(0);
    for (let i = 0; i < pos.length; i++) {
      exportGraphics.point(pos[i].x * (exportWidth / width), pos[i].y * (exportHeight / height));
    }

    // บันทึกภาพเป็นไฟล์ PNG
    exportGraphics.save('export_image.png');
  }
}

// ฟังก์ชันสำหรับวาดโซนบนพื้นหลัง
function drawZones() {
  noStroke();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((row + col) % 2 === 0) {
        fill(255); // สีขาว
      } else {
        fill(217, 32, 10); // สี #FFBB00
      }
      rect(col * zoneWidth, row * zoneHeight, zoneWidth, zoneHeight);
    }
  }
}
