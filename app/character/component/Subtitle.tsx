"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SubtitleProps {
  text: string;
}

export default function Subtitle({ text }: SubtitleProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    if (!text) return;

    const words = text.split(" ");
    const chunks: string[] = [];
    let currentChunk = "";

    // How many characters per line
    const maxCharsPerLine = 60;
    words.forEach((word) => {
      if ((currentChunk + " " + word).length <= maxCharsPerLine) {
        currentChunk += (currentChunk ? " " : "") + word;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = word;
      }
    });
    if (currentChunk) chunks.push(currentChunk);

    setLines(chunks);
    setCurrentLine(0);
  }, [text]);

  // Time each Line is Shown on Screen
  useEffect(() => {
    if (currentLine >= lines.length) return;
    const timer = setTimeout(() => {
      setCurrentLine((prev) => prev + 1);
    }, 1600);
    return () => clearTimeout(timer);
  }, [currentLine, lines]);

  return (
    <>
      {text && currentLine < lines.length && (
        <div className="fixed bottom-20 w-full flex justify-center items-center pointer-events-none z-50">
          <div
            className="bg-black/50 px-4 py-2 rounded text-white text-lg font-medium text-center transition-all duration-300"
            style={{
              width: lines[currentLine]?.length < 30 ? "fit-content" : "60vw",
              minHeight: "3.5rem",
              maxWidth: "40vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatePresence mode="wait">
              {lines[currentLine] && (
                <motion.div
                  key={lines[currentLine]}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    whiteSpace:
                      lines[currentLine].length < 30 ? "nowrap" : "normal",
                    overflowWrap: "break-word",
                    textAlign: "center",
                  }}
                >
                  {lines[currentLine]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
