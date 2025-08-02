"use client";

import { useEffect, useRef } from "react";
import { type Message } from "ai";
import UserMessage from "./user-message";
import AssistantMessage from "./assistant-message";
import Spinner from "./spinner";
import ErrorMessage from "./error-message";

export function MessageArea({
  messages,
  status,
  error,
  onRetry,
}: {
  messages: Message[];
  status: "submitted" | "streaming" | "ready" | "error";
  error?: Error;
  onRetry?: () => void;
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
        <div key={message.id} className="space-y-2">
          <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "user" && <UserMessage message={message} />}
            {message.role === "assistant" && <AssistantMessage message={message} />}
          </div>
        </div>
      ))}
      {status === "submitted" && <Spinner />}
      {status === "error" && <ErrorMessage error={error} onRetry={onRetry} />}
      <div ref={messagesEndRef} />
    </div>
  );
}
