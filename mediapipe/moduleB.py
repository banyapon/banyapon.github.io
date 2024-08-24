import cv2
import mediapipe as mp
import numpy as np
import random

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

# Game Configuration
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
NUM_CIRCLES = 4
CIRCLE_RADIUS = 25
COLORS = [(0, 255, 0), (0, 0, 255), (255, 0, 0), (255, 255, 0)]
RECTANGLE_HEIGHT = 50
RECTANGLE_Y = WINDOW_HEIGHT - RECTANGLE_HEIGHT  # Fixed Y position at the bottom

# Initialize circles and rectangles
circles = []
rectangles = []
for i in range(NUM_CIRCLES):
    color = COLORS[i]
    circles.append({
        'x': random.randint(CIRCLE_RADIUS, WINDOW_WIDTH - CIRCLE_RADIUS),
        'y': random.randint(CIRCLE_RADIUS, WINDOW_HEIGHT // 2),  # Start circles in the top half
        'color': color,
        'grabbed': False,
    })
    # Evenly space rectangles at the bottom
    rectangles.append({
        'x': i * (WINDOW_WIDTH // NUM_CIRCLES) + (WINDOW_WIDTH // NUM_CIRCLES - 50) // 2,
        'y': RECTANGLE_Y,
        'width': 50,
        'height': RECTANGLE_HEIGHT,
        'color': color,
    })

score = 0

cap = cv2.VideoCapture(0)

with mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
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

                for i, circle in enumerate(circles):
                    distance = np.sqrt((x - circle['x']) ** 2 + (y - circle['y']) ** 2)
                    if not circle['grabbed'] and distance < CIRCLE_RADIUS:  # Grab the circle
                        circle['grabbed'] = True
                        break
                    elif circle['grabbed']:  # Move the grabbed circle
                        circle['x'] = x
                        circle['y'] = y

        # Draw circles, rectangles, and check for matches
        for i, circle in enumerate(circles):
            if circle['grabbed']:
                color = (0, 0, 255)
                label = "Release!"
            else:
                color = circle['color']
                label = "Grab!"

            cv2.circle(image, (circle['x'], circle['y']), CIRCLE_RADIUS, color, -1)
            cv2.putText(image, label, (circle['x'] - 20, circle['y'] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # Check for a match with the corresponding rectangle
            rectangle = rectangles[i]
            if (
                rectangle['x'] < circle['x'] < rectangle['x'] + rectangle['width'] and
                rectangle['y'] < circle['y'] < rectangle['y'] + rectangle['height'] and
                circle['color'] == rectangle['color']  # Check color match
            ):
                score += 1
                # Reset the circle to the top
                circle['x'] = random.randint(CIRCLE_RADIUS, WINDOW_WIDTH - CIRCLE_RADIUS)
                circle['y'] = -CIRCLE_RADIUS  
                circle['grabbed'] = False

            cv2.rectangle(
                image,
                (rectangle['x'], rectangle['y']),
                (rectangle['x'] + rectangle['width'], rectangle['y'] + rectangle['height']),
                rectangle['color'],
                3,
            )

        # Draw hand landmarks
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # Display score
        cv2.putText(image, f"Score: {score}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

        cv2.imshow('MediaPipe Circle Game', image)
        if cv2.waitKey(1) & 0xFF == 27:  
            break

cap.release()
