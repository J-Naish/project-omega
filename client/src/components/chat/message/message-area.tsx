"use client";

import { type Message } from "ai";
import { useEffect, useRef } from "react";
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
          <MessageDebugInfo message={message} />
        </div>
      ))}
      {status === "submitted" && <Spinner />}
      {status === "error" && <ErrorMessage error={error} onRetry={onRetry} />}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageDebugInfo({ message }: { message: Message }) {
  const parts = Array.isArray(message.content)
    ? message.content
    : [{ type: "text", text: message.content }];

  return (
    <div className="mx-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs font-mono border-l-2 border-blue-400">
      <span className="font-semibold text-blue-600 dark:text-blue-400">Parts:</span>{" "}
      {parts.map((part, index) => (
        <span key={index} className="mr-2">
          <span className="text-gray-600 dark:text-gray-400">#{index + 1}</span>
          <span className="text-purple-600 dark:text-purple-400">{part.type}</span>
        </span>
      ))}
    </div>
  );
}
