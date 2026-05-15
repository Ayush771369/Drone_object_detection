from ultralytics import YOLO
import cv2

print("Starting script...")

model = YOLO("yolov8m.pt")
print("Model loaded")

video_path = "test.mp4"

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("ERROR: Could not open video")
    exit()

print("Video opened successfully")

while True:
    ret, frame = cap.read()

    if not ret:
        print("No more frames or failed reading")
        break

    print("Frame shape:", frame.shape)

    results = model(frame, conf=0.1)

    print("Detections:", len(results[0].boxes))

    annotated = results[0].plot()

    cv2.imshow("Detection", annotated)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()