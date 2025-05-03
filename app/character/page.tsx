"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { PerspectiveCamera } from "three";
import * as THREE from "three";
import NPC from "./component/NPC";
import Room from "./component/Room";

const characterData = [
  {
    url: "/models/char1.glb",
    name: "Alice",
    description: "Team Leader",
    audio: "/audio/char1.mp3",
  },
  {
    url: "/models/char2.glb",
    name: "Bob",
    description: "Engineer",
    audio: "/audio/char2.mp3",
  },
  {
    url: "/models/char3.glb",
    name: "Charlie",
    description: "Designer",
    audio: "/audio/char3.mp3",
  },
  {
    url: "/models/char4.glb",
    name: "Diana",
    description: "Analyst",
    audio: "/audio/char4.mp3",
  },
  {
    url: "/models/char5.glb",
    name: "Eve",
    description: "Strategist",
    audio: "/audio/char5.mp3",
  },
];

type CharacterInfo = {
  name: string;
  description: string;
};

export function RaycastSelector({
  setSelected,
  setHovered,
  setSpeakingCharacter,
}: {
  setSelected: (data: any) => void;
  setHovered: (data: any) => void;
  setSpeakingCharacter: (name: string | null) => void;
}) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = new THREE.Vector2(0, 0); // Center of screen

  useFrame(() => {
    raycaster.current.setFromCamera(mouse, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const intersect of intersects) {
      let current: THREE.Object3D | null = intersect.object;
      while (current) {
        if (current.userData?.name && current.userData?.description) {
          setHovered({
            name: current.userData.name,
            description: current.userData.description,
          });
          return;
        }
        current = current.parent;
      }
    }
    setHovered(null);
  });

  useEffect(() => {
    const handleClick = () => {
      raycaster.current.setFromCamera(mouse, camera);
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );

      for (const intersect of intersects) {
        let current: THREE.Object3D | null = intersect.object;
        while (current) {
          if (current.userData?.name && current.userData?.description) {
            const matchedCharacter = characterData.find(
              (char) => char.name === current?.userData?.name
            );

            if (matchedCharacter) {
              const audio = new Audio(matchedCharacter.audio);
              audio.play();
              setSpeakingCharacter(matchedCharacter.name);
              setSelected({
                name: current.userData.name,
                description: current.userData.description,
              });

              // Reset speaking character after audio ends
              audio.addEventListener("ended", () => {
                setSpeakingCharacter(null);
              });

              return;
            }
          }
          current = current.parent;
        }
      }

      setSelected(null);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return null;
}

function RightClickZoom() {
  const { camera } = useThree();
  const perspectiveCamera = camera as PerspectiveCamera; // Type assertion

  const targetFov = useRef(perspectiveCamera.fov);
  const zoomedFov = 30;
  const normalFov = 75;
  const isRightMouseDown = useRef(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) isRightMouseDown.current = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) isRightMouseDown.current = false;
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useFrame(() => {
    targetFov.current = isRightMouseDown.current ? zoomedFov : normalFov;
    perspectiveCamera.fov += (targetFov.current - perspectiveCamera.fov) * 0.1;
    perspectiveCamera.updateProjectionMatrix();
  });

  return null;
}

export default function CharacterScene() {
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterInfo | null>(null);
  const [hoveredCharacter, setHoveredCharacter] =
    useState<CharacterInfo | null>(null);
  const [speakingCharacter, setSpeakingCharacter] = useState<string | null>(
    null
  );

  return (
    <div className="w-screen h-screen relative">
      <Canvas
        camera={{ position: [0, 1.3, 3], fov: 75, near: 0.05 }}
        style={{ background: "#87ceeb" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

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
              lookAtCenter
              isSpeaking={char.name === speakingCharacter}
            />
          ))}
        </Suspense>

        <PointerLockControls />
        <RaycastSelector
          setSelected={setSelectedCharacter}
          setHovered={setHoveredCharacter}
          setSpeakingCharacter={setSpeakingCharacter}
        />
        <RightClickZoom />
      </Canvas>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* Info Card (either hover or click) */}
      {(selectedCharacter || hoveredCharacter) && (
        <div className="absolute top-4 left-4 bg-white/30 backdrop-blur p-4 rounded-md border border-white/50 text-white shadow-lg w-64 z-50">
          <h2 className="font-bold text-lg">
            {(selectedCharacter || hoveredCharacter)?.name}
          </h2>
          <p className="text-sm">
            {(selectedCharacter || hoveredCharacter)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
