// "use client";
// import React from "react";

// import { useGLTF } from "@react-three/drei";

// export default function Room() {
//   const { scene } = useGLTF("/models/landscape5.glb");

//   return <primitive object={scene} scale={1.5} position={[-3, -2, -2]} />;
// }

"use client";
import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Room() {
  // const { scene } = useGLTF("/models/landscape2.glb");
  const { scene } = useGLTF("/models/landscape5.glb");

  // Enable all meshes in the model to receive and cast shadows
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <primitive
      object={scene}
      scale={0.85}
      position={[-12, -0.15, -4]}
      rotation={[0, 80, 0]}
    />
  );
}
