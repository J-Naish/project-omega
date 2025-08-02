"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between px-4 py-4">{children}</div>;
}

export function FileInput({
  fileInputRef,
  onChange,
  onClick,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
}) {
  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        onChange={onChange}
        className="hidden"
        multiple
        accept={".pdf,.txt,.md,.doc,.docx,.rtf,.csv,.json,.xml,.html,.htm,image/*"}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        type="button"
        className="cursor-pointer border"
      >
        <Paperclip />
      </Button>
    </>
  );
}

export function SendButton({
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
