const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const countElement = document.getElementById('count');

let count = 0;
let prevWristAngle = null; // Keep track of the previous wrist angle
let movementDirection = null; // Track the direction of movement

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                { color: '#00FF00', lineWidth: 5 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

            // Calculate the angle between the wrist, thumb, and pinky
            const wrist = landmarks[0]; // Wrist landmark
            const thumb = landmarks[4]; // Thumb tip landmark
            const pinky = landmarks[20]; // Pinky tip landmark
            const angle = calculateAngle(wrist, thumb, pinky);

            // Determine if the wrist is bent in or out
            if (prevWristAngle !== null) {
                if (angle < prevWristAngle - 10) { // Adjust the threshold as needed
                    movementDirection = 'in';
                } else if (angle > prevWristAngle + 10) {
                    movementDirection = 'out';
                }
            }

            // Update the count and display the movement direction
            if (prevWristAngle !== null && Math.abs(angle - prevWristAngle) > 10) {
                if (movementDirection === 'out') {
                    count++;
                    countElement.innerText = count;
                }
            }

            prevWristAngle = angle;
        }
    }
    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();

// Helper function to calculate the angle between three points
function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}