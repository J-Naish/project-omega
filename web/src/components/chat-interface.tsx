"use client";

import { useChat } from "@ai-sdk/react";
import { MessageArea } from "@/components/message-area";
import { ChatInput } from "@/components/chat-input";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const handleFileAttach = () => {
    console.log("File attachment clicked");
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <MessageArea messages={messages} />
      <ChatInput
        input={input}
        setInput={handleInputChange}
        onSend={handleSubmit}
        onFileAttach={handleFileAttach}
      />
    </div>
  );
}