"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Stage } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
}

export default function CharacterPage() {
  const [animation, setAnimation] = useState("idle");
  const [character, setCharacter] = useState("/goku_ssj4.glb"); // Model

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">3D Character Viewer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-black/30 rounded-xl overflow-hidden" style={{ height: "70vh" }}>
            <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.6}>
                  <Model url={character} />
                </Stage>
                <OrbitControls 
                  autoRotate
                  enablePan={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 2}
                />
              </Suspense>
            </Canvas>
          </div>

          <div className="space-y-6 p-6 bg-black/30 rounded-xl">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Controls</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setAnimation("idle")}
                  variant={animation === "idle" ? "default" : "outline"}
                  className="w-full"
                >
                  Idle
                </Button>
                <Button 
                  onClick={() => setAnimation("walk")}
                  variant={animation === "walk" ? "default" : "outline"}
                  className="w-full"
                >
                  Walk
                </Button>
                <Button 
                  onClick={() => setAnimation("run")}
                  variant={animation === "run" ? "default" : "outline"}
                  className="w-full"
                >
                  Run
                </Button>
                <Button 
                  onClick={() => setAnimation("jump")}
                  variant={animation === "jump" ? "default" : "outline"}
                  className="w-full"
                >
                  Jump
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Character Selection</h2>
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => setCharacter("/goku_ssj4.glb")}
                  variant={character === "/goku_ssj4.glb" ? "default" : "outline"}
                  className="w-full"
                >
                  Goku
                </Button>
                {/* Add more character options here */}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Click and drag to rotate the view</li>
                <li>Scroll to zoom in/out</li>
                <li>Use the controls to change animations</li>
                <li>Select different characters from the menu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}