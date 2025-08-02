Drone Object Detection
Overview
This repository contains a drone-based object detection system that uses the YOLOv8m model for real-time object detection. The system is powered by a FastAPI backend for serving the model and a React-based frontend with Tailwind CSS for an interactive user interface. It supports applications like surveillance, search and rescue, and environmental monitoring by detecting objects in drone-captured videos or images.
Features

Real-time object detection using the YOLOv8m model.
FastAPI backend for efficient model inference and API endpoints.
React frontend with Tailwind CSS for a responsive, user-friendly interface.
Support for drone video feeds and static image inputs.
Configurable object classes (e.g., vehicles, people, animals).
Integration with drone APIs for live streaming.
Visualizations for bounding boxes, confidence scores, and detection results.

Installation
Prerequisites

Python 3.8+
Node.js 16+ (for the React frontend)
pip and npm for package installation
A compatible drone (e.g., DJI Mavic, Parrot Anafi) with API access
GPU (recommended for faster YOLOv8m inference)

Steps

Clone the Repository:
git clone https://github.com/your-username/drone-object-detection.git
cd drone-object-detection


Set Up Backend (FastAPI):

Create a virtual environment (optional but recommended):python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install Python dependencies:pip install -r backend/requirements.txt


Download YOLOv8m weights:
Get the pre-trained yolov8m.pt from Ultralytics YOLOv8 and place it in backend/models/.




Set Up Frontend (React):

Navigate to the frontend directory:cd frontend


Install Node.js dependencies:npm install




Configure Environment:

Update backend/config.yaml with your drone API settings and desired object classes.
Update frontend/.env with the FastAPI backend URL (e.g., REACT_APP_API_URL=http://localhost:8000).



Usage
Running the Backend

Start the FastAPI server:cd backend
uvicorn main:app --host 0.0.0.0 --port 8000


Access the API documentation at http://localhost:8000/docs to test endpoints like:
/detect (POST): Upload an image or video for object detection.
/stream (GET): Connect to a drone's live video feed for real-time detection.



Running the Frontend

Start the React development server:cd frontend
npm start


Open http://localhost:3000 in your browser to access the interface.

Running Object Detection

Via API (Backend):
Detect objects in a video:curl -X POST "http://localhost:8000/detect" -F "file=@video.mp4"


Stream real-time detection with a drone:python backend/stream.py --drone-api <your-drone-api>




Via Frontend:
Upload images/videos or connect to a drone feed through the web interface.
View real-time detection results with bounding boxes and confidence scores.



Frontend Details
The frontend is built with React and styled using Tailwind CSS for a responsive and modern user experience. Key features include:

Video/Image Upload: Drag-and-drop interface for uploading media files for object detection.
Live Stream Integration: Displays real-time drone video feeds with overlaid bounding boxes for detected objects.
Detection Results: Visualizes bounding boxes, class labels, and confidence scores in a clean, interactive format.
Controls: Buttons to start/stop the drone stream, adjust detection settings (e.g., confidence threshold), and download results.
Responsive Design: Optimized for desktop and mobile devices using Tailwind CSS.
Error Handling: Displays user-friendly error messages for failed uploads or connection issues.
API Integration: Communicates with the FastAPI backend via RESTful endpoints to fetch detection results.

To customize the frontend:

Edit frontend/src/App.jsx to modify the main application logic.
Update frontend/src/components/ for reusable components (e.g., VideoPlayer.jsx, ResultsDisplay.jsx).
Adjust styles in frontend/src/index.css using Tailwind CSS utilities.

Example Workflow

Start the FastAPI backend (uvicorn main:app).
Launch the React frontend (npm start).
Open http://localhost:3000, upload a video, or connect to a drone feed.
View detection results with bounding boxes drawn on the media.
Save results to backend/results/ or download them via the frontend.

Project Structure
drone-object-detection/
├── backend/
│   ├── main.py            # FastAPI application
│   ├── stream.py          # Script for real-time drone streaming
│   ├── config.yaml        # Configuration for model and drone settings
│   ├── models/            # Directory for YOLOv8m weights
│   ├── results/           # Directory for detection outputs
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── components/    # Reusable React components
│   │   └── index.css      # Tailwind CSS styles
│   ├── public/            # Static assets
│   ├── .env               # Environment variables
│   └── package.json       # Node.js dependencies
├── data/                  # Directory for input data (videos/images)
└── README.md              # This file

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Commit your changes (git commit -m 'Add new feature').
Push to the branch (git push origin feature-branch).
Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Acknowledgments

Ultralytics YOLOv8 for the YOLOv8m model.
FastAPI for the backend framework.
React and Tailwind CSS for the frontend.
DJI SDK for drone integration.
Contributors and the open-source community.
