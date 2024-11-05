window.onload = function() {
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const imagePaths = ['pano1.png', 'pano2.png', 'pano3.png', 'pano4.png','pano6.png','pano5.png']; // Array ของภาพที่ใช้
    let currentImageIndex = 0;

    function loadImageAndDrawDots() {
        const img = new Image();
        img.src = imagePaths[currentImageIndex];

        img.onload = function() {
            // วาดภาพลงบนแคนวาสเพื่อดึงสีพิกเซล
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // ลบภาพเพื่อเตรียมวาดข้อความ
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            function drawTextFrame() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const fontSize = 10; // ขนาดฟอนต์ เพิ่มความหนาแน่นโดยลดขนาดตัวอักษร
                ctx.font = `${fontSize}px Arial`;

                for (let y = 0; y < canvas.height; y += fontSize) {
                    for (let x = 0; x < canvas.width; x += fontSize) {
                        const index = (y * canvas.width + x) * 4;

                        const red = data[index];
                        const green = data[index + 1];
                        const blue = data[index + 2];

                        // ใช้สีจากภาพโดยตรง
                        const color = `rgb(${red}, ${green}, ${blue})`;
                        ctx.fillStyle = color;

                        ctx.fillText(getRandomCharacter(), x, y);
                    }
                }

                // เรียกตัวเองใหม่ในเฟรมถัดไป
                requestAnimationFrame(drawTextFrame);
            }

            drawTextFrame();
        };
    }

    function changeImagePeriodically() {
        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % imagePaths.length;
            loadImageAndDrawDots();
        }, 2000); // เปลี่ยนภาพทุกๆ 4 วินาที
    }

    changeImagePeriodically();
    loadImageAndDrawDots();

    function getRandomCharacter() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮ';
        return characters.charAt(Math.floor(Math.random() * characters.length));
    }
};
