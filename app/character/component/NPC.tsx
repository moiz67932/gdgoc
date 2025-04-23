"use client";

import React from "react";
import { useGLTF, Html } from "@react-three/drei";

interface NPCProps {
  index: number;
  url: string;
  isSpeaking: boolean;
  emotionScore: number; // Range: 0 = angry (red), 1 = happy (green)
}

export default function NPC({
  index,
  url,
  isSpeaking,
  emotionScore,
}: NPCProps) {
  const { scene } = useGLTF(url);

  const radius = 3.15;
  const spreadFactor = 1.1;
  const centerOffset = 2;
  const angle = ((index - centerOffset) * Math.PI) / (5 * spreadFactor);

  const x = radius * Math.sin(angle);
  const z = 3.5 - radius * Math.cos(angle);

  const color = `hsl(${emotionScore * 120}, 100%, 50%)`;

  // Determine emoji based on emotionScore
  let moodEmoji = "😐";
  if (emotionScore < 0.2) {
    moodEmoji = "😡";
  } else if (emotionScore < 0.5) {
    moodEmoji = "😟";
  } else if (emotionScore < 0.75) {
    moodEmoji = "🙂";
  } else {
    moodEmoji = "😄";
  }

  return (
    <group position={[x, 0, z]} rotation={[0, -angle, 0]}>
      {/* Character model */}
      <primitive object={scene} scale={0.85} />

      {/* Speaker Icon */}
      <Html position={[0, 1.7, 0]} center>
        <div
          style={{
            width: "16px",
            height: "16px",
            background: "white",
            borderRadius: "50%",
            border: "2px solid #333",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            transform: isSpeaking ? "scale(1.5)" : "scale(1)",
            boxShadow: isSpeaking ? "0 0 10px #00f" : "none",
          }}
        />
      </Html>

      {/* Emotion Bar */}
      <Html position={[0, 1.9, 0]} center>
        <div
          style={{
            width: "60px",
            height: "8px",
            background: "#ccc",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #333",
          }}
        >
          <div
            style={{
              width: `${emotionScore * 100}%`,
              height: "100%",
              backgroundColor: color,
              transition: "width 0.5s ease, background-color 0.5s ease",
            }}
          />
        </div>
      </Html>

      {/* Emoji Bubble */}
      <Html position={[0, 2.2, 0]} center>
        <div style={{ fontSize: "24px", transition: "0.3s ease" }}>
          {moodEmoji}
        </div>
      </Html>
    </group>
  );
}
