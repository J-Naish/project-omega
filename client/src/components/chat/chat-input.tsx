"use client";

import { useRef, useCallback, useEffect, KeyboardEventHandler, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onFileSelect?: (files: FileList | null) => void;
  attachedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  status: "submitted" | "streaming" | "ready" | "error";
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  onFileSelect,
  attachedFiles = [],
  onRemoveFile,
  status,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    }
    onSend(e);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    onFileSelect?.(files);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-4">
      <form className="w-full overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-gray-700 transition-colors">
        <AIInputTextarea
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          attachedFiles={showPreviews ? attachedFiles : []}
          onRemoveFile={onRemoveFile}
        />
        <AIInputToolbar>
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".pdf,.txt,.md,.doc,.docx,.rtf,.csv,.json,.xml,.html,.htm,image/*"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileButtonClick}
            type="button"
            className="cursor-pointer border"
          >
            <Paperclip />
          </Button>
          <Button
            size="icon"
            onClick={e => handleFormSubmit(e)}
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

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith("image/")) return Image;
  if (type === "application/pdf") return FileText;
  if (
    type.startsWith("text/") ||
    type === "application/json" ||
    type === "text/csv" ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".txt")
  )
    return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface FileIconProps {
  file: File;
}

function FileIcon({ file }: FileIconProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (file.type.startsWith("image/") && imageSrc && !imageError) {
    return (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={file.name}
          className="h-8 w-8 rounded object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  const IconComponent = getFileIcon(file);
  return <IconComponent className="h-4 w-4 text-muted-foreground" />;
}

interface FilePreviewProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
}

function FilePreview({ files, onRemoveFile }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {files.map((file, index) => {
        return (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm"
          >
            <FileIcon file={file} />
            <div className="flex flex-col min-w-0">
              <span className="truncate max-w-32" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
            </div>
            {onRemoveFile && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AIInputTextarea({
  onChange,
  attachedFiles = [],
  onRemoveFile,
  ...props
}: React.ComponentProps<typeof Textarea> & {
  attachedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}) {
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

function AIInputToolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between px-4 py-4">{children}</div>;
}
