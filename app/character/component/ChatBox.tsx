import { useState, useEffect, useRef } from "react";

export default function MicButton({
  clearQueue,
  clearMessages,
}: {
  clearQueue?: () => void;
  clearMessages?: () => void;
}) {
  const [iconState, setIconState] = useState<'muted' | 'mic'>('muted');

  const startMic = () => {
    setIconState('mic');
    console.log('[Mic] startMic: iconState=mic');
  };

  const stopMic = () => {
    setIconState('muted');
    console.log('[Mic] stopMic: iconState=muted');
  };

  const toggleMic = async (enable: boolean) => {
    console.log('[Mic] toggleMic called. enable:', enable);
    if (enable) {
      startMic();
      if (clearQueue) clearQueue();
      if (clearMessages) clearMessages();
    } else {
      stopMic();
    }
    await fetch("http://localhost:5000/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable }),
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && iconState !== 'mic') {
        console.log('[Mic] handleKeyDown: Shift down');
        toggleMic(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift" && iconState === 'mic') {
        console.log('[Mic] handleKeyUp: Shift up');
        toggleMic(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [iconState]);

  useEffect(() => {
    console.log('[Mic] Render: iconState:', iconState);
  }, [iconState]);

  useEffect(() => {
    console.log('[Mic] MicButton mounted');
    return () => {
      console.log('[Mic] MicButton unmounted');
    };
  }, []);

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-row items-center gap-2">
      <button
        className={`w-20 h-20 rounded-full shadow-xl text-white text-5xl flex items-center justify-center ${
          iconState === 'mic' ? "bg-red-500" : "bg-gray-700"
        } transition duration-200`}
        title="Press and hold Shift to talk"
      >
        {iconState === 'mic' ? (
          "🎙️"
        ) : (
          "🔇"
        )}
      </button>
      <span className="text-lg font-semibold text-white bg-black/60 px-3 py-1 rounded-md">
        Press{" "}
        <kbd className="px-1 py-0.5 border bg-white text-black text-sm rounded">
          Shift
        </kbd>{" "}
        to Talk
      </span>
    </div>
  );
}
