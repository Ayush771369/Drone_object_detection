import { useRef, useState, useEffect, useCallback } from "react";
import "./LiveDetection.css";

// ── Helper: animated corner brackets ──────────────────────────────────────────
function ScanFrame({ children, className = "" }) {
  return (
    <div className={`scan-frame ${className}`}>
      <span className="sf-corner sf-tl" />
      <span className="sf-corner sf-tr" />
      <span className="sf-corner sf-bl" />
      <span className="sf-corner sf-br" />
      <div className="sf-scan-line" />
      {children}
    </div>
  );
}

// ── Helper: glowing status badge ──────────────────────────────────────────────
function StatusBadge({ label, active = true, color = "cyan" }) {
  return (
    <span className={`status-badge badge-${color} ${active ? "badge-active" : "badge-inactive"}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

// ── Helper: stat card ─────────────────────────────────────────────────────────
function StatCard({ label, value, unit = "", icon, color = "cyan" }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {value}
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill" />
      </div>
    </div>
  );
}

// ── Helper: radar loader ──────────────────────────────────────────────────────
function RadarLoader() {
  return (
    <div className="radar-wrap">
      <div className="radar-ring r1" />
      <div className="radar-ring r2" />
      <div className="radar-ring r3" />
      <div className="radar-sweep" />
      <div className="radar-dot" />
      <p className="radar-label">INITIALIZING SENSOR…</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LiveDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState("STANDBY");
  const [detectionFeedReady, setDetectionFeedReady] = useState(false);

  const fpsRef = useRef({ count: 0, last: Date.now() });

  // ── Start webcam ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Frame capture + send ───────────────────────────────────────────────────
  const isSendingRef = useRef(false);
  const captureAndSend = useCallback(async () => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detCanvas = detectionCanvasRef.current;
    if (!video || !canvas || !detCanvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/detect-frame/`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) return;
        const imageBlob = await res.blob();
        const url = URL.createObjectURL(imageBlob);
        const img = new Image();
        img.onload = () => {
          const dCtx = detCanvas.getContext("2d");
          detCanvas.width = img.width;
          detCanvas.height = img.height;
          dCtx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          setDetectionFeedReady(true);
          setDetectionStatus("DETECTING");
          setFrameCount((c) => c + 1);

          // FPS counter
          const now = Date.now();
          fpsRef.current.count++;
          if (now - fpsRef.current.last >= 1000) {
            setFps(fpsRef.current.count);
            fpsRef.current.count = 0;
            fpsRef.current.last = now;
          }
        };
        img.src = url;
      } catch (e) {
        console.error("Detection error:", e);
      } finally {
        isSendingRef.current = false;
      }
    }, "image/jpeg");
  }, []);

  // ── Toggle detection ───────────────────────────────────────────────────────
  const toggleDetection = () => {
    if (isDetecting) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsDetecting(false);
      setDetectionStatus("STANDBY");
      setFps(0);
    } else {
      intervalRef.current = setInterval(captureAndSend, 1000);
      setIsDetecting(true);
      setDetectionStatus("ACTIVE");
    }
  };

  return (
    <div className="ld-root">
      {/* Animated background */}
      <div className="ld-bg">
        <div className="bg-grid" />
        <div className="bg-radial bg-r1" />
        <div className="bg-radial bg-r2" />
        <div className="bg-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="particle" style={{ "--i": i }} />
          ))}
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <header className="ld-hero">
        <div className="hero-eyebrow">
          <StatusBadge label="LIVE" active={isDetecting} color="red" />
          <StatusBadge label="YOLO ACTIVE" active={isDetecting} color="cyan" />
          <StatusBadge label={cameraReady ? "CAMERA CONNECTED" : "CAMERA OFFLINE"} active={cameraReady} color="green" />
        </div>

        <h1 className="hero-title">
          <span className="title-glow">Live AI</span>{" "}
          <span className="title-outline">Surveillance</span>
        </h1>

        <p className="hero-sub">
          <span className="sub-ticker">
            Real-time YOLOv8 object detection &nbsp;·&nbsp; Neural inference engine &nbsp;·&nbsp; Sub-100ms latency
          </span>
        </p>

        <div className="hero-divider">
          <span className="divider-line" />
          <span className="divider-diamond" />
          <span className="divider-line" />
        </div>
      </header>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <main className="ld-grid">

        {/* Side stats panel */}
        <aside className="stats-panel">
          <div className="stats-header">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 10l3-4 2 3 2-5 3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            SYSTEM TELEMETRY
          </div>

          <StatCard label="Frame Rate" value={fps} unit=" FPS" color="cyan" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          }/>
          <StatCard label="AI Model" value="YOLOv8" color="purple" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
              <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/>
              <line x1="2" y1="15.5" x2="22" y2="15.5"/>
            </svg>
          }/>
          <StatCard label="Detection Status" value={detectionStatus} color={isDetecting ? "green" : "gray"} icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 6l5 5 7-9 7 9 5-5"/>
            </svg>
          }/>
          <StatCard label="Frames Processed" value={frameCount} color="orange" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/>
            </svg>
          }/>
          <StatCard label="Camera" value={cameraReady ? "ONLINE" : "OFFLINE"} color={cameraReady ? "green" : "red"} icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          }/>

          {/* Control button */}
          <button
            className={`ctrl-btn ${isDetecting ? "ctrl-stop" : "ctrl-start"} ${!cameraReady ? "ctrl-disabled" : ""}`}
            onClick={toggleDetection}
            disabled={!cameraReady}
          >
            <span className="ctrl-btn-glow" />
            <span className="ctrl-btn-icon">
              {isDetecting ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </span>
            {isDetecting ? "STOP DETECTION" : "START DETECTION"}
          </button>

          <div className="panel-footer">
            <span>SkyVision AI</span>
            <span className="pf-dot" />
            <span>v2.0</span>
          </div>
        </aside>

        {/* Feed panels */}
        <div className="feeds-area">

          {/* Webcam feed */}
          <div className="feed-card feed-source">
            <div className="feed-card-header">
              <div className="feed-card-title">
                <span className="fct-dot fct-blue" />
                SOURCE FEED
              </div>
              <div className="feed-card-badges">
                <StatusBadge label={cameraReady ? "LIVE" : "OFFLINE"} active={cameraReady} color="blue" />
              </div>
            </div>

            <ScanFrame className="feed-viewport">
              {!cameraReady && <RadarLoader />}
              <video
                ref={videoRef}
                className="feed-video"
                autoPlay
                playsInline
                muted
                style={{ display: cameraReady ? "block" : "none" }}
              />
              {cameraReady && (
                <div className="feed-overlay-label">
                  <span className="fol-pulse" />
                  RAW INPUT
                </div>
              )}
            </ScanFrame>

            {/* hidden capture canvas */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          {/* Detection output feed */}
          <div className="feed-card feed-detection">
            <div className="feed-card-header">
              <div className="feed-card-title">
                <span className="fct-dot fct-cyan" />
                AI DETECTION FEED
              </div>
              <div className="feed-card-badges">
                <StatusBadge label={isDetecting ? "PROCESSING" : "IDLE"} active={isDetecting} color="cyan" />
              </div>
            </div>

            <ScanFrame className={`feed-viewport ${isDetecting && !detectionFeedReady ? "feed-loading" : ""}`}>
              {isDetecting && !detectionFeedReady && <RadarLoader />}
              {!isDetecting && !detectionFeedReady && (
                <div className="feed-idle-state">
                  <div className="idle-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <p className="idle-text">Awaiting Neural Activation</p>
                  <p className="idle-sub">Press START DETECTION to begin</p>
                </div>
              )}
              <canvas
                ref={detectionCanvasRef}
                className="feed-canvas"
                style={{ display: detectionFeedReady ? "block" : "none" }}
              />
              {detectionFeedReady && (
                <div className="feed-overlay-label feed-overlay-detection">
                  <span className="fol-pulse fol-cyan" />
                  LIVE FEED · YOLOv8
                </div>
              )}
            </ScanFrame>
          </div>

        </div>
      </main>
    </div>
  );
}