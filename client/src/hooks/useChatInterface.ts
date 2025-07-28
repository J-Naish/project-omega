/**
 * Custom hook for chat interface state and logic
 */

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

/**
 * Utility function to convert File to base64 data URL
 */
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert files to AI SDK format
 */
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

interface UseChatInterfaceProps {
  apiEndpoint?: string;
}

export function useChatInterface({
  apiEndpoint = "http://localhost:8080/chat",
}: UseChatInterfaceProps = {}) {
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
    api: apiEndpoint,
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

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearInput = () => {
    setInput("");
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

        // Clear attached files after submission
        setAttachedFiles([]);
      } else {
        // No files, use regular submit
        handleSubmit(e);
      }
    } catch (error) {
      console.error("Error submitting message with files:", error);
    }
  };

  return {
    // Chat state
    messages,
    input,
    status,
    error,

    // File state
    attachedFiles,

    // Handlers
    handleInputChange,
    handleSubmitWithFiles,
    handleFileSelect,
    handleRemoveFile,
    handleClearInput,
    reload,
  };
}
