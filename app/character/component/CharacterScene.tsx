"use client";

import React, {
  Suspense,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { PerspectiveCamera, Object3D } from "three";
import { EffectComposer, Autofocus } from "@react-three/postprocessing";
import * as THREE from "three";

import NPC from "./NPC";
import Room from "./Room";
import Crosshair from "./Crosshair";

/* ──────────────────── helpers & types ───────────────────── */

type HoverInfo = { name: string };
type NpcDetails = {
  name: string;
  traits: string;
  attitude: string;
  tone: string;
};

const charNameSet = new Set<string>(); // filled after /npcs fetch

/* ──────────────────── ray-casting hover ─────────────────── */

function RaycastSelector({
  onHover,
}: {
  onHover: (h: HoverInfo | null) => void;
}) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    raycaster.current.setFromCamera(mouse, camera);
    const hits = raycaster.current.intersectObjects(scene.children, true);

    for (const hit of hits) {
      let cur: Object3D | null = hit.object;
      while (cur) {
        const nm = cur.userData?.name;
        if (nm && charNameSet.has(nm)) {
          onHover({ name: nm });
          return;
        }
        cur = cur.parent;
      }
    }
    onHover(null);
  });

  return null;
}

/* ──────────────────── right-click zoom ─────────────────── */

function RightClickZoom() {
  const { camera } = useThree();
  const cam = camera as PerspectiveCamera;
  const zoomFov = 30;
  const normalFov = 75;
  const target = useRef(cam.fov);
  const down = useRef(false);

  useEffect(() => {
    const md = (e: MouseEvent) => (e.button === 2 ? (down.current = true) : null);
    const mu = (e: MouseEvent) => (e.button === 2 ? (down.current = false) : null);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
    };
  }, []);

  useFrame(() => {
    target.current = down.current ? zoomFov : normalFov;
    cam.fov += (target.current - cam.fov) * 0.8;
    cam.updateProjectionMatrix();
  });

  return null;
}

/* ──────────────────── post-processing ──────────────────── */

function PostFX() {
  return (
    <EffectComposer multisampling={8}>
      <Autofocus focalLength={0.1} bokehScale={3} height={720} smoothTime={0.005} />
    </EffectComposer>
  );
}

/* ───────────────────── main scene ──────────────────────── */

export default function CharacterScene() {
  const [npcList, setNpcList] = useState<NpcDetails[]>([]);
  const [npcMap, setNpcMap] = useState<Record<string, NpcDetails>>({});
  const [emotions, setEmotions] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState<HoverInfo | null>(null);

  /* fetch NPC meta once ----------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("http://localhost:5000/npcs");
        const j = await r.json();
        if (!j.npcs) return;

        setNpcList(j.npcs);
        const map: Record<string, NpcDetails> = {};
        j.npcs.forEach((n: NpcDetails) => {
          map[n.name] = n;
          charNameSet.add(n.name);
        });
        setNpcMap(map);
      } catch (e) {
        console.error("[NPC LOAD] error", e);
      }
    })();
  }, []);

  /* poll emotions ----------------------------------------- */
  useEffect(() => {
    const tick = async () => {
      try {
        const r = await fetch("http://localhost:5000/npc_emotions");
        const j = await r.json(); // { emotions:[{name,value}] }
        const rec: Record<string, number> = {};
        j.emotions?.forEach((e: { name: string; value: number }) => {
          rec[e.name] = e.value;
        });
        setEmotions(rec);
      } catch (e) {
        console.error("[EMOTIONS] poll error", e);
      }
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  /* render ------------------------------------------------- */
  return (
    <div className="w-screen h-screen relative select-none">
      {/* 3-D canvas */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [0, 1.3, 3], fov: 75, near: 0.05, far: 200 }}
          gl={{ antialias: true }}
          style={{ background: "#87ceeb" }}
        >
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={200}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />

          <Suspense fallback={null}>
            <Room />
            {npcList.map((npc, i) => (
              <NPC
                key={npc.name}
                index={i}
                url={`/models/char${(i % 5) + 1}.glb`}
                name={npc.name}
                description={npc.traits}
                emotionScore={emotions[npc.name] ?? 5}
              />
            ))}
          </Suspense>

          <PointerLockControls />
          <RightClickZoom />
          <RaycastSelector onHover={setHovered} />
          <PostFX />
        </Canvas>
      </div>

      {/* overlays */}
      <Crosshair />

      {hovered && npcMap[hovered.name] && (
        <div
          className="absolute top-4 left-4 w-80 p-4 rounded-lg bg-black/75 text-white
                     backdrop-blur shadow-xl pointer-events-none z-20"
        >
          <h2 className="text-xl font-bold mb-2">{npcMap[hovered.name].name}</h2>
          <p className="text-sm mb-1">
            <span className="font-semibold">Traits:</span> {npcMap[hovered.name].traits}
          </p>
          <p className="text-sm mb-1">
            <span className="font-semibold">Attitude:</span>{" "}
            {npcMap[hovered.name].attitude}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Tone:</span> {npcMap[hovered.name].tone}
          </p>
        </div>
      )}
    </div>
  );
}
