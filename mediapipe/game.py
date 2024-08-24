import cv2
import mediapipe as mp
import numpy as np
import random

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

# Game Configuration
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
NUM_CIRCLES = 5
CIRCLE_RADIUS = 25
CIRCLE_FALL_SPEED = 5
COLORS = [(0, 255, 0), (0, 0, 255), (255, 0, 0), (255, 255, 0)]  # Green, Blue, Red, Yellow
SCORE_POSITION = (10, 30)

# Initialize circles
circles = []
for _ in range(NUM_CIRCLES):
    circles.append({
        'x': random.randint(CIRCLE_RADIUS, WINDOW_WIDTH - CIRCLE_RADIUS),
        'y': -CIRCLE_RADIUS,  
        'color': random.choice(COLORS),
        'active': True,
    })

score = 0

cap = cv2.VideoCapture(0)

with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
    while cap.isOpened():
        success, image = cap.read()
        if not success:
            break

        image = cv2.flip(image, 1)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = hands.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                index_finger = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                x, y = int(index_finger.x * image.shape[1]), int(index_finger.y * image.shape[0])

                for circle in circles:
                    if circle['active']:
                        distance = np.sqrt((x - circle['x'])**2 + (y - circle['y'])**2)
                        if distance < CIRCLE_RADIUS:
                            circle['active'] = False
                            score += 1
                            print("Circle caught! Score:", score)

        # Draw circles and update positions
        for circle in circles:
            if circle['active']:
                cv2.circle(image, (circle['x'], circle['y']), CIRCLE_RADIUS, circle['color'], -1)
                circle['y'] += CIRCLE_FALL_SPEED
                if circle['y'] > WINDOW_HEIGHT + CIRCLE_RADIUS:
                    circle['y'] = -CIRCLE_RADIUS
                    circle['x'] = random.randint(CIRCLE_RADIUS, WINDOW_WIDTH - CIRCLE_RADIUS)

        # Draw hand landmarks only if detected
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # Display score (with black background)
        cv2.rectangle(image, (SCORE_POSITION[0] - 5, SCORE_POSITION[1] - 30), (200, SCORE_POSITION[1] + 10), (0, 0, 0), -1) # Black rectangle for score
        cv2.putText(image, f"Score: {score}", SCORE_POSITION, cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

        cv2.imshow('MediaPipe Circle Game', image)
        if cv2.waitKey(1) & 0xFF == 27:  
            break

cap.release()
