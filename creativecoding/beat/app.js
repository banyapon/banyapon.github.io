const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let audioContext, analyser, dataArray, audioElement, source;
let backgroundColors = generateGradientColors();
let currentColorIndex = 0;
let nextGradientChange = Date.now() + 1000;

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Generate random gradient colors for background
function generateGradientColors() {
    const colors = [];
    for (let i = 0; i < 10; i++) {
        const baseColor = getRandomColor();
        const complementaryColor = getComplementaryColor(baseColor);
        colors.push([baseColor, complementaryColor]);
    }
    return colors;
}

function getRandomColor() {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function getComplementaryColor(color) {
    const hue = (parseInt(color.match(/\d+/)[0]) + 180) % 360;
    return `hsl(${hue}, 100%, 50%)`;
}

function changeBackgroundGradient() {
    if (Date.now() > nextGradientChange) {
        currentColorIndex = (currentColorIndex + 1) % backgroundColors.length;
        const [color1, color2] = backgroundColors[currentColorIndex];
        document.body.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
        nextGradientChange = Date.now() + 3000;
    }
}

// Particle class
class Particle {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6;
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.97;
        this.opacity -= 0.02;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function addParticles(frequency, amplitude) {
    // ลดจำนวน Particle ที่สร้างขึ้น
    const numParticles = Math.floor(amplitude / 95);
    
    let color;
    // ตรวจสอบความดังของเสียงเพื่อปรับสี
    if (amplitude > 200) {
        color = 'hsl(60, 100%, 95%)'; // สีขาวเมื่อความดังสูงที่สุด
    } else if (amplitude > 150) {
        color = `hsl(60, 100%, ${80 + (amplitude - 150) * 0.2}%)`; // สีเหลืองไปยังขาว
    } else {
        color = `hsl(${frequency / 2}, 80%, 50%)`; // สีตามความถี่
    }

    for (let i = 0; i < numParticles; i++) {
        const size = Math.random() * 20 + 5; // ขยายขนาดของ Dot

        // กระจาย Particle แบบสุ่มทั่วหน้าจอ
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        particles.push(new Particle(x, y, size, color));
    }
}



// Setup Audio with MP3 file
function setupAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    audioElement = new Audio('simple-motivation-151836.mp3');
    audioElement.crossOrigin = "anonymous";
    audioElement.loop = true;
    source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    source.connect(audioContext.destination);
    audioElement.play();

    animate();
}

// Animate visualization
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    changeBackgroundGradient();

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        dataArray.forEach((value, index) => {
            // ตรวจจับ amplitude และสร้าง Particle เมื่อค่าเกิน 140
            if (value > 140) addParticles(index, value);
        });
    }

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.size < 1 || particle.opacity < 0) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}


// Start button event
document.getElementById('startButton').addEventListener('click', () => {
    setupAudio();
    document.getElementById('startButton').style.display = 'none';
});
