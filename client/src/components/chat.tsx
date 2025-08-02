"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import ChatInput from "./chat-input";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragCounter, setDragCounter] = useState(0);
  const isDragging = dragCounter > 0;

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
  };

  return (
    <div
      className="w-full flex justify-center"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-6xl flex flex-col px-6">
        <div className="flex-1">{/* Message Area */}</div>
        <div className="sticky bottom-0 pb-6">
          <form
            className={cn(
              "rounded-2xl border focus-within:border-1 focus-within:border-blue-800 transition-all relative bg-input",
              isDragging && "border-blue-500 border-dashed"
            )}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500 opacity-50 z-10 pointer-events-none rounded-2xl" />
            )}
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
