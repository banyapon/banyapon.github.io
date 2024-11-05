// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Function to generate random numbers within a range
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Sphere and lines generation
function createCurvedPattern() {
    for (let i = 0; i < 9; i++) {
        const hue = (Math.floor(randomInRange(200, 280)) % 255) / 255;
        const color = new THREE.Color(`hsl(${hue * 360}, 60%, 50%)`);

        const radius = randomInRange(150, 850);
        const degStart = randomInRange(360, 720) + performance.now() / 1000 * Math.floor(randomInRange(2, 6));

        let sphereGeom = new THREE.SphereGeometry(randomInRange(2, 5), 12, 12);
        let sphereMat = new THREE.MeshBasicMaterial({ color });
        let sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.position.set(
            radius * Math.cos((degStart - 5) * (Math.PI / 180)),
            radius * Math.sin((degStart - 5) * (Math.PI / 180)),
            0
        );
        scene.add(sphere);

        for (let deg = degStart; deg < degStart + 350; deg++) {
            const point1 = new THREE.Vector3(
                radius * Math.cos(deg * (Math.PI / 180)),
                radius * Math.sin(deg * (Math.PI / 180)),
                0
            );

            const point2 = new THREE.Vector3(
                radius * Math.cos((deg + 1) * (Math.PI / 180)),
                radius * Math.sin((deg + 1) * (Math.PI / 180)),
                0
            );

            const distance = point1.distanceTo(sphere.position);
            const opacity = THREE.MathUtils.mapLinear(distance, 0, radius * 2, 1, 0);
            const lineMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([point1, point2]);
            const line = new THREE.Line(lineGeometry, lineMaterial);

            scene.add(line);
        }
    }
}

function removeOldObjects() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
}

function animate() {
    requestAnimationFrame(animate);
    removeOldObjects(); // ลบวัตถุเก่า
    createCurvedPattern(); // สร้างใหม่
    renderer.render(scene, camera);
}

animate();
