const videoElement = document.getElementById('input_video');
    const canvasElement = document.getElementById('output_canvas');
    const canvasCtx = canvasElement.getContext('2d');
    let count = 0;
    let stage = 0;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });
    camera.start();

    function onResults(results) {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks) => {
          drawLandmarks(canvasCtx, landmarks);

          const wrist = landmarks[0];
          const elbow = landmarks[9];
          const shoulder = { x: 0.5, y: 0.5 }; // Placeholder position for shoulder

          // ตรวจสอบลำดับขั้นตอนของการเคลื่อนไหว
          switch (stage) {
            case 0:
              // ยื่นมือไปด้านหน้า
              if (wrist.y > 0.6 && Math.abs(wrist.x - shoulder.x) < 0.2) {
                stage = 1;
              }
              break;
            case 1:
              // งอแขนเข้าหาลำตัว
              if (wrist.y < elbow.y && Math.abs(wrist.x - shoulder.x) < 0.2) {
                stage = 2;
              }
              break;
            case 2:
              count++;
              document.getElementById("count").innerText = count;
              stage = 0;
              break;
          }
        });
      }
    }

    function drawLandmarks(ctx, landmarks) {
      for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }