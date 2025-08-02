import React from "react";
import { motion } from "framer-motion";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="h-screen w-full flex items-center justify-center bg-[#0A0F2C] px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold text-white"
        >
          SkyVision AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300"
        >
          Upload your drone footage and let our AI technology track and identify objects with high precision.
        </motion.p>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="inline-block border border-dashed border-gray-400 rounded-xl p-6 bg-white/10 backdrop-blur-md cursor-pointer"
          onClick={() => document.getElementById("video-upload").click()}
        >
          <FaCloudUploadAlt className="mx-auto text-4xl mb-3 text-white" />
          <p className="font-semibold text-white">Upload Drone Video</p>
          <p className="text-sm text-gray-300">MP4, MOV, AVI | Max: 500MB</p>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              console.log(e.target.files[0]);
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
