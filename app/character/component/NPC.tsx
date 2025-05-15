// import React, { useState, useRef, useEffect } from "react";
// import { useGLTF, Html } from "@react-three/drei";
// import { Group } from "three";
// import * as THREE from "three";

// interface NPCProps {
//   index: number;
//   url: string;
//   name: string;
//   description: string;
//   emotionScore?: number;
//   lookAtCenter?: boolean;
//   isSpeaking?: boolean;
// }

// export default function NPC({
//   index,
//   url,
//   name,
//   description,
//   emotionScore: initialScore = 0.5,
//   lookAtCenter = true,
//   isSpeaking = false,
// }: NPCProps) {
//   const { scene } = useGLTF(url);
//   const groupRef = useRef<Group>(null);
//   const [emotionScore] = useState(initialScore);

//   // Enable shadows on NPC model
//   useEffect(() => {
//     scene.traverse((child) => {
//       if ((child as THREE.Mesh).isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = true;
//       }
//     });
//   }, [scene]);

//   const radius = 2.15;
//   const spreadFactor = 0.9;
//   const centerOffset = 2;
//   const angle = ((index - centerOffset) * Math.PI) / (6.1 * spreadFactor);
//   const x = radius * Math.sin(angle);
//   const z = 3.5 - radius * Math.cos(angle);

//   const color = `hsl(${emotionScore * 120}, 100%, 50%)`;

//   let moodEmoji = "😐";
//   if (emotionScore < 0.2) moodEmoji = "😡";
//   else if (emotionScore < 0.5) moodEmoji = "😟";
//   else if (emotionScore < 0.75) moodEmoji = "🙂";
//   else moodEmoji = "😄";

//   let rotationY = 0;
//   if (index === 0) rotationY = Math.PI / 2;
//   else if (index === 1) rotationY = Math.PI / 4;
//   else if (index === 2) rotationY = 0;
//   else if (index === 3) rotationY = -Math.PI / 4;
//   else if (index === 4) rotationY = -Math.PI / 2;

//   return (
//     <group
//       ref={groupRef}
//       name={name}
//       userData={{ name, description }}
//       position={[x, 0, z]}
//       rotation={[0, rotationY, 0]}
//     >
//       <group position={[0, 0, 0]}>
//         <primitive object={scene} scale={0.85} />
//       </group>

//       <group position={[0, 1.8, 0]}>
//         <Html center>
//           <div
//             className="speaker-dot"
//             style={{
//               width: 20, // base size (px)
//               height: 20,
//               borderRadius: "50%",
//               border: "2px solid #333",
//               background: "#fff",
//               /* start with no glow; the animation adds it */
//               boxShadow: isSpeaking
//                 ? "0 0 60px 20px rgba(0,128,255,0.8)"
//                 : "none",
//               animation: isSpeaking
//                 ? "dotScale 0.8s ease-in-out infinite, glowPulse 0.8s ease-in-out infinite"
//                 : "none",
//             }}
//           />

//           <style>{`
//     /* scale the dot itself */
//     @keyframes dotScale {
//       0%, 100% { transform: scale(1);   }
//       50%      { transform: scale(1.6); }
//     }

//     /* amplify the blue halo */
//     @keyframes glowPulse {
//       0%, 100% { box-shadow: 0 0 20px  8px rgba(0,128,255,0.7); }
//       50%      { box-shadow: 0 0 80px 32px rgba(0,128,255,1);  }
//     }
//   `}</style>
//         </Html>

//         <Html position={[0, 0.2, 0]} center>
//           <div
//             style={{
//               width: "60px",
//               height: "8px",
//               background: "#ccc",
//               borderRadius: "4px",
//               overflow: "hidden",
//               border: "1px solid #333",
//             }}
//           >
//             <div
//               style={{
//                 width: `${emotionScore * 100}%`,
//                 height: "100%",
//                 backgroundColor: color,
//               }}
//             />
//           </div>
//         </Html>

//         <Html position={[0, 0.3, 0]} center>
//           <div style={{ fontSize: "24px" }}>{moodEmoji}</div>
//         </Html>
//       </group>
//     </group>
//   );
// }

// // Preload the models
// useGLTF.preload("/models/char1.glb");
// useGLTF.preload("/models/char2.glb");
// useGLTF.preload("/models/char3.glb");
// useGLTF.preload("/models/char4.glb");
// useGLTF.preload("/models/char5.glb");

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
}

export default function NPC({
  index,
  url,
  name,
  description,
  emotionScore: initialScore = 0.5,
  lookAtCenter = true,
  isSpeaking = false,
}: NPCProps) {
  // Safeguard if url is undefined or incorrect
  const modelUrl = url || "";
  const { scene } = useGLTF(modelUrl);

  const groupRef = useRef<Group>(null);
  const [emotionScore] = useState(initialScore);

  // Enable shadows on NPC model
  useEffect(() => {
    if (!scene) {
      console.error("Failed to load model at", modelUrl);
      return;
    }

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, modelUrl]);

  const radius = 2.15;
  const spreadFactor = 0.9;
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

        <Html position={[0, 0.3, 0]} center>
          <div style={{ fontSize: "24px" }}>{moodEmoji}</div>
        </Html>
      </group>
    </group>
  );
}

// Preload the models
useGLTF.preload("/models/char1.glb");
useGLTF.preload("/models/char2.glb");
useGLTF.preload("/models/char3.glb");
useGLTF.preload("/models/char4.glb");
useGLTF.preload("/models/char5.glb");
