"use client";
import React from "react";

interface CharacterInfoPanelProps {
  name?: string;
  description?: string;
}

const CharacterInfoPanel: React.FC<CharacterInfoPanelProps> = ({
  name,
  description,
}) => {
  if (!name && !description) return null;

  return (
    <div
      className="absolute top-1/4 left-4 w-64 p-4 rounded-md bg-black/60 backdrop-blur-sm
                    border border-white/20 text-white shadow-lg pointer-events-auto
                    transition-all duration-200 ease-in-out"
    >
      <h2 className="font-bold text-lg mb-2">{name}</h2>
      <p className="text-sm text-gray-200">{description}</p>
    </div>
  );
};

export default CharacterInfoPanel;
