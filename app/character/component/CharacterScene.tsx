import React, { useState } from "react";
import TopicGate from "./TopicGate";
import NPC from "./NPC";

export default function CharacterScene() {
  const [ready, setReady] = useState(false);
  const [initialNpcs, setInitialNpcs] = useState<string[]>([]);

  if (!ready) {
    return <TopicGate onReady={(data) => { setInitialNpcs(data.npcs); setReady(true); }} />;
  }

  return (
    <>
      {initialNpcs.map((name, index) => (
        <NPC
          key={name}
          index={index}
          url={`/models/char${index + 1}.glb`}
          name={name}
          description={`Character ${index + 1}`}
        />
      ))}
    </>
  );
} 