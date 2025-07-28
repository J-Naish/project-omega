"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageArea } from "@/components/chat/message/message-area";
import ChatInput from "@/components/chat/chat-input";

// Utility function to convert File to base64 data URL
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Convert files to AI SDK format
const convertFilesToAttachments = async (files: File[]) => {
  const attachments = await Promise.all(
    files.map(async file => {
      const dataURL = await fileToDataURL(file);
      return {
        name: file.name,
        contentType: file.type,
        url: dataURL,
      };
    })
  );
  return attachments;
};

export default function ChatInterface() {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    reload,
    append,
    setInput,
  } = useChat({
    api: "http://localhost:8080/chat",
  });

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const maxFileSize = 10 * 1024 * 1024; // 10MB limit per file
      const oversizedFiles = fileArray.filter(file => file.size > maxFileSize);

      if (oversizedFiles.length > 0) {
        alert(
          `The following files are too large (max 10MB): ${oversizedFiles.map(f => f.name).join(", ")}`
        );
        return;
      }

      setAttachedFiles(prev => [...prev, ...fileArray]);
      console.log(
        "Files selected:",
        fileArray.map(f => f.name)
      );
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWithFiles = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && attachedFiles.length === 0) {
      return;
    }

    try {
      if (attachedFiles.length > 0) {
        // Convert files to attachments format for AI SDK
        const attachments = await convertFilesToAttachments(attachedFiles);

        console.log(
          "Submitting with files:",
          attachedFiles.map(f => f.name)
        );

        // Use append with attachments
        await append({
          role: "user",
          content: input,
          experimental_attachments: attachments,
        });

        // Clear input and attached files after submission
        setInput("");
        setAttachedFiles([]);
      } else {
        // No files, use regular submit
        handleSubmit(e);
      }
    } catch (error) {
      console.error("Error submitting message with files:", error);
    }
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
            attachedFiles={attachedFiles}
            onRemoveFile={handleRemoveFile}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
