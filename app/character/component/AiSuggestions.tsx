"use client";

import { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";

interface AISuggestionsBoxProps {
  suggestion?: string;
  isStreaming?: boolean;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export default function AISuggestionsBox({
  suggestion = "",
  isStreaming = false,
  position = { x: 100, y: 100 },
  onPositionChange,
  isOpen = true,
  onToggleOpen,
}: AISuggestionsBoxProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize nodeRef with the correct type
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming || !suggestion || currentIndex >= suggestion.length)
      return;

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + suggestion[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, 25);

    return () => clearTimeout(timer);
  }, [currentIndex, isStreaming, suggestion]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [suggestion]);

  const handleDragStart = () => setIsDragging(true);
  const handleDragStop = (_: any, data: { x: number; y: number }) => {
    setIsDragging(false);
    onPositionChange?.({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      nodeRef={nodeRef} // Pass the nodeRef to Draggable
      handle=".handle"
      defaultPosition={position}
      bounds="body"
      onStart={handleDragStart}
      onStop={handleDragStop}
    >
      <div
        ref={nodeRef} // Assign nodeRef to the draggable element
        className={`fixed z-50 w-80 rounded-2xl overflow-hidden shadow-xl transition-all ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="handle flex items-center justify-between p-3 bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 animate-pulse">
              <div className="text-lg animate-pulse">🤖</div>
            </div>
            <h3 className="text-sm font-semibold tracking-wide">
              AI Suggestions
            </h3>
          </div>
          <button
            onClick={onToggleOpen}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full"
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="p-4 bg-gray-900 text-white min-h-[100px] max-h-[300px] overflow-y-auto">
            <div className="flex flex-col gap-3">
              <div className="inline-block max-w-[90%] p-3 rounded-xl bg-blue-600 text-sm">
                {isStreaming && currentIndex < suggestion.length ? (
                  <>
                    {displayedText}
                    <span className="animate-pulse ml-1">|</span>
                  </>
                ) : (
                  <div className="mt-2 text-sm text-gray-300">
                    {suggestion && suggestion.split(/\n+/).map((line, i) => (
                      <p key={i} className="mb-1">• {line.replace(/^[-•]\s*/, '')}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 ml-1">
                {isStreaming ? "Typing..." : suggestion ? "Delivered" : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}
