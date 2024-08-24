import cv2
import mediapipe as mp
import numpy as np

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

cap = cv2.VideoCapture(0)

with mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
    while cap.isOpened():
        success, image = cap.read()
        if not success:
            break

        image.flags.writeable = False
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks
            if len(hand_landmarks) == 2:  # Check if two hands are detected
                # Get index finger landmarks
                index1 = hand_landmarks[0].landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                index2 = hand_landmarks[1].landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]

                # Calculate 3D distance between fingertips
                distance = np.sqrt(
                    (index1.x - index2.x)**2 + 
                    (index1.y - index2.y)**2 +
                    (index1.z - index2.z)**2
                )

                # Map distance to cube scale (adjust min/max values as needed)
                min_scale = 0.5
                max_scale = 2.0
                scale = min_scale + (max_scale - min_scale) * distance

                # ... (Render the cube outline using the 'scale' value)

            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        cv2.imshow('MediaPipe Hands', image)
        if cv2.waitKey(5) & 0xFF == 27:
            break
cap.release()
