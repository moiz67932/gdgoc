"use client";

import React, {
  Suspense,
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Html, PointerLockControls } from "@react-three/drei";
import { PerspectiveCamera } from "three";
import { EffectComposer, Autofocus } from "@react-three/postprocessing";
import * as THREE from "three";
import NPC from "./component/NPC";
import Room from "./component/Room";
import ChatBox from "./component/ChatBox";
import Subtitle from "./component/Subtitle";
import ReactMarkdown from "react-markdown";

/* ------------------------------------------------------------------ */
/*                              DATA                                  */
/* ------------------------------------------------------------------ */

const charNameSet = new Set();
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
          const meta = { name: nm, description: "" };
          setHovered(meta);
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
            const meta = { name: nm, description: "" };

            const audio = new Audio();
            audio.src = nm.startsWith("/static")
              ? `http://localhost:5000${nm}`
              : nm;
            audio.play();
            setSpeakingCharacter(nm);
            audio.addEventListener("ended", () => setSpeakingCharacter(null));

            setSelected(meta);
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

  return null;
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
  const [subtitleText, setSubtitleText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<
    { name: string; text: string }[]
  >([]);
  const [isTopicSelected, setIsTopicSelected] = useState<boolean>(false);
  const [npcStates, setNpcStates] = useState<{
    [name: string]: { lastLine?: string; emotion?: number };
  }>({});
  const [playing, setPlaying] = useState<string | null>(null);
  const [lastSpeaker, setLastSpeaker] = useState<string | null>(null);
  const [npcNames, setNpcNames] = useState<string[]>([]);
  const [characterData, setCharacterData] = useState<any[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<string>("");
  const [topic, setTopic] = useState<string>("");

  // HTML-style audio queue system
  const queue = useRef<{ speaker: string; audio: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNext = useCallback(() => {
    if (queue.current.length === 0) {
      audioRef.current = null;
      setPlaying(null);
      return;
    }
    const { speaker, audio } = queue.current[0];
    setPlaying(speaker);
    setLastSpeaker(speaker);

    // Always use backend static directory for audio
    let audioUrl = audio;
    if (audio && !audio.startsWith("http")) {
      if (audio.startsWith("/static"))
        audioUrl = `http://localhost:5000${audio}`;
      else if (audio.startsWith("static"))
        audioUrl = `http://localhost:5000/${audio}`;
      else audioUrl = `http://localhost:5000/static/${audio}`;
    }

    const a = new Audio(audioUrl);
    audioRef.current = a;
    a.onended = () => {
      queue.current.shift();
      playNext();
    };
    a.play().catch(() => {
      queue.current.shift();
      playNext();
    });
  }, []);

  const enqueue = useCallback(
    (
      speaker: string,
      obj: { text: string; audio?: string; emotion?: number }
    ) => {
      setNpcStates((prev) => ({
        ...prev,
        [speaker]: {
          lastLine: obj.text,
          emotion:
            obj.emotion !== undefined ? obj.emotion : prev[speaker]?.emotion,
        },
      }));
      setLastSpeaker(speaker);
      if (obj.audio) {
        queue.current.push({ speaker, audio: obj.audio });
        if (!audioRef.current) playNext();
      }
    },
    [playNext]
  );

  const clearQueue = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    queue.current = [];
    setPlaying(null);
  }, []);

  // Poll /idle every 3s for NPC responses and audio, and enqueue
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/idle");
        const data = await res.json();
        console.log("IDLE RESPONSES:", data.responses); // Debug log
        (data.responses || []).forEach(
          (resp: {
            speaker: string;
            text: string;
            audio?: string;
            emotion?: number;
          }) => {
            const { speaker, text, audio, emotion } = resp;
            console.log("Enqueue:", { speaker, text, audio, emotion }); // Debug log

            if (speaker === "Coach") {
              setCoachFeedback(text);
            } else {
              enqueue(speaker, { text, audio, emotion });
            }
          }
        );
      } catch (e) {
        // Optionally handle error
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [enqueue]);

  /* ------------------------------------------------------------------ */
  /*                         MESSAGE HANDLING                           */
  /* ------------------------------------------------------------------ */

  // Unified send handler for both text and voice
  function handleSendMessage(message: string) {
    if (!message.trim()) return;
    setChatMessages((prev) => [...prev, { name: "User", text: message }]);
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
        console.log("Coach Response:", {
          speaker: npcSpeaker,
          message: npcMessage,
        });

        setChatMessages((prev) => [
          ...prev,
          { name: npcSpeaker, text: npcMessage },
        ]);
        setSubtitleText(npcMessage);

        // Update both coach feedback and AI suggestion
        if (data.feedback) {
          setCoachFeedback(data.feedback);
          setTimeout(
            () => setCoachFeedback(""),
            data.feedback.length * 25 + 500
          );
        }

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
          { name: "System", text: "Failed to send message. Please try again." },
        ]);
      });
  }

  //state for loading
  const [loading, setLoading] = useState(false);

  const handleTopicSubmit = () => {
    if (!topic.trim()) return;

    setLoading(true); // Start loader

    fetch("http://localhost:5000/topic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "ok" && d.npcs) {
          setIsTopicSelected(true);
          setNpcNames(d.npcs);

          const models = [
            "/models/char1.glb",
            "/models/char2.glb",
            "/models/char3.glb",
            "/models/char4.glb",
            "/models/char5.glb",
          ];
          const descriptions = [
            "Team Leader",
            "Engineer",
            "Designer",
            "Analyst",
            "Strategist",
          ];

          setCharacterData(
            d.npcs.map((name: string, i: number) => ({
              url: models[i % models.length],
              name,
              description: descriptions[i % descriptions.length],
            }))
          );

          setChatMessages([
            { name: "System", text: `Topic selected: ${topic}` },
          ]);
        } else {
          alert("Topic fetch failed.");
        }
      })
      .catch((error) => {
        console.error("Error setting topic:", error);
        alert("Failed to set topic. Please try again.");
      })
      .finally(() => {
        setLoading(false); // Hide loader regardless of success or failure
      });
  };

  if (!isTopicSelected) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="w-96 p-6 bg-gray-800 rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">
            Choose a discussion topic
          </h1>
          <input
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none mb-4"
            placeholder="e.g. Overcoming stage fright"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTopicSubmit()}
          />
          <button
            onClick={handleTopicSubmit}
            disabled={loading}
            className={`w-full px-6 py-2 rounded text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              "Start"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative select-none">
      <div className="absolute inset-0 z-0">
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
            <Room />
            {characterData.map((c, i) => {
              const npcState = npcStates[c.name] || {};
              const isSpeaking = c.name === playing;
              console.log(
                "NPC Render:",
                c.name,
                "isSpeaking:",
                isSpeaking,
                "playing:",
                playing
              ); // Debug log
              return (
                <group key={c.name}>
                  <NPC
                    index={i}
                    url={c.url}
                    name={c.name}
                    description={c.description}
                    emotionScore={npcState.emotion ?? i * 0.25}
                    isSpeaking={isSpeaking}
                    lastLine={npcState.lastLine}
                    lookAtCenter
                  />
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
      </div>

      {/* UI Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* crosshair --------------------------------------------------- */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* info card --------------------------------------------------- */}
        {(() => {
          const info = selected ?? hovered; // selected takes precedence
          return info ? (
            <div
              className="absolute top-4 left-4 w-64 p-4 rounded-md bg-white/30 backdrop-blur
                            border border-white/50 text-white shadow-lg pointer-events-auto"
            >
              <h2 className="font-bold text-lg">{info.name}</h2>
              <p className="text-sm">{info.description}</p>
            </div>
          ) : null;
        })()}

        {/* chat box --------------------------------------------------- */}
        <div className="pointer-events-auto">
          <ChatBox />
        </div>

        {/* subtitle --------------------------------------------------- */}
        <Subtitle text={subtitleText} />

        {/* Coach feedback box */}
        {coachFeedback && (
          <div className="absolute right-0 bottom-24 m-4 w-72 bg-gray-800 rounded-lg p-4 text-sm shadow-lg pointer-events-auto">
            <h2 className="font-semibold text-green-400 mb-2">
              Coach feedback
            </h2>
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="mb-1" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc ml-4" {...props} />
                ),
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              }}
            >
              {coachFeedback}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
