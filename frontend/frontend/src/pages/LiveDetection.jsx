import { useEffect, useRef, useState } from "react";

function LiveDetection() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);

  const [processedFrame, setProcessedFrame] = useState(null);

  // --------------------------------------------------
  // Start Webcam
  // --------------------------------------------------

  const startWebcam = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {

        videoRef.current.srcObject = stream;

        setIsStreaming(true);
      }

    } catch (error) {

      console.error(error);

      alert("Could not access webcam");

    }
  };

  // --------------------------------------------------
  // Stop Webcam
  // --------------------------------------------------

  const stopWebcam = () => {

    const stream = videoRef.current?.srcObject;

    if (stream) {

      stream.getTracks().forEach(track => track.stop());

      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  };

  // --------------------------------------------------
  // Send Frames To Backend
  // --------------------------------------------------

  const sendFrame = async () => {

    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    // Smaller resolution for speed
    canvas.width = 640;
    canvas.height = 480;

    // Draw current frame
    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert to blob
    canvas.toBlob(async (blob) => {

      if (!blob) return;

      const formData = new FormData();

      formData.append("file", blob, "frame.jpg");

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/detect-frame/",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) return;

        const imageBlob = await response.blob();

        const imageUrl = URL.createObjectURL(imageBlob);

        setProcessedFrame(imageUrl);

      } catch (error) {

        console.error("Detection error:", error);

      }

    }, "image/jpeg");

  };

  // --------------------------------------------------
  // Real-Time Loop
  // --------------------------------------------------

  useEffect(() => {

    let interval;

    if (isStreaming) {

      interval = setInterval(() => {

        sendFrame();

      }, 300);

    }

    return () => {

      if (interval) clearInterval(interval);

    };

  }, [isStreaming]);

  // --------------------------------------------------
  // Cleanup
  // --------------------------------------------------

  useEffect(() => {

    return () => {
      stopWebcam();
    };

  }, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div className="app">

      {/* Background */}

      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* Hero */}

      <div
        style={{
          textAlign: "center",
          paddingTop: "40px",
        }}
      >

        <h1
          style={{
            fontSize: "3rem",
            color: "white",
          }}
        >
          Live AI Detection
        </h1>

        <p
          style={{
            color: "#aaa",
            marginTop: "10px",
          }}
        >
          Real-time object detection using YOLOv8
        </p>

      </div>

      {/* Main Grid */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          padding: "40px",
        }}
      >

        {/* Webcam Feed */}

        <div
          style={{
            background: "#111827",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #333",
          }}
        >

          <h2 style={{ color: "white" }}>
            Webcam Feed
          </h2>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              borderRadius: "20px",
              marginTop: "20px",
            }}
          />

        </div>

        {/* AI Detection */}

        <div
          style={{
            background: "#111827",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #333",
          }}
        >

          <h2 style={{ color: "white" }}>
            AI Detection
          </h2>

          {processedFrame ? (

            <img
              src={processedFrame}
              alt="Processed"
              style={{
                width: "100%",
                borderRadius: "20px",
                marginTop: "20px",
              }}
            />

          ) : (

            <div
              style={{
                height: "480px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#777",
              }}
            >
              Waiting for detections...
            </div>

          )}

        </div>

      </div>

      {/* Hidden Canvas */}

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      {/* Controls */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          paddingBottom: "40px",
        }}
      >

        {!isStreaming ? (

          <button
            className="btn-primary"
            onClick={startWebcam}
          >
            Start Live Detection
          </button>

        ) : (

          <button
            className="btn-primary"
            onClick={stopWebcam}
          >
            Stop Detection
          </button>

        )}

      </div>

    </div>
  );
}

export default LiveDetection;