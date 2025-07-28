"use client";

import { cn } from "@/lib/utils";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useChatInput } from "@/hooks/useChatInput";
import { ChatInputTextarea } from "./components/ChatInputTextarea";
import { ChatInputToolbar } from "./components/ChatInputToolbar";
import type { ChatInputProps } from "@/types/chat";

/**
 * Main chat input component with file attachment and drag/drop support
 */
export default function ChatInput({
  input,
  setInput,
  onSend,
  onFileSelect,
  attachedFiles = [],
  onRemoveFile,
  onClearInput,
  status,
}: ChatInputProps) {
  // Custom hooks for functionality
  const { showPreviews, handleKeyDown, handleFormSubmit } = useChatInput({
    attachedFiles,
    status,
    onSend,
    onClearInput,
  });

  const { fileInputRef, triggerFileSelect, handleFileChange, processDroppedFiles } =
    useFileHandling({
      onFileSelect,
    });

  const dragDropHandlers = useDragAndDrop({
    onDrop: processDroppedFiles,
  });

  return (
    <div className="mb-4">
      <form
        className={cn(
          "w-full overflow-hidden rounded-xl border bg-background shadow-sm transition-colors",
          dragDropHandlers.isDragOver
            ? "border-primary border-1 bg-primary/5"
            : "focus-within:border-gray-700"
        )}
        onDragOver={dragDropHandlers.onDragOver}
        onDragLeave={dragDropHandlers.onDragLeave}
        onDrop={dragDropHandlers.onDrop}
      >
        <ChatInputTextarea
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          attachedFiles={showPreviews ? attachedFiles : []}
          onRemoveFile={onRemoveFile}
        />
        <ChatInputToolbar
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onFileButtonClick={triggerFileSelect}
          onSubmit={handleFormSubmit}
          input={input}
          status={status}
        />
      </form>
    </div>
  );
}
