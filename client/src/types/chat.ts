/**
 * TypeScript interfaces for chat components
 */

/**
 * Attachment object structure for AI SDK
 */
export interface MessageAttachment {
  name?: string;
  contentType?: string;
  url?: string;
}

/**
 * Chat status types
 */
export type ChatStatus = "submitted" | "streaming" | "ready" | "error";

/**
 * Props for ChatInput component
 */
export interface ChatInputProps {
  input: string;
  setInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onFileSelect?: (files: FileList | null) => void;
  attachedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  onClearInput?: () => void;
  status: ChatStatus;
}

/**
 * Props for file attachment components
 */
export interface FileAttachmentProps {
  attachment: MessageAttachment;
  onRemove?: () => void;
}

/**
 * Props for file preview components
 */
export interface FilePreviewProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
}

/**
 * Drag and drop handlers interface
 */
export interface DragDropHandlers {
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
}
