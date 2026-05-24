import { useState } from "react";

import UploadDetection from "./pages/UploadDetection";
import LiveDetection from "./pages/LiveDetection";

import "./App.css";

function App() {

  const [mode, setMode] = useState("upload");

  return (

    <div>

      {/* ---------------------------------- */}
      {/* Navigation */}
      {/* ---------------------------------- */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          padding: "20px",
        }}
      >

        <button
          onClick={() => setMode("upload")}
        >
          Upload Detection
        </button>

        <button
          onClick={() => setMode("live")}
        >
          Live Detection
        </button>

      </div>

      {/* ---------------------------------- */}
      {/* Page Rendering */}
      {/* ---------------------------------- */}

      {mode === "upload" && <UploadDetection />}

      {mode === "live" && <LiveDetection />}

    </div>
  );
}

export default App;