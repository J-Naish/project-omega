"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onFileAttach?: () => void;
}

export function ChatInput({ input, setInput, onSend, onFileAttach }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4">
      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[60px] max-h-[200px] resize-none pr-20 pl-12"
          rows={3}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 bottom-2 h-8 w-8"
          onClick={onFileAttach}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSend}
          disabled={!input.trim()}
          size="icon"
          className="absolute right-2 bottom-2 h-8 w-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}