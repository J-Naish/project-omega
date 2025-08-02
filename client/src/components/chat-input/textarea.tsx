"use client";

import { useRef, useCallback, useEffect } from "react";
import { Textarea as TextareaComponent } from "@/components/ui/textarea";

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

export function Textarea({ value, onChange }: React.ComponentProps<typeof TextareaComponent>) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 64,
    maxHeight: 400,
  });

  return (
    <TextareaComponent
      className="w-full resize-none rounded-none border-none p-4 shadow-none outline-none ring-0 focus-visible:ring-0"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--muted-foreground) transparent",
      }}
      onChange={e => {
        adjustHeight();
        onChange?.(e);
      }}
      value={value}
      placeholder="Type your message..."
      ref={textareaRef}
    />
  );
}
