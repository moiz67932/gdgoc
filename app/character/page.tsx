"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import React, { Suspense } from "react";
import NPC from "./component/NPC";

const CHARACTER_COUNT = 5;
const characterFiles = [
  "/models/char1.glb",
  "/models/char2.glb",
  "/models/char3.glb",
  "/models/char4.glb",
  "/models/char5.glb",
];

function Character({ index, url }: { index: number; url: string }) {
  const { scene } = useGLTF(url);

  const radius = 3.15; // Decreased the radius to bring characters closer
  const spreadFactor = 1.1; // Decreased spread factor for tighter spacing

  // Inward arc, bulged in — CENTER starts back at z = 3.5, others come forward
  const centerOffset = (CHARACTER_COUNT - 1) / 2;
  const angle =
    ((index - centerOffset) * Math.PI) / (CHARACTER_COUNT * spreadFactor);

  // Pull all characters slightly toward the center (negative Z)
  const x = radius * Math.sin(angle);
  const z = 3.5 - radius * Math.cos(angle); // Center pulled back

  return (
    <primitive
      object={scene}
      position={[x, 0, z]}
      scale={0.85}
      rotation={[0, -angle, 0]} // Face center
    />
  );
}

export default function CharacterScene() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 2, 10], fov: 25 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          {characterFiles.map((url, i) => (
            <NPC
              key={i}
              index={i}
              url={url}
              isSpeaking={i === 1}
              emotionScore={i * 0.25}
            />
          ))}
        </Suspense>

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#dcdcdc" />
        </mesh>

        {/* Orbit Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={true} // Allow vertical and horizontal movement
          minAzimuthAngle={-Math.PI / 4.5} // -40°
          maxAzimuthAngle={Math.PI / 4.5} // +40°
          minPolarAngle={Math.PI / 2 - (25 * Math.PI) / 180} // 25° up
          maxPolarAngle={Math.PI / 2 - (5 * Math.PI) / 180} // 5° down
        />
      </Canvas>
    </div>
  );
}

// "use client";

// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, useGLTF } from "@react-three/drei";
// import React, { Suspense } from "react";

// const CHARACTER_COUNT = 5;
// const characterFiles = [
//   "/models/char1.glb",
//   "/models/char2.glb",
//   "/models/char3.glb",
//   "/models/char4.glb",
//   "/models/char5.glb",
// ];

// function Character({ index, url }: { index: number; url: string }) {
//   const { scene } = useGLTF(url);

//   const radius = 3.15; // Decreased the radius to bring characters closer
//   const spreadFactor = 1.1; // Decreased spread factor for tighter spacing

//   // Inward arc, bulged in — CENTER starts back at z = 3.5, others come forward
//   const centerOffset = (CHARACTER_COUNT - 1) / 2;
//   const angle =
//     ((index - centerOffset) * Math.PI) / (CHARACTER_COUNT * spreadFactor);

//   // Pull all characters slightly toward the center (negative Z)
//   const x = radius * Math.sin(angle);
//   const z = 3.5 - radius * Math.cos(angle); // Center pulled back

//   return (
//     <primitive
//       object={scene}
//       position={[x, 0, z]}
//       scale={0.85}
//       rotation={[0, -angle, 0]} // Face center
//     />
//   );
// }

// export default function CharacterScene() {
//   return (
//     <div className="w-screen h-screen">
//       <Canvas camera={{ position: [0, 2, 10], fov: 25 }}>
//         <ambientLight intensity={0.5} />
//         <directionalLight position={[5, 5, 5]} intensity={1} />

//         <Suspense fallback={null}>
//           {characterFiles.map((url, i) => (
//             <Character key={i} index={i} url={url} />
//           ))}
//         </Suspense>

//         {/* Ground */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
//           <planeGeometry args={[30, 30]} />
//           <meshStandardMaterial color="#dcdcdc" />
//         </mesh>

//         {/* Orbit Controls */}
//         <OrbitControls
//           enableZoom={false}
//           enablePan={true} // Allow vertical and horizontal movement
//           minAzimuthAngle={-Math.PI / 4.5} // -40°
//           maxAzimuthAngle={Math.PI / 4.5} // +40°
//           minPolarAngle={Math.PI / 2 - (25 * Math.PI) / 180} // 25° up
//           maxPolarAngle={Math.PI / 2 - (5 * Math.PI) / 180} // 5° down
//         />
//       </Canvas>
//     </div>
//   );
// }
