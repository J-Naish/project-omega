"use client";

import { Card } from "@/components/ui/card";
import { type Message } from "ai";
import { useEffect, useRef } from "react";

interface MessageAreaProps {
  messages: Message[];
}

export function MessageArea({ messages }: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length !== 0 && (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "user" ? (
              <Card className="max-w-[80%] p-4 bg-primary text-primary-foreground">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>
            ) : (
              <div className="max-w-[80%]">
                <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}