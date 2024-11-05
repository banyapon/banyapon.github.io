
// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Variables for animation
let noiseSeed = new THREE.Vector3(Math.random() * 1000, Math.random() * 1000, Math.random() * 1000);
const colorList = [0xef476f, 0xffd166, 0x06d6a0, 0x118ab2, 0x073b4c];

// Sphere geometry setup
const geometry = new THREE.IcosahedronGeometry(6, 4);
const material = new THREE.MeshBasicMaterial({ color: 0xdddddd, wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // Update sphere rotation (similar to ofRotateX/Y)
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    // Example color-changing effect
    sphere.material.color.setHex(colorList[Math.floor(Math.random() * colorList.length)]);
}

// Start animation
camera.position.z = 10;
animate();

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
