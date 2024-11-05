window.onload = function() {
    const canvas = document.getElementById('patternCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const imagePaths = ['pattern1.jpg', 'pattern2.jpg', 'pattern3.jpg','pattern4.jpg']; // Array ของภาพที่ใช้
    let currentImageIndex = 0;
    let dots = [];
    let highlightY = -1; // เก็บตำแหน่ง Y ที่จะระบายสีแดง

    function loadImageAndDrawDots() {
        const img = new Image();
        img.src = imagePaths[currentImageIndex];

        img.onload = function() {
            // ปรับขนาดแคนวาสให้เท่ากับขนาดของภาพ
            canvas.width = img.width;
            canvas.height = img.height;

            // วาดภาพลงบนแคนวาส
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // รับค่าพิกเซลของภาพ
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // ลบภาพที่วาดออกเพื่อวาดเป็นจุด
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // สร้าง array ของจุด
            dots = [];
            const space = 8; // เพิ่มระยะห่างระหว่างจุดให้มากขึ้น
            for (let y = 0; y < canvas.height; y += space) {
                for (let x = 0; x < canvas.width; x += space) {
                    const index = (y * canvas.width + x) * 4;
                    const red = data[index];
                    const green = data[index + 1];
                    const blue = data[index + 2];
                    const brightness = (red + green + blue) / 3;

                    // ละเลยพิกเซลที่ใกล้สีขาว (brightness เกิน 70%)
                    if (brightness > 0.7 * 255) continue;

                    // ขนาดของจุดจะเล็กลงเมื่อสีสว่าง และใหญ่ขึ้นเมื่อสีเข้ม
                    const dotSize = Math.max(2, 6 - (brightness / 255) * 6); // เพิ่มขนาดจุด

                    dots.push({ x, y, size: dotSize });
                }
            }

            // วาดจุดสมบูรณ์
            drawDots();

            // รอแสดงผล 3 วินาทีก่อนเริ่มแอนิเมชันแตกตัว
            setTimeout(() => {
                animateDotsOut();
            }, 3000);
        };
    }

    function drawDots() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(dot => {
            // ถ้าตำแหน่ง Y ของจุดตรงกับตำแหน่งเมาส์ที่ต้องการระบายสี ให้ใช้สีแดง
            if (highlightY !== -1 && dot.y >= highlightY - 2 * 8 && dot.y <= highlightY + 4 * 8) {
                ctx.fillStyle = '#f00'; // สีแดง
            } else {
                ctx.fillStyle = '#858585'; // สีดำ
            }

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function animateDotsOut() {
        const duration = 30; // ระยะเวลาแอนิเมชัน
        let frame = 0;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            dots.forEach(dot => {
                const offsetX = (Math.random() - 0.5) * 20; // ความแตกตัวในแกน X
                const offsetY = (Math.random() - 0.5) * 20; // ความแตกตัวในแกน Y
                const newX = dot.x + (offsetX * frame) / duration;
                const newY = dot.y + (offsetY * frame) / duration;

                ctx.beginPath();
                ctx.arc(newX, newY, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = '#858585'; // เปลี่ยนจุดเป็นสีขาวเมื่อแตกตัวออก
                ctx.fill();
            });

            if (frame < duration) {
                requestAnimationFrame(animate);
            } else {
                // เริ่มการโหลดภาพใหม่และวาดจุดหลังจากแอนิเมชันแตกตัวเสร็จ
                currentImageIndex = (currentImageIndex + 1) % imagePaths.length;
                animateDotsIn();
            }
        }

        animate();
    }

    function animateDotsIn() {
        const duration = 30; // ระยะเวลาแอนิเมชัน
        let frame = 0;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            dots.forEach(dot => {
                const offsetX = (Math.random() - 0.5) * 20; // ความแตกตัวในแกน X
                const offsetY = (Math.random() - 0.5) * 20; // ความแตกตัวในแกน Y
                const startX = dot.x + offsetX;
                const startY = dot.y + offsetY;
                const newX = startX + ((dot.x - startX) * frame) / duration;
                const newY = startY + ((dot.y - startY) * frame) / duration;

                ctx.beginPath();
                ctx.arc(newX, newY, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = '#858585'; // เปลี่ยนจุดเป็นสีดำเมื่อรวมตัว
                ctx.fill();
            });

            if (frame < duration) {
                requestAnimationFrame(animate);
            } else {
                // โหลดภาพใหม่เมื่อแอนิเมชันจบ
                loadImageAndDrawDots();
            }
        }

        animate();
    }

    // ฟังก์ชันสำหรับจับการเคลื่อนไหวของเมาส์
    canvas.addEventListener('mousemove', (event) => {
        highlightY = event.clientY; // จับตำแหน่ง Y ของเมาส์
        drawDots(); // วาดใหม่เมื่อเมาส์เคลื่อนที่
    });

    loadImageAndDrawDots();
};
