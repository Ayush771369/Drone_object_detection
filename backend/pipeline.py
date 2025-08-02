from ultralytics import YOLO

# Load a COCO-pretrained YOLOv8n model
model = YOLO("yolov8m.pt")
class Pipeline:
    def __init__(self):
        self.model = model

    def predict(self, image):
        results = self.model(image)
        return results

    def __call__(self, image):
        return self.predict(image)