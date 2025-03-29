"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  Stage,
  PerspectiveCamera,
  Html,
  useProgress,
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCw, Info } from "lucide-react";
import * as THREE from "three";

// Loading component for 3D models
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin mb-2" />
        <p className="text-sm font-medium">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

// Character model with animations
interface ModelProps {
  url: string;
  animation: string;
}

function Model({ url, animation }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, group);

  // Apply animation when it changes
  useEffect(() => {
    if (!actions || !animation || !mixer) return;

    // Stop all current animations
    mixer.stopAllAction();

    // Find the best matching animation
    let action = actions[animation];

    // If exact match not found, try partial match
    if (!action) {
      const actionName = Object.keys(actions).find((name) =>
        name.toLowerCase().includes(animation.toLowerCase())
      );
      if (actionName) action = actions[actionName];
    }

    // If we found an animation, play it with crossfading
    if (action) {
      // Cross fade between animations for smoother transitions
      action
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.2)
        .play();

      // Add looping for continuous animations
      if (animation !== "idle") {
        action.loop = THREE.LoopRepeat;
      } else {
        action.loop = THREE.LoopOnce;
      }
    } else {
      console.warn(`No animation found for: ${animation}`);
    }

    return () => {
      if (action) {
        action.fadeOut(0.2);
      }
      mixer.stopAllAction();
    };
  }, [animation, actions, mixer]);

  // Update mixer in animation frame
  useEffect(() => {
    let animationFrameId: number;

    const animate = (time: number) => {
      mixer?.update(0.01);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mixer]);

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={2}
        position={[0, -1, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

// Available characters
const characters = [
  { id: "goku", name: "Goku SSJ4", url: "/goku_ssj4.glb" },
  { id: "vegeta", name: "Vegeta", url: "/vegeta.glb" },
  { id: "naruto", name: "Naruto", url: "/naruto.glb" },
  { id: "luffy", name: "Luffy", url: "/luffy.glb" },
] as const;

type AnimationState = "idle" | "walk" | "run" | "jump";

export default function CharacterPage() {
  const [animation, setAnimation] = useState<AnimationState>("idle");
  const [character, setCharacter] = useState<string>(characters[0].url);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("controls");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                3D Character Viewer
              </h1>
              <p className="text-gray-300 mt-2">
                Explore and animate 3D characters with interactive controls
              </p>
            </div>
            <Badge
              variant="outline"
              className="px-3 py-1 border-purple-500 bg-purple-500/10"
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Interactive Demo
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card
            className="lg:col-span-2 bg-black/40 border-purple-800/50 overflow-hidden rounded-xl"
            style={{ height: "70vh" }}
          >
            <CardContent className="p-0 h-full">
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={45} />
                <color attach="background" args={["#000000"]} />

                <Suspense fallback={<Loader />}>
                  <Stage environment="city" intensity={0.6}>
                    <Model url={character} animation={animation} />
                  </Stage>
                  <OrbitControls
                    autoRotate={autoRotate}
                    autoRotateSpeed={1}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                  />
                </Suspense>
              </Canvas>

              <div className="absolute bottom-4 right-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="bg-black/50 border-purple-500/50 hover:bg-purple-900/50"
                >
                  <RotateCw
                    className={`h-4 w-4 ${
                      autoRotate
                        ? "text-purple-400 animate-spin"
                        : "text-gray-400"
                    }`}
                  />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-black/40 border-purple-800/50 rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <Tabs
                  defaultValue="controls"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-3 bg-black/60">
                    {/* <TabsTrigger value="controls">Animations</TabsTrigger> */}
                    <TabsTrigger value="characters">Characters</TabsTrigger>
                    <TabsTrigger value="info">Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="controls" className="p-6 space-y-4">
                    {/* <h2 className="text-2xl font-semibold mb-4 text-purple-300">Animation Controls</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {(["idle", "walk", "run", "jump"] as AnimationState[]).map((anim) => (
                        <Button
                          key={anim}
                          onClick={() => setAnimation(anim)}
                          variant={animation === anim ? "default" : "outline"}
                          className={
                            animation === anim
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "border-purple-500/50 hover:bg-purple-900/50"
                          }
                        >
                          {anim.charAt(0).toUpperCase() + anim.slice(1)}
                        </Button>
                      ))}
                    </div> */}

                    <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <p className="text-sm text-purple-200">
                        <Info className="inline h-4 w-4 mr-2" />
                        Currently playing:{" "}
                        <span className="font-bold">
                          {animation.toUpperCase()}
                        </span>{" "}
                        animation
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="characters" className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-300">
                      Character Selection
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {characters.map((char) => (
                        <Button
                          key={char.id}
                          onClick={() => setCharacter(char.url)}
                          variant={
                            character === char.url ? "default" : "outline"
                          }
                          className={
                            character === char.url
                              ? "bg-purple-600 hover:bg-purple-700 text-white justify-start"
                              : "border-purple-500/50 hover:bg-purple-900/50 justify-start"
                          }
                        >
                          {char.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-300">
                      Instructions
                    </h2>
                    <ul className="space-y-3 text-gray-200">
                      <li className="flex items-start">
                        <span className="inline-block h-5 w-5 rounded-full bg-purple-500/20 text-purple-400 text-center mr-2">
                          1
                        </span>
                        Click and drag to rotate the view
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block h-5 w-5 rounded-full bg-purple-500/20 text-purple-400 text-center mr-2">
                          2
                        </span>
                        Scroll to zoom in/out
                      </li>
                      {/* <li className="flex items-start">
                        <span className="inline-block h-5 w-5 rounded-full bg-purple-500/20 text-purple-400 text-center mr-2">
                          3
                        </span>
                        Use the animation controls to change animations
                      </li> */}
                      <li className="flex items-start">
                        <span className="inline-block h-5 w-5 rounded-full bg-purple-500/20 text-purple-400 text-center mr-2">
                          3
                        </span>
                        Select different characters from the menu
                      </li>
                    </ul>

                    <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <h3 className="font-medium text-purple-300 mb-2">
                        About This Demo
                      </h3>
                      <p className="text-sm text-gray-300">
                        This interactive 3D character viewer demonstrates the
                        capabilities of React Three Fiber and Drei for creating
                        immersive web experiences with 3D models and animations.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
