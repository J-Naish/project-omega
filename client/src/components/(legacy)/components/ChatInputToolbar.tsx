/**
 * Chat input toolbar with file attachment and send buttons
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { SUPPORTED_FILE_TYPES } from "@/lib/file-utils";
import type { ChatStatus } from "@/types/chat";

interface ChatInputToolbarProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileButtonClick: () => void;
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  status: ChatStatus;
}

/**
 * Toolbar component with file attachment and send functionality
 */
export function ChatInputToolbar({
  fileInputRef,
  onFileChange,
  onFileButtonClick,
  onSubmit,
  input,
  status,
}: ChatInputToolbarProps) {
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <Input
        ref={fileInputRef}
        type="file"
        onChange={onFileChange}
        className="hidden"
        multiple
        accept={SUPPORTED_FILE_TYPES}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={onFileButtonClick}
        type="button"
        className="cursor-pointer border"
        disabled={isLoading}
      >
        <Paperclip />
      </Button>

      <Button
        size="icon"
        onClick={onSubmit}
        disabled={!input.trim() || isLoading}
        className="cursor-pointer"
      >
        {status === "submitted" || status === "streaming" ? (
          <div className="w-4 h-4 bg-background rounded-sm" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
