"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";

interface ChatInputToolbarProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileButtonClick: () => void;
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  status: "submitted" | "streaming" | "ready" | "error";
}

export default function ChatToolbar({
  fileInputRef,
  onFileChange,
  onFileButtonClick,
  onSubmit,
  input,
  status,
}: ChatInputToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <FileInput
        fileInputRef={fileInputRef}
        onFileChange={onFileChange}
        onFileButtonClick={onFileButtonClick}
        status={status}
      />
      <SendButton onSubmit={onSubmit} input={input} status={status} />
    </div>
  );
}

function FileInput({
  fileInputRef,
  onFileChange,
  onFileButtonClick,
  status,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileButtonClick: () => void;
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  const isLoading = status === "submitted" || status === "streaming";
  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        onChange={onFileChange}
        className="hidden"
        multiple
        accept={".pdf,.txt,.md,.doc,.docx,.rtf,.csv,.json,.xml,.html,.htm,image/*"}
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
    </>
  );
}

function SendButton({
  onSubmit,
  input,
  status,
}: {
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  const isLoading = status === "submitted" || status === "streaming";
  return (
    <Button
      size="icon"
      onClick={onSubmit}
      disabled={!input.trim() || isLoading}
      className="cursor-pointer"
    >
      <Send className="w-4 h-4" />
    </Button>
  );
}
