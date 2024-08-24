import cv2
import mediapipe as mp
import numpy as np
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1)
mp_drawing = mp.solutions.drawing_utils

# Load the oil painting effect task graph (updated for older versions)
BaseOptions = mp.tasks.BaseOptions
FaceStylizer = mp.tasks.FaceStylizer
FaceStylizerOptions = mp.tasks.FaceStylizerOptions

options = FaceStylizerOptions(
    base_options=BaseOptions(model_asset_path='modules/face_stylizer_oil_painting.task')  # Note the .tflite extension
)
oil_painting = FaceStylizer.create_from_options(options)

cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, image = cap.read()
    if not success:
        break

    image.flags.writeable = False
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Face landmark detection
    results = face_mesh.process(image)

    # Face stylization (oil painting)
    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            stylized_image = oil_painting.process(
                mp.Image(image_format=mp.ImageFormat.SRGB, data=image),
                face_landmarks
            ).stylized_image.numpy_view()

            # Convert the stylized image back to BGR for OpenCV display
            stylized_image = cv2.cvtColor(stylized_image, cv2.COLOR_RGB2BGR)

            # Draw face mesh landmarks on the original image (optional)
            mp_drawing.draw_landmarks(
                image=image,
                landmark_list=face_landmarks,
                connections=mp_face_mesh.FACE_CONNECTIONS,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_connections_style()
            )

            # Display the stylized image (replace the original with the stylized one)
            cv2.imshow('MediaPipe Face Stylization', stylized_image)

    else:
        # If no face is detected, show the original image
        cv2.imshow('MediaPipe Face Stylization', image)

    if cv2.waitKey(5) & 0xFF == 27:  # Press 'esc' to quit
        break

cap.release()
cv2.destroyAllWindows()
