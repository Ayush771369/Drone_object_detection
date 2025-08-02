import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function VideoUpload() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/detect/", formData, {
        responseType: "blob",
      });

      const blob = response.data;
      const url = URL.createObjectURL(blob);
      setVideoUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return url;
      });
    } catch (err) {
      alert("Error uploading or processing video");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-[#0A0F2C] text-center px-4 text-white">
      <motion.h2
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        Process Your Drone Video
      </motion.h2>

      <div className="flex flex-col md:flex-row justify-center items-start md:items-center gap-12">
        {/* Upload Card */}
        <motion.div
          className="bg-[#1a1f3c]/50 backdrop-blur-md p-8 rounded-xl border border-gray-600 w-[300px] shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h3 className="font-semibold text-lg mb-4">1. Upload Video</h3>
          <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
            <FaCloudUploadAlt className="text-4xl text-cyan-400 mb-2" />
            <p className="text-sm text-gray-400 mb-4">Click to browse</p>
            <div className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-md text-white font-medium">
              Select Video File
            </div>
            <p className="mt-4 text-xs text-gray-500">
              MP4, MOV, AVI | Max: 500MB
            </p>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </motion.div>

        {/* Output Player */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h3 className="font-semibold text-lg mb-4">2. AI Processing</h3>
          {loading && (
            <p className="text-cyan-400 text-sm font-medium mb-4 animate-pulse">
              Processing your video...
            </p>
          )}
          {videoUrl && (
            <video width="640" height="360" controls autoPlay className="rounded-xl shadow-md">
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
          {!loading && !videoUrl && (
            <p className="text-gray-400 max-w-sm text-sm">
              Your video will appear here after processing.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
