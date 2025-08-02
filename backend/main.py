# main.py

from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from pipeline import Pipeline
import tempfile
import cv2
import os

app = FastAPI()
# It's good practice to add CORS middleware for web frontends
from fastapi.middleware.cors import CORSMiddleware

# main.py

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173", # <-- ADD THIS LINE
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = Pipeline()

def cleanup_file(path: str):
    """Deletes a file from the specified path."""
    os.remove(path)

# main.py

@app.post("/detect/")
async def detect_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    temp_input_path = None
    temp_output_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_input:
            temp_input.write(await file.read())
            temp_input_path = temp_input.name

        cap = cv2.VideoCapture(temp_input_path)
        if not cap.isOpened():
            raise RuntimeError("Could not open video file.")
        
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_output:
            temp_output_path = temp_output.name
        
        # --- THIS IS THE LINE TO CHANGE ---
        # Use 'avc1' for H.264 codec, which is browser-compatible
        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        out = cv2.VideoWriter(temp_output_path, fourcc, fps, (width, height))
        # ------------------------------------

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = pipeline(frame)
            for r in results:
                annotated_frame = r.plot()
                out.write(annotated_frame)

        cap.release()
        out.release()

        background_tasks.add_task(cleanup_file, temp_input_path)
        background_tasks.add_task(cleanup_file, temp_output_path)

        return FileResponse(temp_output_path, media_type="video/mp4", filename="processed_video.mp4")

    except Exception as e:
        if temp_input_path and os.path.exists(temp_input_path):
            cleanup_file(temp_input_path)
        if temp_output_path and os.path.exists(temp_output_path):
            cleanup_file(temp_output_path)
        raise e
