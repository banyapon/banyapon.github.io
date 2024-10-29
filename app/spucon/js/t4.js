const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const countElement = document.getElementById('count');

let count = 0;
let prevThumbTipDistance = null;
let touching = false;

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
        for (let i = 0; i < 2; i++) {
            const landmarks = results.multiHandLandmarks[i];
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                { color: '#00FF00', lineWidth: 5 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

            const thumbTip = landmarks[4]; // Thumb tip landmark
            const otherHandLandmarks = results.multiHandLandmarks[1 - i]; // Landmarks of the other hand

            // Check if thumb tip is touching any fingertip of the other hand
            for (let j = 8; j <= 20; j += 4) { // Loop through index, middle, ring, pinky fingertips
                const fingerTip = otherHandLandmarks[j];
                const distance = calculateDistance(thumbTip, fingerTip);

                if (distance < 0.05) { // Adjust the threshold as needed
                    touching = true;
                    break;
                }
            }
        }

        if (touching) {
            const leftThumbTip = results.multiHandLandmarks[0][4];
            const rightThumbTip = results.multiHandLandmarks[1][4];
            const thumbTipDistance = calculateDistance(leftThumbTip, rightThumbTip);

            if (prevThumbTipDistance !== null && thumbTipDistance > prevThumbTipDistance) {
                count++;
                countElement.innerText = count;
            }

            prevThumbTipDistance = thumbTipDistance;
        } else {
            prevThumbTipDistance = null;
        }

        touching = false;
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

// Helper function to calculate distance between two points
function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}