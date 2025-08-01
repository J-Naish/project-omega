/**
 * Auto-resizing textarea component for chat input
 */

import { useRef, useCallback, useEffect, KeyboardEventHandler } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FilePreview } from "./FilePreview";

interface ChatInputTextareaProps extends React.ComponentProps<typeof Textarea> {
  attachedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

/**
 * Hook for auto-resizing textarea functionality
 */
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

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
}

/**
 * Auto-resizing textarea with file preview support
 */
export function ChatInputTextarea({
  onChange,
  attachedFiles = [],
  onRemoveFile,
  ...props
}: ChatInputTextareaProps) {
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
    <div className="relative">
      <FilePreview files={attachedFiles} onRemoveFile={onRemoveFile} />
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
    </div>
  );
}
