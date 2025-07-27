"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageArea } from "@/components/chat/message/message-area";
import ChatInput from "@/components/chat/chat-input";

export default function ChatInterface() {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const { messages, input, handleInputChange, handleSubmit, status, error, reload } = useChat({
    api: "http://localhost:8080/chat",
  });

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setAttachedFiles(prev => [...prev, ...fileArray]);
      console.log(
        "Files selected:",
        fileArray.map(f => f.name)
      );
    }
  };

  const handleSubmitWithFiles = (e: React.FormEvent) => {
    if (attachedFiles.length > 0) {
      // For now, just log the files - AI SDK file handling will be implemented next
      console.log(
        "Submitting with files:",
        attachedFiles.map(f => f.name)
      );
      // Clear attached files after submission
      setAttachedFiles([]);
    }
    handleSubmit(e);
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
            onSend={handleSubmitWithFiles}
            onFileSelect={handleFileSelect}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
