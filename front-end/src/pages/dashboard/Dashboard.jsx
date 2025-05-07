"use client";
import React, { useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";

const DashboardHome = () => {
  const [particlesInit, setParticlesInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  return (
    <motion.div
      className="h-full w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {particlesInit && (
        <Particles
          id="particles-js"
          className="absolute inset-0 -z-10"
          options={{
            background: { color: { value: "transparent" } },
            fullScreen: { enable: false, zIndex: -1 },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 100, duration: 0.4 },
              },
            },
            particles: {
              color: { value: "#3b82f6" },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: false,
                speed: 1,
                straight: false,
              },
              number: { density: { enable: true, area: 800 }, value: 80 },
              opacity: { value: 0.5 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
        />
      )}
      <div className="relative z-10 h-full w-full flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-semibold text-gray-100 mb-4 tracking-wide">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-400 text-lg">
            Select a feature from the sidebar to get started
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
