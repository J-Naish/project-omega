"use client";

import { useState } from "react";
import { MessageArea } from "@/components/message-area";
import { ChatInput } from "@/components/chat-input";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm a demo assistant. Your message was received!",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleFileAttach = () => {
    console.log("File attachment clicked");
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <MessageArea messages={messages} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onFileAttach={handleFileAttach}
      />
    </div>
  );
}