let scene, camera, renderer, controls;
let font, mesh;
let charList = ['a', 'n', 't', 'h', 'o', 'l', 'o', 'g', 'y', '(', ')', ';'];
let fontSize = 50;
let meshes = [];
let sampleCount = 200;

// โหลดฟอนต์จาก Three.js
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont;
    init();
});

function init() {
    // สร้าง Scene, Camera, Renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // สร้าง Mesh ของตัวอักษร
    createTextMeshes();

    animate();
}

function createTextMeshes() {
    let xOffset = -360;
    let yOffset = -288;

    for (let x = -360; x <= 360; x += 60) {
        for (let y = -288; y <= 288; y += 72) {
            const charIndex = Math.floor((x + 360) / 60) % charList.length;
            const char = charList[charIndex];
            
            const geometry = new THREE.TextGeometry(char, {
                font: font,
                size: fontSize,
                height: 5,
                curveSegments: 12,
                bevelEnabled: false
            });

            const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const textMesh = new THREE.Mesh(geometry, material);

            textMesh.position.set(x + 18, y + 27, 0);
            textMesh.rotation.x = Math.PI;

            scene.add(textMesh);
            meshes.push(textMesh);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    let time = performance.now() * 0.002;

    // อัพเดทการเคลื่อนไหวของตัวอักษร
    meshes.forEach((mesh, index) => {
        const frameParam = index * -2 + Math.sin(time) * 200;
        mesh.position.z = Math.sin(frameParam * 0.05) * 10;
    });

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
