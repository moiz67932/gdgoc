import { useState } from "react";

interface ChatBoxProps {
  messages: { name: string; text: string }[];
  onSend: (message: string) => void;
  isRecording: boolean;
  onRecordToggle: () => void;
}

export default function ChatBox({
  messages,
  onSend,
  isRecording,
  onRecordToggle,
}: ChatBoxProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="absolute bottom-40 left-4 w-96 p-4 bg-white/70 rounded-md shadow-md">
      <div className="h-64 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.name}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-md"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Send
        </button>
        <button
          onClick={onRecordToggle}
          className={`ml-2 px-4 py-2 ${
            isRecording ? "bg-red-500" : "bg-gray-500"
          } text-white rounded-md`}
        >
          {isRecording ? "Stop" : "Record"}
        </button>
      </div>
    </div>
  );
}
