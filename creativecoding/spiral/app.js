window.onload = function() {
    const canvas = document.getElementById('deformCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;

    function drawSwirlPattern() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const numberOfWaves = 50; // จำนวนลวดลายหมุนวน
        const maxRadius = Math.min(canvas.width, canvas.height) / 2; // รัศมีสูงสุด

        for (let i = 0; i < numberOfWaves; i++) {
            ctx.beginPath();
            ctx.strokeStyle = i % 2 === 0 ? '#000' : '#fff'; // สลับสีขาวดำ
            ctx.lineWidth = maxRadius / numberOfWaves; // ความหนาของเส้นแต่ละลวดลาย

            for (let angle = 0; angle <= Math.PI * 6; angle += 0.01) {
                const radius = (maxRadius / numberOfWaves) * i + angle * 10;
                const x = centerX + radius * Math.cos(angle + time);
                const y = centerY + radius * Math.sin(angle + time);
                
                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
        }

        time += 0.06; // ควบคุมความเร็วของการหมุน
    }

    function animate() {
        drawSwirlPattern();
        requestAnimationFrame(animate);
    }

    animate();
};
