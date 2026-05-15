# pipeline.py

from ultralytics import YOLO

# --------------------------------------------------
# Load FAST nano YOLO model
# --------------------------------------------------

model = YOLO("yolov8n.pt")

print("YOLOv8 Nano model loaded successfully.")

# --------------------------------------------------
# Pipeline
# --------------------------------------------------

class Pipeline:

    def __init__(self):
        self.model = model

    def predict(self, image):

        results = self.model(
            image,
            imgsz=640,      # Smaller inference size
            conf=0.25,      # Confidence threshold
            verbose=False   # Disable terminal spam
        )

        return results

    def __call__(self, image):
        return self.predict(image)