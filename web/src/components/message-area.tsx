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

  const renderToolInvocations = (message: Message) => {
    if (!message.parts || message.parts.length === 0) return null;

    return message.parts.map((part, index) => {
      if (part.type === 'tool-invocation') {
        const { toolName, state } = part.toolInvocation;
        
        return (
          <div key={index} className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">
                {state === 'partial-call' && `Calling ${toolName}...`}
                {state === 'call' && `Executing ${toolName}...`}
                {state === 'result' && `${toolName} completed`}
              </span>
            </div>
            {state === 'result' && part.toolInvocation.result && (
              <div className="mt-1 text-xs text-gray-600">
                <details className="cursor-pointer">
                  <summary>View result</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {typeof part.toolInvocation.result === 'string' 
                      ? part.toolInvocation.result 
                      : JSON.stringify(part.toolInvocation.result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        );
      }
      return null;
    });
  };

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
                {renderToolInvocations(message)}
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}