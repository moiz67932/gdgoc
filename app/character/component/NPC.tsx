import React, { useState, useEffect } from "react";
import { useGLTF, Html } from "@react-three/drei";

interface NPCProps {
  index: number;
  url: string;
  isSpeaking?: boolean;
  emotionScore?: number;
}

export default function NPC({
  index,
  url,
  isSpeaking: initialSpeaking = false,
  emotionScore: initialScore = 0.5,
}: NPCProps) {
  const { scene } = useGLTF(url);
  const [audio] = useState(() => new Audio("/audio/char1.mp3"));
  const [isSpeaking, setIsSpeaking] = useState(initialSpeaking);
  const [emotionScore, setEmotionScore] = useState(initialScore);

  useEffect(() => {
    // Reset speaking status when audio ends
    const handleEnded = () => setIsSpeaking(false);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audio]);

  const radius = 3.15;
  const spreadFactor = 1.1;
  const centerOffset = 2;
  const angle = ((index - centerOffset) * Math.PI) / (5 * spreadFactor);
  const x = radius * Math.sin(angle);
  const z = 3.5 - radius * Math.cos(angle);

  const color = `hsl(${emotionScore * 120}, 100%, 50%)`;

  let moodEmoji = "😐";
  if (emotionScore < 0.2) moodEmoji = "😡";
  else if (emotionScore < 0.5) moodEmoji = "😟";
  else if (emotionScore < 0.75) moodEmoji = "🙂";
  else moodEmoji = "😄";

  const handleClick = () => {
    setIsSpeaking(true); // always set to true on click
    const newScore = Math.random();
    setEmotionScore(newScore);
    audio.currentTime = 0;
    audio.play();
  };

  return (
    <group
      position={[x, 0, z]}
      rotation={[0, -angle, 0]}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
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
            transform: isSpeaking ? "scale(1.5)" : "scale(1)",
            boxShadow: isSpeaking ? "0 0 10px #00f" : "none",
            transition: "all 0.3s ease",
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
              transition: "all 0.5s ease",
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
