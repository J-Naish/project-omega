"use client";

import ChatTextarea from "./chat-textarea";
import ChatToolbar from "./chat-toolbar";
import FilePreview from "./file-preview";

interface InputBoxProps {
  input: string;
  files: File[];
  onRemoveFile: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileButtonClick: () => void;
  onSubmit: (e: React.FormEvent) => void;
  status: "submitted" | "streaming" | "ready" | "error";
}

export default function InputBox({
  input,
  files,
  onRemoveFile,
  fileInputRef,
  onFileChange,
  onFileButtonClick,
  onSubmit,
  status,
}: InputBoxProps) {
  return (
    <form>
      <div>
        <FilePreview files={files} onRemoveFile={onRemoveFile} />
        <ChatTextarea value={input} />
      </div>
      <ChatToolbar
        fileInputRef={fileInputRef}
        onFileChange={onFileChange}
        onFileButtonClick={onFileButtonClick}
        onSubmit={onSubmit}
        input={input}
        status={status}
      />
    </form>
  );
}
