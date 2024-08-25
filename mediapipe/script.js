// script.js
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const scoreElement = document.getElementById('score');

const drawingUtils = window; 

const holistic = new Holistic({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
}});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({image: videoElement});
  },
  width: 640,
  height: 480
});
camera.start();

// Circles properties
const circles = [
  {'x': 100, 'y': 100, 'radius': 30, 'color': '#FF0000', 'label': 'A', 'is_grabbing': false},  // Red
  {'x': 400, 'y': 100, 'radius': 30, 'color': '#00FF00', 'label': 'B', 'is_grabbing': false},  // Green
  {'x': 100, 'y': 400, 'radius': 30, 'color': '#0000FF', 'label': 'C', 'is_grabbing': false},  // Blue
  {'x': 400, 'y': 400, 'radius': 30, 'color': '#00FFFF', 'label': 'D', 'is_grabbing': false},  // Yellow
];

// Frames for matching
const frames = [
  {'x': 100, 'y': 100, 'radius': 30, 'color': '#FF0000'},  // Red
  {'x': 400, 'y': 100, 'radius': 30, 'color': '#00FF00'},  // Green
  {'x': 100, 'y': 400, 'radius': 30, 'color': '#0000FF'},  // Blue
  {'x': 400, 'y': 400, 'radius': 30, 'color': '#00FFFF'},  // Yellow
];

// Grab/release variables
const grab_threshold = 0.07;
const release_threshold = 0.1;

// Score variable
let score = 0;

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
    // Flip the video horizontally
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1); 
  
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    const hands = [
      { landmarks: results.leftHandLandmarks, label: 'Left' },
      { landmarks: results.rightHandLandmarks, label: 'Right' }
    ];
  
    for (const hand of hands) {
      if (hand.landmarks) {
        const indexFinger = hand.landmarks[8]; 
  
        for (let i = 0; i < circles.length; i++) {
          const circle = circles[i];
          const distance = Math.hypot(
            indexFinger.x * canvasElement.width - circle.x,
            indexFinger.y * canvasElement.height - circle.y
          ) / Math.hypot(canvasElement.width, canvasElement.height);
  
          // Grab/release logic
          if (distance < grab_threshold && !circle.is_grabbing) { 
            circle.is_grabbing = true;
            circle.grabbedBy = hand.label; 
          } else if (distance > release_threshold && circle.is_grabbing && circle.grabbedBy === hand.label) {
            circle.is_grabbing = false;
            circle.grabbedBy = null; 
            // Check for match when released
            if (Math.hypot(circle.x - frames[i].x, circle.y - frames[i].y) < frames[i].radius) {
              score++;
            }
          }
  
          // Circle movement
          if (circle.is_grabbing && circle.grabbedBy === hand.label) {
            circle.x = indexFinger.x * canvasElement.width;
            circle.y = indexFinger.y * canvasElement.height;
          }
  
          // Draw the circle and label
          canvasCtx.beginPath();
          canvasCtx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
          canvasCtx.fillStyle = circle.color;
          canvasCtx.fill();
          canvasCtx.font = '16px Arial';
          canvasCtx.fillStyle = 'white';
          canvasCtx.fillText(circle.label, circle.x - 7, circle.y + 5); 
        }
  
        // Draw hand landmarks
        drawingUtils.drawConnectors(canvasCtx, hand.landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
        for (const landmark of hand.landmarks) {
          drawingUtils.drawLandmarks(canvasCtx, [landmark], {color: '#00FF00', lineWidth: 2});
        }
      }
    }
  
    // Draw matching frames
    for (const frame of frames) {
      canvasCtx.beginPath();
      canvasCtx.arc(frame.x, frame.y, frame.radius, 0, 2 * Math.PI);
      canvasCtx.strokeStyle = frame.color;
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    }
  
    // Display score
    scoreElement.textContent = `Score: ${score}`;
  
    canvasCtx.restore(); 
  }