window.onload = function() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = 'pattern.jpg';

    const fontSizeBase = 10;
    const maxFontSize = 30;
    const effectRadius = 100;

    let mouseX = 0;
    let mouseY = 0;

    function getRandomCharacter() {
        const characters = 'BCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        return characters.charAt(Math.floor(Math.random() * characters.length));
    }

    function getRandomColor() {
        let color;
        do {
            color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
        } while (color === 'rgb(0, 0, 0)');
        return color;
    }

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        function drawText() {
            context.clearRect(0, 0, canvas.width, canvas.height);

            for (let y = 0; y < img.height; y += 10) {
                for (let x = 0; x < img.width; x += 10) {
                    const index = (y * img.width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

                    if (brightness > 200) {
                        const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));

                        let fontSize = fontSizeBase;
                        if (distance < effectRadius) {
                            fontSize = maxFontSize - (distance / effectRadius) * (maxFontSize - fontSizeBase);
                        }

                        context.font = `${fontSize}px Arial`;
                        context.fillStyle = getRandomColor();
                        context.fillText(getRandomCharacter(), x, y);
                    }
                }
            }

            requestAnimationFrame(drawText);
        }

        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouseX = event.clientX - rect.left;
            mouseY = event.clientY - rect.top;
        });

        drawText();
    };
};
