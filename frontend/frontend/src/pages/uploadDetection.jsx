import { useState, useRef } from 'react';
import '../App.css';

function UploadDetection() {

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedVideo, setProcessedVideo] = useState(null);

  const inputRef = useRef(null);

  // --------------------------------------------------
  // Drag handlers
  // --------------------------------------------------

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  // --------------------------------------------------
  // Upload + Process Video
  // --------------------------------------------------

  const handleProcess = async () => {

    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setProcessedVideo(null);

    try {

      console.log("Uploading video...");

      const formData = new FormData();
      formData.append("file", file);

      // Fake progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }, 500);

      // ------------------------------------------
      // Send video to backend
      // ------------------------------------------

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/detect-frame/`,
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);

      console.log("Backend response:", response);

      if (!response.ok) {
        throw new Error("Video processing failed.");
      }

      // ------------------------------------------
      // Receive video URL
      // ------------------------------------------

      const data = await response.json();

      console.log("Received data:", data);

      // ------------------------------------------
      // Fetch processed MP4
      // ------------------------------------------

      const videoResponse = await fetch(data.video_url);

      console.log("Video response:", videoResponse);

      if (!videoResponse.ok) {
        throw new Error("Could not fetch processed video.");
      }

      // Convert to blob
      const videoBlob = await videoResponse.blob();

      console.log("Video blob:", videoBlob);

      // Create local blob URL
      const videoBlobUrl = URL.createObjectURL(videoBlob);

      console.log("Blob URL:", videoBlobUrl);

      // Set processed video
      setProcessedVideo(videoBlobUrl);

      setProgress(100);

      console.log("Video ready for playback.");

    } catch (error) {

      console.error("ERROR:", error);

      alert("Error processing video.");

    } finally {

      setProcessing(false);
    }
  };

  // --------------------------------------------------
  // Utility
  // --------------------------------------------------

  const formatSize = (bytes) => {

    if (!bytes) return '';

    const mb = bytes / (1024 * 1024);

    return mb > 1
      ? `${mb.toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div className="app">

      {/* Background Effects */}

      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* ------------------------------------------------ */}
      {/* Navbar */}
      {/* ------------------------------------------------ */}

      <nav className="navbar">

        <div className="logo">

          <div className="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <span>
            SkyVision <em>AI</em>
          </span>

        </div>

      </nav>

      {/* ------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------ */}

      <header className="hero">

        <div className="badge">
          <span className="dot" />
          AI-Powered Aerial Intelligence
        </div>

        <h1>
          Track and identify objects in your
          <br />
          <span className="gradient-text">
            drone footage
          </span>
          {" "}with precision
        </h1>

        <p className="subtitle">
          Upload aerial videos and let advanced AI detect,
          track, and classify objects automatically.
        </p>

      </header>

      {/* ------------------------------------------------ */}
      {/* Main Workspace */}
      {/* ------------------------------------------------ */}

      <main className="workspace">

        <div className="workspace-header">

          <h2>Process Your Drone Video</h2>

          <p>
            Upload → Detect → Analyze
          </p>

        </div>

        <div className="grid">

          {/* ------------------------------------------------ */}
          {/* Upload Card */}
          {/* ------------------------------------------------ */}

          <section className="card">

            <div className="card-header">

              <div className="step-num">
                1
              </div>

              <div>
                <h3>Upload Video</h3>
                <p>Drag & drop your drone footage</p>
              </div>

            </div>

            <label
              htmlFor="file-input"
              className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >

              <input
                id="file-input"
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleChange}
                hidden
              />

              {!file ? (

                <>
                  <div className="upload-icon">
                    📤
                  </div>

                  <p className="drop-title">
                    Drop your video here
                  </p>

                  <p className="drop-sub">
                    or click to browse
                  </p>

                  <div className="formats">
                    <span>MP4</span>
                    <span>MOV</span>
                    <span>AVI</span>
                  </div>
                </>

              ) : (

                <div className="file-preview">

                  <div className="file-info">

                    <p className="file-name">
                      {file.name}
                    </p>

                    <p className="file-meta">
                      {formatSize(file.size)}
                    </p>

                  </div>

                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                      setProcessedVideo(null);
                    }}
                  >
                    ✕
                  </button>

                </div>

              )}

            </label>

            <button
              className="btn-primary"
              disabled={!file || processing}
              onClick={handleProcess}
            >

              {processing
                ? `Processing... ${progress}%`
                : "Start AI Processing"}

            </button>

          </section>

          {/* ------------------------------------------------ */}
          {/* Result Card */}
          {/* ------------------------------------------------ */}

          <section className="card">

            <div className="card-header">

              <div className="step-num">
                2
              </div>

              <div>
                <h3>AI Processing</h3>
                <p>Object detection & tracking</p>
              </div>

            </div>

            <div className="result-area">

              {processedVideo ? (

                <video
                  controls
                  autoPlay
                  className="result-video"
                >
                  <source
                    src={processedVideo}
                    type="video/mp4"
                  />
                </video>

              ) : processing ? (

                <div className="processing">

                  <p className="proc-title">
                    Analyzing frames...
                  </p>

                  <p className="proc-sub">
                    AI is detecting objects
                  </p>

                  <div className="progress-bar">

                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />

                  </div>

                </div>

              ) : (

                <div className="placeholder">

                  <p>
                    Processed video will appear here
                  </p>

                </div>

              )}

            </div>

          </section>

        </div>

      </main>

      {/* ------------------------------------------------ */}
      {/* Footer */}
      {/* ------------------------------------------------ */}

      <footer className="footer">
        © 2026 SkyVision AI · Built with Computer Vision
      </footer>

    </div>
  );
}

export default UploadDetection;