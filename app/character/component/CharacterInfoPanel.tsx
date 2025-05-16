"use client";
import React from "react";

interface CharacterInfoPanelProps {
  visible: boolean;
  description: string;
}

export default function CharacterInfoPanel({
  visible,
  description,
}: CharacterInfoPanelProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        padding: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
        borderRadius: "8px",
        fontSize: "14px",
        maxWidth: "250px",
        zIndex: 20,
      }}
    >
      {description}
    </div>
  );
}
