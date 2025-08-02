"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import ChatInput from "./chat-input";
import MessageArea from "./message/message-area";
import { cn } from "@/lib/utils";
import { useDragAndDropFile } from "@/hooks/use-drag-and-drop-file";

export default function Chat() {
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toggleSidebar } = useSidebar();

  const { input, handleSubmit, status, handleInputChange, messages, error, reload } = useChat({
    api: "http://localhost:8080/chat",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (newFiles) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(newFiles)]);
    }
  };

  const { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, isDragging } =
    useDragAndDropFile({ setFiles });

  return (
    <div
      className="w-full flex justify-center"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-6xl flex flex-col px-6">
        <div className="flex-1">
          <MessageArea messages={messages} status={status} error={error} onRetry={reload} />
        </div>
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
              <ChatInput.FilePreview
                files={files}
                onRemoveFile={(idx: number) => setFiles(files.filter((_, i) => i !== idx))}
              />
              <ChatInput.Textarea value={input} onChange={handleInputChange} />
            </div>
            <ChatInput.Toolbar>
              <ChatInput.FileInput
                fileInputRef={fileInputRef}
                onChange={handleFileChange}
                onClick={() => fileInputRef.current?.click()}
              />
              <ChatInput.SendButton onClick={handleSubmit} input={input} status={status} />
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
