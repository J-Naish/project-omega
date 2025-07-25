"use client";

import { useRef, useCallback, useEffect, KeyboardEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onFileAttach?: () => void;
  status: "submitted" | "streaming" | "ready" | "error";
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  onFileAttach,
  status,
}: ChatInputProps) {
  const isLoading = status === "submitted" || status === "streaming";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !isLoading) {
      e.preventDefault();
      onSend(e as React.FormEvent);
    }
  };

  return (
    <div className="mb-4">
      <form className="w-full divide-y overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-gray-700 transition-colors">
        <AIInputTextarea value={input} onChange={setInput} onKeyDown={handleKeyDown} />
        <AIInputToolbar>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFileAttach}
            className="cursor-pointer border"
          >
            <Paperclip />
          </Button>
          <Button
            size="icon"
            onClick={e => onSend(e)}
            disabled={!input.trim() || isLoading}
            className="cursor-pointer"
          >
            <Send />
          </Button>
        </AIInputToolbar>
      </form>
    </div>
  );
}

const useAutoResizeTextarea = ({
  minHeight,
  maxHeight,
}: {
  minHeight: number;
  maxHeight: number;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;
      // Calculate new height
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );
  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);
  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);
  return { textareaRef, adjustHeight };
};

function AIInputTextarea({ onChange, ...props }: React.ComponentProps<typeof Textarea>) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 64,
    maxHeight: 400,
  });

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = e => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Textarea
      className={cn(
        "w-full resize-none rounded-none border-none p-4 shadow-none outline-none ring-0",
        "bg-transparent dark:bg-transparent",
        "focus-visible:ring-0"
      )}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--muted-foreground) transparent",
      }}
      onChange={e => {
        adjustHeight();
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      placeholder="Type your message..."
      ref={textareaRef}
      {...props}
    />
  );
}

function AIInputToolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between px-4 py-4">{children}</div>;
}
