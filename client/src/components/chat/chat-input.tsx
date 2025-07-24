"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onFileAttach?: () => void;
  isLoading?: boolean;
}

export default function ChatInput({ input, setInput, onSend, onFileAttach, isLoading = false }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !isLoading) {
      e.preventDefault();
      onSend(e as React.FormEvent);
    }
  };

  return (
    <div className="mb-4 sticky">
      <div className="relative">
        <Textarea
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[80px] max-h-[320px] resize-none pb-16 rounded-2xl px-4 pt-4"
          rows={3}
        />
        <div className="absolute bottom-2 w-full flex justify-between px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={onFileAttach}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            onClick={(e) => onSend(e)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-8 w-8 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}