"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import ChatInput from "./chat-input";

export default function Chat() {
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toggleSidebar } = useSidebar();

  const { input, handleSubmit, status, handleInputChange } = useChat({
    api: "http://localhost:8080/chat",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (newFiles) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(newFiles)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl flex flex-col px-6">
        <div className="flex-1">{/* Message Area */}</div>
        <div className="sticky bottom-0 pb-6">
          <form className="rounded-2xl border focus-within:border-1 focus-within:border-blue-500 transition-all">
            <div>
              <ChatInput.FilePreview files={files} onRemoveFile={handleRemoveFile} />
              <ChatInput.Textarea value={input} onChange={handleInputChange} />
            </div>
            <ChatInput.Toolbar>
              <ChatInput.FileInput
                fileInputRef={fileInputRef}
                onChange={handleFileChange}
                onClick={() => fileInputRef.current?.click()}
              />
              <ChatInput.SendButton onSubmit={handleSubmit} input={input} status={status} />
            </ChatInput.Toolbar>
          </form>
        </div>
        <Button onClick={toggleSidebar} className="fixed top-0 left-0">
          Sidebar
        </Button>
      </div>
    </div>
  );
}
