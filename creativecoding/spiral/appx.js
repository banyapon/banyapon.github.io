window.onload = function() {
    const canvas = document.getElementById('deformCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;

    function drawSpiralLayers() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const numberOfSpirals = 10; // จำนวน spiral ซ้อนกัน
        const baseRadius = 90;
        const spacing = 90; // ระยะห่างระหว่าง spiral

        ctx.strokeStyle = '#000'; // สีขาว
        ctx.lineWidth = 20; // ความหนาของเส้น

        for (let i = 0; i < numberOfSpirals; i++) {
            ctx.beginPath();

            // ปรับค่า angleOffset เพื่อให้แต่ละ spiral มี offset ที่ไม่เหมือนกัน
            const angleOffset = i * Math.PI / 2 + time * 0.5; // เพิ่มเวลาเพื่อให้มีการเลื่อนของ offset ในแต่ละชั้น

            for (let angle = 0; angle <= Math.PI * 8; angle += 0.05) { // ลดระยะของ angle เพื่อให้เส้นชิดขึ้น
                // การคำนวณตำแหน่ง x และ y สำหรับ spiral ที่เปลี่ยนแปลงตามเวลา
                const radius = baseRadius + spacing * i + angle * 2;
                const offset = Math.sin(angle * 15 + time) * 10; // ปรับแต่งการ deform
                const x = centerX + (radius + offset) * Math.cos(angle + angleOffset);
                const y = centerY + (radius + offset) * Math.sin(angle + angleOffset);

                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
        }

        time += 0.05; // ควบคุมความเร็วของอนิเมชัน
    }

    function animate() {
        drawSpiralLayers();
        requestAnimationFrame(animate);
    }

    animate();
};
