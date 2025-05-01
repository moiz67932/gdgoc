"use client";
import React from "react";

export default function Crosshair() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "8px",
        height: "8px",
        backgroundColor: "white",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
