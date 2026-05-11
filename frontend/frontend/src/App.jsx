import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedVideo, setProcessedVideo] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleProcess = () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setProcessing(false);
          setProcessedVideo(URL.createObjectURL(file));
          return 100;
        }
        return p + 2;
      });
    }, 80);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="app">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span>SkyVision <em>AI</em></span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#docs">Docs</a>
          <button className="btn-ghost">Sign in</button>
        </div>
      </nav>

      <header className="hero">
        <div className="badge">
          <span className="dot" /> AI-Powered Aerial Intelligence
        </div>
        <h1>
          Track and identify objects in your<br />
          <span className="gradient-text">drone footage</span> with precision
        </h1>
        <p className="subtitle">
          Upload your aerial videos and let our state-of-the-art computer vision
          models detect, track, and classify objects in real time.
        </p>
        <div className="stats">
          <div className="stat">
            <strong>99.2%</strong>
            <span>Detection accuracy</span>
          </div>
          <div className="stat">
            <strong>60+ FPS</strong>
            <span>Processing speed</span>
          </div>
          <div className="stat">
            <strong>120+</strong>
            <span>Object classes</span>
          </div>
        </div>
      </header>

      <main className="workspace">
        <div className="workspace-header">
          <h2>Process Your Drone Video</h2>
          <p>Two simple steps from upload to actionable insights.</p>
        </div>

        <div className="grid">
          {/* Upload card */}
          <section className="card">
            <div className="card-header">
              <div className="step-num">1</div>
              <div>
                <h3>Upload Video</h3>
                <p>Drag &amp; drop or browse your file</p>
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
                accept="video/mp4,video/quicktime,video/x-msvideo"
                onChange={handleChange}
                hidden
              />
              {!file ? (
                <>
                  <div className="upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="drop-title">Drop your video here</p>
                  <p className="drop-sub">or <span>click to browse</span></p>
                  <div className="formats">
                    <span>MP4</span><span>MOV</span><span>AVI</span>
                    <span className="divider">•</span>
                    <span>Max 500 MB</span>
                  </div>
                </>
              ) : (
                <div className="file-preview">
                  <div className="file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div className="file-info">
                    <p className="file-name">{file.name}</p>
                    <p className="file-meta">{formatSize(file.size)} • Ready to process</p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={(e) => { e.preventDefault(); setFile(null); setProcessedVideo(null); }}
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
              {processing ? `Processing… ${progress}%` : 'Start AI Processing'}
              {!processing && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </section>

          {/* Processing card */}
          <section className="card">
            <div className="card-header">
              <div className="step-num">2</div>
              <div>
                <h3>AI Processing</h3>
                <p>Real-time detection &amp; tracking</p>
              </div>
            </div>

            <div className="result-area">
              {processedVideo ? (
                <video src={processedVideo} controls className="result-video" />
              ) : processing ? (
                <div className="processing">
                  <div className="radar">
                    <div className="radar-sweep" />
                    <div className="radar-dot d1" />
                    <div className="radar-dot d2" />
                    <div className="radar-dot d3" />
                  </div>
                  <p className="proc-title">Analyzing frames…</p>
                  <p className="proc-sub">
                    {progress < 30 ? 'Extracting video features' :
                     progress < 60 ? 'Running object detection' :
                     progress < 90 ? 'Tracking objects across frames' :
                     'Finalizing results'}
                  </p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="placeholder">
                  <div className="placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <p>Your processed video will appear here</p>
                  <span>Upload a file and click "Start AI Processing"</span>
                </div>
              )}
            </div>

            <div className="feature-pills">
              <span className="pill">🎯 Object Detection</span>
              <span className="pill">📍 Multi-Object Tracking</span>
              <span className="pill">🏷️ Auto-Classification</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 SkyVision AI · Built with computer vision & ❤️</p>
      </footer>
    </div>
  );
}

export default App;
