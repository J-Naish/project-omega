/**
 * File icon utilities for different file types
 */

import { FileText, Image, File } from "lucide-react";
import type { MessageAttachment } from "@/types/chat";

/**
 * Returns the appropriate icon component for a file type
 * @param attachment - File attachment object
 * @returns Lucide icon component
 */
export function getFileIcon(attachment: MessageAttachment | File) {
  let contentType: string | undefined;
  let fileName: string | undefined;

  if ("type" in attachment) {
    // File object
    contentType = attachment.type;
    fileName = attachment.name;
  } else {
    // MessageAttachment object
    contentType = attachment.contentType;
    fileName = attachment.name;
  }

  if (contentType?.startsWith("image/")) return Image;
  if (contentType === "application/pdf") return FileText;
  if (
    contentType?.startsWith("text/") ||
    contentType === "application/json" ||
    contentType === "text/csv" ||
    fileName?.endsWith(".md") ||
    fileName?.endsWith(".txt")
  ) {
    return FileText;
  }
  return File;
}

/**
 * Checks if a file is an image type
 * @param file - File or MessageAttachment object
 * @returns boolean indicating if file is an image
 */
export function isImageFile(file: File | MessageAttachment): boolean {
  const contentType = "type" in file ? file.type : file.contentType;
  return contentType?.startsWith("image/") ?? false;
}
