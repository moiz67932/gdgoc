"use client";

import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Html, PointerLockControls } from "@react-three/drei";
import { PerspectiveCamera } from "three";
import { EffectComposer, Autofocus } from "@react-three/postprocessing";
import * as THREE from "three";
import NPC from "./component/NPC";
import Room from "./component/Room";
import ChatBox from "./component/ChatBox";
import Subtitle from "./component/Subtitle";
import AISuggestionsBox from "./component/AiSuggestions";

/* ------------------------------------------------------------------ */
/*                              DATA                                  */
/* ------------------------------------------------------------------ */

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

const charNameSet = new Set(characterData.map((c) => c.name));
type CharacterInfo = { name: string; description: string };

/* ------------------------------------------------------------------ */
/*                       RAY-CAST SELECTION                           */
/* ------------------------------------------------------------------ */

function RaycastSelector({
  setSelected,
  setHovered,
  setSpeakingCharacter,
}: {
  setSelected: (d: CharacterInfo | null) => void;
  setHovered: (d: CharacterInfo | null) => void;
  setSpeakingCharacter: (n: string | null) => void;
}) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useMemo(() => new THREE.Vector2(0, 0), []);

  /* --------------------  HOVER  -------------------- */
  useFrame(() => {
    raycaster.current.setFromCamera(mouse, camera);
    const hits = raycaster.current.intersectObjects(scene.children, true);

    for (const h of hits) {
      let cur: THREE.Object3D | null = h.object;
      while (cur) {
        const nm = cur.userData?.name;
        if (nm && charNameSet.has(nm)) {
          const meta = characterData.find((c) => c.name === nm)!;
          setHovered({ name: meta.name, description: meta.description });
          return;
        }
        cur = cur.parent;
      }
    }
    setHovered(null);
  });

  /* --------------------  CLICK  -------------------- */
  useEffect(() => {
    const onClick = () => {
      raycaster.current.setFromCamera(mouse, camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);

      for (const h of hits) {
        let cur: THREE.Object3D | null = h.object;
        while (cur) {
          const nm = cur.userData?.name;
          if (nm && charNameSet.has(nm)) {
            const meta = characterData.find((c) => c.name === nm)!;

            const audio = new Audio(meta.audio);
            audio.play();
            setSpeakingCharacter(meta.name);
            audio.addEventListener("ended", () => setSpeakingCharacter(null));

            setSelected({ name: meta.name, description: meta.description });
            return;
          }
          cur = cur.parent;
        }
      }
      setSelected(null);
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [camera, scene]);

  return null;
}

/* ------------------------------------------------------------------ */
/*                    RIGHT-CLICK-TO-ZOOM                             */
/* ------------------------------------------------------------------ */

function RightClickZoom() {
  const { camera } = useThree();
  const cam = camera as PerspectiveCamera;
  const targetFov = useRef(cam.fov);
  const zoomFov = 30;
  const normalFov = 75;
  const rightIsDown = useRef(false);

  useEffect(() => {
    const down = (e: MouseEvent) =>
      e.button === 2 && (rightIsDown.current = true);
    const up = (e: MouseEvent) =>
      e.button === 2 && (rightIsDown.current = false);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  useFrame(() => {
    targetFov.current = rightIsDown.current ? zoomFov : normalFov;
    cam.fov += (targetFov.current - cam.fov) * 0.8;
    cam.updateProjectionMatrix();
  });

  return;
}

/* ------------------------------------------------------------------ */
/*                    POST-PROCESSING  (Autofocus)                    */
/* ------------------------------------------------------------------ */

function PostFX() {
  return (
    <EffectComposer multisampling={8}>
      <Autofocus
        focalLength={0.1}
        bokehScale={3}
        height={720}
        smoothTime={0.005}
        mouse={false}
      />
    </EffectComposer>
  );
}

/* ------------------------------------------------------------------ */
/*                           MAIN SCENE                               */
/* ------------------------------------------------------------------ */

export default function CharacterScene() {
  const [selected, setSelected] = useState<CharacterInfo | null>(null);
  const [hovered, setHovered] = useState<CharacterInfo | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  // State for Subtitles
  const [subtitleText, setSubtitleText] = useState<string>("");
  // Message State
  const [chatMessages, setChatMessages] = useState<
    { name: string; text: string }[]
  >([]);
  // State for AI Suggestions
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isSuggestionStreaming, setIsSuggestionStreaming] =
    useState<boolean>(false);
  const [isSuggestionBoxOpen, setIsSuggestionBoxOpen] = useState<boolean>(true);
  const [suggestionBoxPosition, setSuggestionBoxPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  // Dummy AI Suggestions Array
  const dummySuggestions = [
    "Have you considered using a different approach?",
    "Try breaking the problem into smaller parts.",
    "Focus on the key objectives first.",
    "What if you approached this from another perspective?",
    "Consider collaborating with others for fresh ideas.",
  ];

  useEffect(() => {
    let suggestionIndex = 0;

    const interval = setInterval(() => {
      const npcMessage = dummySuggestions[suggestionIndex];
      suggestionIndex = (suggestionIndex + 1) % dummySuggestions.length;

      // Add AI suggestions
      setAiSuggestion(npcMessage);
      setIsSuggestionStreaming(true);
      setTimeout(
        () => setIsSuggestionStreaming(false),
        npcMessage.length * 25 + 500
      );
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  /* ------------------------------------------------------------------ */
  /*                         MESSAGE HANDLING                           */
  /* ------------------------------------------------------------------ */

  function handleSendMessage(
    message: string,
    setChatMessages: React.Dispatch<
      React.SetStateAction<{ name: string; text: string }[]>
    >,
    setSpeaking: React.Dispatch<React.SetStateAction<string | null>>
  ) {
    // Add the user's message to the chat
    setChatMessages((prev) => [...prev, { name: "User", text: message }]);

    // Make the API call
    fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        const responseText = data.response;
        const [npcSpeaker, npcMessage] = responseText.split(": ");

        // Add the NPC's response to the chat
        setChatMessages((prev) => [
          ...prev,
          { name: npcSpeaker, text: npcMessage },
        ]);

        // Line for Adding Text to Subtitles
        setSubtitleText(npcMessage); // 🟡 Trigger subtitle here

        // Add AI suggestions
        setAiSuggestion(npcMessage);
        setIsSuggestionStreaming(true);
        setTimeout(
          () => setIsSuggestionStreaming(false),
          npcMessage.length * 25 + 500
        );

        // Play the NPC's audio if available
        const npcData = characterData.find((c) => c.name === npcSpeaker);
        if (npcData) {
          const audio = new Audio(npcData.audio);
          setSpeaking(npcSpeaker);
          audio.play();
          audio.addEventListener("ended", () => setSpeaking(null));
        }
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        setChatMessages((prev) => [
          ...prev,
          { name: "System", text: "Failed to fetch response from the server." },
        ]);
      });
  }

  return (
    <div className="w-screen h-screen relative select-none">
      <Canvas
        shadows
        camera={{ position: [0, 1.3, 3], fov: 75, near: 0.05, far: 200 }}
        gl={{ antialias: true }}
        style={{ background: "#87ceeb" }}
      >
        {/* lights ---------------------------------------------------- */}
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

        {/* assets ---------------------------------------------------- */}
        <Suspense fallback={null}>
          <Room receiveShadow />
          {characterData.map((c, i) => {
            const message = chatMessages.find((m) => m.name === c.name)?.text;

            return (
              <group key={c.name}>
                <NPC
                  index={i}
                  url={c.url}
                  name={c.name}
                  description={c.description}
                  emotionScore={i * 0.25}
                  isSpeaking={c.name === speaking}
                  lookAtCenter
                />
                {message && (
                  <Html position={[0, -1, 0]} center distanceFactor={10}>
                    <div className="bg-white/70 text-black px-2 py-1 rounded-md shadow-md text-sm">
                      {message}
                    </div>
                  </Html>
                )}
              </group>
            );
          })}
        </Suspense>

        {/* helpers --------------------------------------------------- */}
        <PointerLockControls />
        <RightClickZoom />
        <RaycastSelector
          setSelected={setSelected}
          setHovered={setHovered}
          setSpeakingCharacter={setSpeaking}
        />
        <PostFX />
      </Canvas>

      {/* crosshair --------------------------------------------------- */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* info card --------------------------------------------------- */}
      {(() => {
        const info = selected ?? hovered; // selected takes precedence
        return info ? (
          <div
            className="absolute top-4 left-4 w-64 p-4 rounded-md bg-white/30 backdrop-blur
                          border border-white/50 text-white shadow-lg z-50"
          >
            <h2 className="font-bold text-lg">{info.name}</h2>
            <p className="text-sm">{info.description}</p>
          </div>
        ) : null;
      })()}

      {/* chat box --------------------------------------------------- */}
      <ChatBox
        messages={chatMessages} // Pass the chat messages to the ChatBox
        onSend={(msg) => handleSendMessage(msg, setChatMessages, setSpeaking)}
        isRecording={false}
        onRecordToggle={() => alert("Recording feature to be implemented")}
      />
      {/* subtitle --------------------------------------------------- */}
      <Subtitle text="Hello Abdullah! This is a Demo Text for Captions. We have to Integrate AI Model in it. I have to connect it to local API first and we can test it there, then when it will be hosted on Google Cloud Console, we will just change the API endpoint. I hope that the format in which the data will returned by API remains same. What do You Say? Hmmmm" />

      {/* AI suggestions box ---------------------------------------- */}
      <AISuggestionsBox
        suggestion={aiSuggestion}
        isStreaming={isSuggestionStreaming}
        isOpen={isSuggestionBoxOpen}
        onToggleOpen={() => setIsSuggestionBoxOpen((prev) => !prev)}
        position={suggestionBoxPosition}
        onPositionChange={setSuggestionBoxPosition}
      />
    </div>
  );
}
