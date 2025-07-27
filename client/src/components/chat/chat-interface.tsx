"use client";

import { useChat } from "@ai-sdk/react";
import { MessageArea } from "@/components/chat/message/message-area";
import ChatInput from "@/components/chat/chat-input";

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status, error, reload } = useChat({
    api: "http://localhost:8080/chat",
  });

  const handleFileAttach = () => {
    console.log("File attachment clicked");
  };

  return (
    <div className="relative h-screen max-w-4xl px-4 mx-auto">
      <div className="h-full pb-32 overflow-hidden">
        <MessageArea messages={messages} status={status} error={error} onRetry={reload} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-background">
        <div className="max-w-4xl px-4 mx-auto">
          <ChatInput
            input={input}
            setInput={handleInputChange}
            onSend={handleSubmit}
            onFileAttach={handleFileAttach}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
