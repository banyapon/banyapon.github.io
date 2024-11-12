window.onload = function() {
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const imagePath = 'bg.jpg';
    const dotSize = 5;
    const spacing = 10;
    const expandRadius = 50; // ระยะที่เมาส์จะขยายจุด
    const maxDotSize = 20; // ขนาดสูงสุดของจุดเมื่อเมาส์อยู่ใกล้

    let mouseX = -1000;
    let mouseY = -1000;

    function loadImageAndDrawDots() {
        const img = new Image();
        img.src = imagePath;

        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            function drawDots() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (let y = 0; y < canvas.height; y += spacing) {
                    for (let x = 0; x < canvas.width; x += spacing) {
                        const index = (y * canvas.width + x) * 4;
                        const red = data[index];
                        const green = data[index + 1];
                        const blue = data[index + 2];
                        const alpha = data[index + 3];

                        if (alpha > 128) {
                            const color = `rgb(${red}, ${green}, ${blue})`;
                            ctx.fillStyle = color;

                            const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);
                            let currentDotSize = dotSize;

                            if (distance < expandRadius) {
                                currentDotSize = dotSize + (maxDotSize - dotSize) * (1 - distance / expandRadius);
                            }

                            ctx.beginPath();
                            ctx.arc(x, y, currentDotSize / 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }

                requestAnimationFrame(drawDots);
            }

            drawDots();
        };
    }

    loadImageAndDrawDots();

    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });
};
