"use client";

import React, { Suspense, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import NPC from "./component/NPC";
import Room from "./component/Room";

const characterData = [
  { url: "/models/char1.glb", name: "Alice", description: "Team Leader" },
  { url: "/models/char2.glb", name: "Bob", description: "Engineer" },
  { url: "/models/char3.glb", name: "Charlie", description: "Designer" },
  { url: "/models/char4.glb", name: "Diana", description: "Analyst" },
  { url: "/models/char5.glb", name: "Eve", description: "Strategist" },
];

function RaycastSelector({
  setSelected,
}: {
  setSelected: (data: any) => void;
}) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = new THREE.Vector2(0, 0); // center of screen

  const handleClick = () => {
    raycaster.current.setFromCamera(mouse, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const intersect of intersects) {
      let current: THREE.Object3D | null = intersect.object;
      while (current) {
        if (current.userData?.name && current.userData?.description) {
          setSelected({
            name: current.userData.name,
            description: current.userData.description,
          });
          return;
        }
        current = current.parent;
      }
    }

    setSelected(null);
  };

  React.useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return null;
}

export default function CharacterScene() {
  const [selectedCharacter, setSelectedCharacter] = useState<null | {
    name: string;
    description: string;
  }>(null);

  return (
    <div className="w-screen h-screen relative">
      <Canvas camera={{ position: [0, 1.6, 4.5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          <Room />
          {characterData.map((char, i) => (
            <NPC
              key={i}
              index={i}
              url={char.url}
              name={char.name}
              description={char.description}
              emotionScore={i * 0.25}
            />
          ))}
        </Suspense>

        <PointerLockControls />
        <RaycastSelector setSelected={setSelectedCharacter} />
      </Canvas>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* Selected Character Card */}
      {selectedCharacter && (
        <div className="absolute top-4 left-4 bg-white/30 backdrop-blur p-4 rounded-md border border-white/50 text-white shadow-lg w-64 z-50">
          <h2 className="font-bold text-lg">{selectedCharacter.name}</h2>
          <p className="text-sm">{selectedCharacter.description}</p>
        </div>
      )}
    </div>
  );
}
