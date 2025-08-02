import "./index.css"; // must be at the top
import Hero from "./Hero";
import VideoUpload from "./VideoUpload";


function App() {
  return (
    <div className="bg-[#0A0F2C] text-white">
      <Hero />
      <VideoUpload />
    </div>
  );
}

export default App;
