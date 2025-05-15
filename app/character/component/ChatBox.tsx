import { useState, useEffect } from "react";

export default function MicButton() {
  const [micOn, setMicOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleMic = async (enable: boolean) => {
    setMicOn(enable);
    await fetch("http://localhost:5000/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable }),
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && !micOn && !loading) {
        toggleMic(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift" && micOn) {
        toggleMic(false);
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [micOn, loading]);

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-row items-center gap-2">
      <button
        className={`w-20 h-20 rounded-full shadow-xl text-white text-5xl flex items-center justify-center ${
          micOn ? "bg-red-500" : "bg-gray-700"
        } transition duration-200`}
        title="Press and hold Shift to talk"
      >
        {loading ? (
          <div className="w-10 h-10 border-[5px] border-white border-t-transparent rounded-full animate-spin" />
        ) : micOn ? (
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
