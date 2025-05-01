import React, { useState, useRef } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { Group } from "three";

interface NPCProps {
  index: number;
  url: string;
  name: string;
  description: string;
  emotionScore?: number;
}

export default function NPC({
  index,
  url,
  name,
  description,
  emotionScore: initialScore = 0.5,
}: NPCProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);
  const [emotionScore] = useState(initialScore);

  const radius = 3.15;
  const spreadFactor = 1.1;
  const centerOffset = 2;
  const angle = ((index - centerOffset) * Math.PI) / (6.1 * spreadFactor);
  const x = radius * Math.sin(angle);
  const z = 3.5 - radius * Math.cos(angle);

  const color = `hsl(${emotionScore * 120}, 100%, 50%)`;

  let moodEmoji = "😐";
  if (emotionScore < 0.2) moodEmoji = "😡";
  else if (emotionScore < 0.5) moodEmoji = "😟";
  else if (emotionScore < 0.75) moodEmoji = "🙂";
  else moodEmoji = "😄";

  return (
    <group
      ref={groupRef}
      name={name} // Needed for raycast detection
      userData={{ name, description }} // store description
      position={[x, 0, z]}
      rotation={[0, -angle, 0]}
    >
      <group position={[0, 0, 0]}>
        <primitive object={scene} scale={0.85} />
      </group>

      <group position={[0, 1.6, 0]}>
        <Html center>
          <div
            style={{
              width: "16px",
              height: "16px",
              background: "white",
              borderRadius: "50%",
              border: "2px solid #333",
            }}
          />
        </Html>

        <Html position={[0, 0.2, 0]} center>
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
              }}
            />
          </div>
        </Html>

        <Html position={[0, 0.4, 0]} center>
          <div style={{ fontSize: "24px" }}>{moodEmoji}</div>
        </Html>
      </group>
    </group>
  );
}

useGLTF.preload("/models/char1.glb");
useGLTF.preload("/models/char2.glb");
useGLTF.preload("/models/char3.glb");
useGLTF.preload("/models/char4.glb");
useGLTF.preload("/models/char5.glb");
