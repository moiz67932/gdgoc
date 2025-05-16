import React, { useState, useRef, useEffect } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { Group } from "three";
import * as THREE from "three";

interface NPCProps {
  index: number;
  url: string;
  name: string;
  description: string;
  emotionScore?: number;
  lookAtCenter?: boolean;
  isSpeaking?: boolean;
  lastLine?: string;
}

export default function NPC({
  index,
  url,
  name,
  description,
  emotionScore: initialScore = 5, // Default to middle emotion (5)
  lookAtCenter = true,
  isSpeaking = false,
  lastLine,
}: NPCProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);
  const [emotionScore, setEmotionScore] = useState(initialScore);

  // Update emotion score when prop changes
  useEffect(() => {
    setEmotionScore(initialScore);
  }, [initialScore]);

  // Enable shadows on NPC model
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  const radius = 2.15;
  const spreadFactor = 0.9;
  const centerOffset = 2;
  const angle = ((index - centerOffset) * Math.PI) / (6.1 * spreadFactor);
  const x = radius * Math.sin(angle);
  const z = 3.5 - radius * Math.cos(angle);

  // Map emotionScore (1-9) to emoji
  function emojiFor(v: number) {
    switch (v) {
      case 1:
        return "😭"; // devastated
      case 2:
        return "😢"; // sad
      case 3:
        return "🙁"; // upset
      case 4:
        return "😕"; // concerned
      case 5:
        return "😐"; // neutral
      case 6:
        return "🙂"; // content
      case 7:
        return "😊"; // happy
      case 8:
        return "😄"; // delighted
      case 9:
        return "🥰"; // ecstatic
      default:
        return "😐"; // fallback to neutral
    }
  }

  // Calculate color based on emotion (red for negative, green for positive)
  const getEmotionColor = (score: number) => {
    const hue = score <= 5 ? 0 : 120; // Red for 1-5, Green for 6-9
    const saturation = 100;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  let rotationY = 0;
  if (index === 0) rotationY = Math.PI / 2;
  else if (index === 1) rotationY = Math.PI / 4;
  else if (index === 2) rotationY = 0;
  else if (index === 3) rotationY = -Math.PI / 4;
  else if (index === 4) rotationY = -Math.PI / 2;

  return (
    <group
      ref={groupRef}
      name={name}
      userData={{ name, description }}
      position={[x, 0, z]}
      rotation={[0, rotationY, 0]}
    >
      <group position={[0, 0, 0]}>
        <primitive object={scene} scale={0.85} />
      </group>

      <group position={[0, 1.8, 0]}>
        <Html center>
          <div
            className="speaker-dot"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "2px solid #333",
              background: "#fff",
              boxShadow: isSpeaking
                ? "0 0 60px 20px rgba(0,128,255,0.8)"
                : "none",
              animation: isSpeaking
                ? "dotScale 0.8s ease-in-out infinite, glowPulse 0.8s ease-in-out infinite"
                : "none",
            }}
          />
          <style>{`
            @keyframes dotScale {
              0%, 100% { transform: scale(1);   }
              50%      { transform: scale(1.6); }
            }

            @keyframes glowPulse {
              0%, 100% { box-shadow: 0 0 20px  8px rgba(0,128,255,0.7); }
              50%      { box-shadow: 0 0 80px 32px rgba(0,128,255,1);  }
            }
          `}</style>
        </Html>

        {/* Emotion bar and emoji */}
        <Html position={[0, 0.25, 0]} center>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "22px", marginRight: 4 }}>
              {emojiFor(emotionScore)}
            </span>
            <div
              style={{
                width: "60px",
                height: "8px",
                background: "#ccc",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid #333",
                marginLeft: 2,
              }}
            >
              <div
                style={{
                  width: `${((emotionScore - 1) / 8) * 100}%`,
                  height: "100%",
                  backgroundColor: getEmotionColor(emotionScore),
                  transition: "all 0.3s ease-in-out",
                }}
              />
            </div>
          </div>
        </Html>
      </group>

      {/* Talking bubble animation for lastLine, only when speaking */}
      {isSpeaking && lastLine && (
        <Html position={[0, 0.7, 0]} center distanceFactor={10}>
          <div
            className="bg-white/90 text-black px-1.5 py-0.5 rounded-md shadow-md text-[6px] font-[var(--font-poppins)]"
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              width: "120px",
              minHeight: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontWeight: 500,
              letterSpacing: "0.01em",
              lineHeight: "1.2",
              backdropFilter: "blur(4px)",
            }}
          >
            {lastLine}
          </div>
        </Html>
      )}
    </group>
  );
}

// Preload the models
useGLTF.preload("/models/char1.glb");
useGLTF.preload("/models/char2.glb");
useGLTF.preload("/models/char3.glb");
useGLTF.preload("/models/char4.glb");
useGLTF.preload("/models/char5.glb");
