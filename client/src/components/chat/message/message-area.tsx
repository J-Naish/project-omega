"use client";

import { type Message } from "ai";
import { useEffect, useRef } from "react";
import UserMessage from "./user-message";
import AssistantMessage from "./assistant-message";

export function MessageArea({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-4 space-y-8">
      {messages.map(message => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role === "user" && <UserMessage message={message} />}
          {message.role === "assistant" && <AssistantMessage message={message} />}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
