"use client";

import { type Message } from "ai";
import { useEffect, useRef } from "react";
import UserMessage from "./user-message";
import AssistantMessage from "./assistant-message";
import Spinner from "./spinner";

export function MessageArea({
  messages,
  status,
}: {
  messages: Message[];
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

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
      {status === "submitted" && <Spinner />}
      <div ref={messagesEndRef} />
    </div>
  );
}
