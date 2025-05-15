import { useState, useEffect } from "react";

interface ChatBoxProps {
  messages: { name: string; text: string }[];
  onSend: (message: string) => void;
}

export default function ChatBox({ messages, onSend }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const send = () => {
    if (!input.trim() || busy) return;
    setBusy(true);
    onSend(input.trim());
    setInput("");
    setBusy(false);
  };

  const toggleMic = async (enable: boolean) => {
    setMicOn(enable);
    await fetch("http://localhost:5000/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable }),
    });
  };

  // Push-to-talk with Shift key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && !micOn) {
        toggleMic(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift" && micOn) {
        toggleMic(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [micOn]);

  return (
    <div className="absolute bottom-40 left-4 w-96 p-4 bg-white/70 rounded-md shadow-md">
      <div className="h-64 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.name}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-md"
          placeholder="Type a message..."
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={busy}
        />
        <button
          onClick={send}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          disabled={busy || !input.trim()}
        >
          Send
        </button>
        <button
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            micOn ? "bg-red-500" : "bg-gray-600"
          }`}
          // No onClick, mic is now controlled by Shift key
        >
          {micOn ? "🎙️" : "🔇"}
        </button>
      </div>
    </div>
  );
}
