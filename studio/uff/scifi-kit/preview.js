import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const stage = document.querySelector('#stage');
const status = document.querySelector('#status');
const keys = new Set();
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
stage.prepend(renderer.domElement);
renderer.domElement.style.zIndex = '1';
for (const el of stage.querySelectorAll('.overlay,#status,.controls')) el.style.zIndex = '2';
scene.add(new THREE.HemisphereLight(0xeafaff, 0x64737d, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(-6, 12, 8);
scene.add(sun);
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const actor = new THREE.Group();
scene.add(actor);
let manifest, mixer, actions = {}, activeAction, ready = false;
const player = { x: -1, y: 0, vx: 0, vy: 0, grounded: true, facing: 1, coyote: 0.1, jumpBuffer: 0 };
const HALF_WIDTH = 0.25;
const HEIGHT = 1.55;
let cameraX = -1;
const FAR_FACTOR = 0.12, NEAR_FACTOR = 0.30;

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const half = 4.6;
  camera.left = -half * w / h;
  camera.right = half * w / h;
  camera.top = half;
  camera.bottom = -half;
  camera.near = 0.1;
  camera.far = 100;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
new ResizeObserver(resize).observe(stage);
resize();

function play(name) {
  const next = actions[name] || actions.idle;
  if (!next || next === activeAction) return;
  const old = activeAction;
  next.reset().fadeIn(0.12).play();
  old?.fadeOut(0.12);
  activeAction = next;
}

function reset() {
  const spawn = manifest.level.spawn;
  Object.assign(player, { x: spawn[0], y: spawn[1], vx: 0, vy: 0, grounded: true, coyote: 0.1, jumpBuffer: 0 });
  cameraX = player.x;
}

function surface(instance, x) {
  const module = manifest.modules[instance.module];
  if (module.kind !== 'ramp') return instance.position[1];
  return instance.position[1] + ((x - instance.position[0]) / module.length + 0.5) * module.collider.rise;
}

function contactsAt(x) {
  return manifest.level.instances.filter(i => {
    const m = manifest.modules[i.module];
    return !i.decor_only && m.collider.walkable && x > i.position[0] - m.length / 2 - HALF_WIDTH && x < i.position[0] + m.length / 2 + HALF_WIDTH;
  });
}

function updatePhysics(dt) {
  const direction = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
  player.vx = direction * manifest.level.run_speed;
  if (direction) player.facing = direction;
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  player.coyote = player.grounded ? 0.10 : Math.max(0, player.coyote - dt);
  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = manifest.level.jump_speed;
    player.grounded = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
  }
  const oldX = player.x, oldY = player.y;
  player.x = THREE.MathUtils.clamp(player.x + player.vx * dt, -1.6, 39);
  // Solid platform sides. Their tops are handled separately below.
  for (const i of contactsAt(player.x)) {
    const m = manifest.modules[i.module];
    if (m.kind === 'ramp') continue;
    const top = i.position[1], bottom = top - m.thickness;
    if (oldY >= top - 0.10 || oldY + HEIGHT <= bottom + 0.02) continue;
    const left = i.position[0] - m.length / 2 - HALF_WIDTH;
    const right = i.position[0] + m.length / 2 + HALF_WIDTH;
    if (oldX <= left && player.x > left) player.x = left;
    else if (oldX >= right && player.x < right) player.x = right;
  }
  player.vy -= manifest.level.gravity * dt;
  player.y += player.vy * dt;
  player.grounded = false;
  let best = -Infinity;
  for (const i of contactsAt(player.x)) {
    const m = manifest.modules[i.module];
    const x = THREE.MathUtils.clamp(player.x, i.position[0] - m.length / 2, i.position[0] + m.length / 2);
    const top = surface(i, x);
    // Grounded ramp tracking accounts for the rise between consecutive frames.
    const rampTolerance = m.kind === 'ramp' ? 0.09 : 0.025;
    if (player.vy <= 0 && oldY >= top - rampTolerance && player.y <= top + 0.04) best = Math.max(best, top);
    const bottom = top - m.thickness;
    if (player.vy > 0 && oldY + HEIGHT <= bottom && player.y + HEIGHT > bottom) {
      player.y = bottom - HEIGHT;
      player.vy = 0;
    }
  }
  if (best > -Infinity) {
    player.y = best;
    player.vy = 0;
    player.grounded = true;
  }
  if (player.y < -5) reset();
  actor.position.set(player.x, player.y, 0);
  actor.rotation.y = player.facing * Math.PI / 2;
  play(player.grounded ? (direction ? 'run' : 'idle') : 'jump');
}

function parallax(id, factor) {
  const layer = document.querySelector(id);
  const tile = layer.querySelector('img').getBoundingClientRect().width;
  if (!tile) return;
  const pixelsPerMeter = stage.clientHeight / 9.2;
  const period = tile * 2;
  const offset = ((cameraX * pixelsPerMeter * factor) % period + period) % period;
  layer.style.transform = `translateX(${-offset}px)`;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (ready) {
    const steps = Math.ceil(dt / (1 / 120));
    for (let step = 0; step < steps; step++) updatePhysics(dt / steps);
    mixer?.update(dt);
    cameraX = THREE.MathUtils.lerp(cameraX, player.x + player.facing * 1.2, 1 - Math.exp(-dt * 4));
    camera.position.set(cameraX, 6.0, 14);
    camera.lookAt(cameraX, 1.85, 0);
    parallax('#far', FAR_FACTOR);
    parallax('#near', NEAR_FACTOR);
  }
  renderer.render(scene, camera);
}

addEventListener('keydown', e => {
  if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.code)) e.preventDefault();
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !e.repeat) player.jumpBuffer = 0.13;
  if (e.code === 'KeyR' && ready) reset();
  keys.add(e.code);
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
for (const button of document.querySelectorAll('[data-key]')) {
  button.addEventListener('pointerdown', e => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    keys.add(button.dataset.key);
    if (button.dataset.key === 'Space') player.jumpBuffer = 0.13;
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => keys.delete(button.dataset.key));
}

try {
  const response = await fetch('manifest.json');
  if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
  manifest = await response.json();
  const [level, character] = await Promise.all([loader.loadAsync(manifest.level.file), loader.loadAsync('../1-improved.glb')]);
  scene.add(level.scene);
  actor.add(character.scene);
  mixer = new THREE.AnimationMixer(character.scene);
  for (const clip of character.animations) {
    // Keep hip/body motion; discard only scene-root displacement in locomotion clips.
    const localClip = clip.clone();
    localClip.tracks = localClip.tracks.filter(track => !track.name.startsWith('Armature.position'));
    actions[clip.name.toLowerCase()] = mixer.clipAction(localClip);
  }
  reset();
  ready = true;
  status.textContent = 'พร้อมเล่น · ด่านยาว 42 เมตร · R เริ่มใหม่';
  window.uffPreview = { player, scene, manifest, reset, ready: true };
} catch (error) {
  status.textContent = 'โหลดไม่สำเร็จ: เปิดผ่าน HTTP server และตรวจสอบการเชื่อมต่อ';
  console.error(error);
}
animate();
