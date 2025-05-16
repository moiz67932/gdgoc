import React, { useEffect, useRef } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { Group } from "three";
import * as THREE from "three";

interface NPCProps {
  index: number;
  url: string;
  name: string;
  description: string;
  /** Raw score 1 – 10 (1 = calm, 10 = upset) */
  emotionScore?: number;
  isSpeaking?: boolean;
  lastLine?: string;
}

/* ───────────── helpers ───────────── */

const clamp     = (v: number) => Math.min(Math.max(v, 1), 10);
const normalise = (v: number) => (11 - clamp(v)) / 10;   // 1 → 1.0, 10 → 0.0

const emojiFor = (v: number): string => {
  if (v <= 1) return "😄";
  if (v <= 2) return "😊";
  if (v <= 3) return "🙂";
  if (v <= 4) return "😐";
  if (v <= 5) return "😕";
  if (v <= 6) return "😟";
  if (v <= 7) return "🙁";
  if (v <= 8) return "😢";
  if (v <= 9) return "😠";
  return "😭";
};

/* ───────────── component ─────────── */

export default function NPC({
  index,
  url,
  name,
  description,
  emotionScore = 5,
  isSpeaking = false,
  lastLine,
}: NPCProps) {
  const { scene } = useGLTF(url);
  const groupRef  = useRef<Group>(null);

  /* enable shadows on every mesh in the GLB */
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  /* ring-layout positioning (unchanged) */
  const radius       = 2.15;
  const spreadFactor = 0.9;
  const centerOffset = 2;
  const angle        = ((index - centerOffset) * Math.PI) / (6.1 * spreadFactor);
  const x            = radius * Math.sin(angle);
  const z            = 3.5 - radius * Math.cos(angle);

  /* static yaw so everyone faces the user/camera */
  const rotations = [Math.PI / 2, Math.PI / 4, 0, -Math.PI / 4, -Math.PI / 2];
  const rotationY = rotations[index] ?? 0;

  /* bar colour – green when calm, red when upset */
  const barHue   = normalise(emotionScore) * 120; // 0 red → 120 green
  const barColor = `hsl(${barHue},100%,50%)`;

  return (
    <group
      ref={groupRef}
      name={name}
      userData={{ name, description }}
      position={[x, 0, z]}
      rotation={[0, rotationY, 0]}
    >
      {/* avatar model */}
      <primitive object={scene} scale={0.85} />

      {/* pulsing dot while speaking */}
      <Html center position={[0, 1.8, 0]}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid #333",
            background: "#fff",
            boxShadow: isSpeaking ? "0 0 60px 20px rgba(0,128,255,0.8)" : "none",
            animation: isSpeaking
              ? "dotScale 0.8s ease-in-out infinite, glowPulse 0.8s ease-in-out infinite"
              : "none",
          }}
        />
        <style>{`
          @keyframes dotScale { 0%,100%{transform:scale(1);} 50%{transform:scale(1.6);} }
          @keyframes glowPulse{
            0%,100%{box-shadow:0 0 20px 8px rgba(0,128,255,0.7);}
            50%    {box-shadow:0 0 80px 32px rgba(0,128,255,1);}
          }
        `}</style>
      </Html>

      {/* emoji + emotion bar */}
      <Html center position={[0, 0.25, 0]}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 22 }}>{emojiFor(emotionScore)}</span>
          <div
            style={{
              width: 60,
              height: 8,
              background: "#ccc",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                width: `${normalise(emotionScore) * 100}%`,
                height: "100%",
                backgroundColor: barColor,
                transition: "width 0.25s",
              }}
            />
          </div>
        </div>
      </Html>

      {/* speech bubble (only while speaking) */}
      {isSpeaking && lastLine && (
        <Html center position={[0, 0.7, 0]} distanceFactor={10}>
          <div
            className="bg-white/90 text-black px-1.5 py-0.5 rounded-md shadow-md text-[6px]"
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              width: 120,
              minHeight: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontWeight: 500,
              letterSpacing: "0.01em",
              lineHeight: 1.2,
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

/* preload GLBs */
useGLTF.preload("/models/char1.glb");
useGLTF.preload("/models/char2.glb");
useGLTF.preload("/models/char3.glb");
useGLTF.preload("/models/char4.glb");
useGLTF.preload("/models/char5.glb");
