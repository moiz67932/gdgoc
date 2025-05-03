"use client";
import React from "react";

import { useGLTF } from "@react-three/drei";

export default function Room() {
  const { scene } = useGLTF("/models/landscape.glb");

  return <primitive object={scene} scale={1.5} position={[-3, -2, -2]} />;
}
