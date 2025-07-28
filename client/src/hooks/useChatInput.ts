/**
 * Custom hook for chat input state management
 */

import { useState, useEffect } from "react";
import type { ChatStatus } from "@/types/chat";

interface UseChatInputProps {
  attachedFiles: File[];
  status: ChatStatus;
  onSend: (e: React.FormEvent) => void;
  onClearInput?: () => void;
}

export function useChatInput({ attachedFiles, status, onSend, onClearInput }: UseChatInputProps) {
  const [showPreviews, setShowPreviews] = useState(true);
  const isLoading = status === "submitted" || status === "streaming";

  // Reset preview visibility when attachedFiles changes from parent
  useEffect(() => {
    if (attachedFiles.length === 0) {
      setShowPreviews(true);
    }
  }, [attachedFiles]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !isLoading) {
      e.preventDefault();
      handleFormSubmit(e as React.FormEvent);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    // Hide previews immediately on submit
    if (attachedFiles.length > 0) {
      setShowPreviews(false);
      // Clear input for file submissions
      onClearInput?.();
    }
    onSend(e);
  };

  return {
    showPreviews,
    isLoading,
    handleKeyDown,
    handleFormSubmit,
  };
}
