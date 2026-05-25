# main.py

from fastapi import FastAPI, UploadFile, File, BackgroundTasks  # type: ignore
from fastapi.responses import FileResponse  # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.responses import StreamingResponse # type: ignore
import numpy as np # type: ignore
from pipeline import Pipeline

import tempfile
import cv2 # type: ignore
import os
import subprocess

app = FastAPI()

# --------------------------------------------------
# CORS
# --------------------------------------------------

origins = [
    "http://localhost:5173",
    "https://drone-object-detection.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Load Pipeline
# --------------------------------------------------

pipeline = Pipeline()

# --------------------------------------------------
# Utility
# --------------------------------------------------

def cleanup_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Cleanup error: {e}")

# --------------------------------------------------
# Detect Endpoint
# --------------------------------------------------

@app.post("/detect/")
async def detect_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    temp_input_path = None

    try:

        print("Receiving video...")

        # ------------------------------------------
        # Save uploaded video temporarily
        # ------------------------------------------

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_input:
            temp_input.write(await file.read())
            temp_input_path = temp_input.name

        print("Video saved:", temp_input_path)

        # ------------------------------------------
        # Open Video
        # ------------------------------------------

        cap = cv2.VideoCapture(temp_input_path)

        if not cap.isOpened():
            raise RuntimeError("Could not open uploaded video.")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # ------------------------------------------
        # FPS Handling
        # ------------------------------------------

        original_fps = cap.get(cv2.CAP_PROP_FPS)

        if original_fps <= 0:
            original_fps = 30

        # ------------------------------------------
        # Frame Skipping
        # ------------------------------------------

        frame_skip = 2

        # Maintain original duration
        output_fps = original_fps / frame_skip

        print(f"Width: {width}")
        print(f"Height: {height}")
        print(f"Original FPS: {original_fps}")
        print(f"Output FPS: {output_fps}")

        # ------------------------------------------
        # Output AVI
        # ------------------------------------------

        avi_output = "output.avi"

        fourcc = cv2.VideoWriter_fourcc(*"XVID")

        out = cv2.VideoWriter(
            avi_output,
            fourcc,
            output_fps,
            (width, height)
        )

        print("Writer opened:", out.isOpened())

        if not out.isOpened():
            raise RuntimeError("VideoWriter failed to initialize.")

        # ------------------------------------------
        # Process Frames
        # ------------------------------------------

        frame_count = 0

        while cap.isOpened():

            ret, frame = cap.read()

            if not ret:
                print("Finished reading frames.")
                break

            frame_count += 1

            # ------------------------------------------
            # Skip Frames
            # ------------------------------------------

            if frame_count % frame_skip != 0:
                continue

            print(f"Processing frame {frame_count}")

            # ------------------------------------------
            # Resize smaller for faster inference
            # ------------------------------------------

            small_frame = cv2.resize(frame, (960, 540))

            # ------------------------------------------
            # YOLO inference
            # ------------------------------------------

            results = pipeline(small_frame)

            # ------------------------------------------
            # Draw detections
            # ------------------------------------------

            annotated_frame = results[0].plot()

            # ------------------------------------------
            # Resize back to original size
            # ------------------------------------------

            annotated_frame = cv2.resize(
                annotated_frame,
                (width, height)
            )

            # ------------------------------------------
            # Write frame
            # ------------------------------------------

            out.write(annotated_frame)

        # ------------------------------------------
        # Release Resources
        # ------------------------------------------

        cap.release()
        out.release()
        cv2.destroyAllWindows()

        print("AVI video processing completed.")

        # ------------------------------------------
        # Convert AVI -> MP4 using FFmpeg
        # ------------------------------------------

        print("Converting AVI to MP4 using ffmpeg...")

        mp4_output = "output.mp4"

        subprocess.run([
            "ffmpeg",
            "-y",
            "-i",
            avi_output,
            "-vcodec",
            "libx264",
            "-acodec",
            "aac",
            mp4_output
        ], check=True)

        print("MP4 conversion completed.")

        # ------------------------------------------
        # Cleanup Uploaded Input
        # ------------------------------------------

        background_tasks.add_task(
            cleanup_file,
            temp_input_path
        )

        # ------------------------------------------
        # Return Video URL
        # ------------------------------------------

        return {
            "video_url": "http://127.0.0.1:8000/video"
        }

    except Exception as e:

        print("ERROR:", str(e))

        if temp_input_path:
            cleanup_file(temp_input_path)

        raise e

# --------------------------------------------------
# Serve Processed Video
# --------------------------------------------------

@app.get("/video")
async def get_video():

    return FileResponse(
        "output.mp4",
        media_type="video/mp4"
    )

@app.post("/detect-frame/")
async def detect_frame(file: UploadFile = File(...)):
    # Implementation for frame detection
    contents = await file.read()
    np_array = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    results = pipeline(frame)
    annotated_frame = results[0].plot()
    _, buffer = cv2.imencode('.jpg', annotated_frame)
    return StreamingResponse(
        iter([buffer.tobytes()]),
        media_type="image/jpeg"
    )