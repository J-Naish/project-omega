/**
 * File handling utilities for chat attachments
 */

export interface FileValidationResult {
  validFiles: File[];
  oversizedFiles: string[];
  hasErrors: boolean;
}

/**
 * Maximum file size allowed for attachments (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Supported file types for attachments
 */
export const SUPPORTED_FILE_TYPES = [
  ".pdf",
  ".txt",
  ".md",
  ".doc",
  ".docx",
  ".rtf",
  ".csv",
  ".json",
  ".xml",
  ".html",
  ".htm",
  "image/*",
].join(",");

/**
 * Validates files against size and type constraints
 * @param files - FileList to validate
 * @returns ValidationResult with valid files and error information
 */
export function validateFiles(files: FileList): FileValidationResult {
  const validFiles: File[] = [];
  const oversizedFiles: string[] = [];

  Array.from(files).forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      oversizedFiles.push(file.name);
    } else {
      validFiles.push(file);
    }
  });

  return {
    validFiles,
    oversizedFiles,
    hasErrors: oversizedFiles.length > 0,
  };
}

/**
 * Creates a FileList from an array of Files using DataTransfer API
 * @param files - Array of File objects
 * @returns FileList containing the files
 */
export function createFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Shows user-friendly error message for file validation errors
 * @param oversizedFiles - Array of filenames that exceeded size limit
 */
export function showFileValidationError(oversizedFiles: string[]): void {
  if (oversizedFiles.length > 0) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    alert(`The following files are too large (max ${maxSizeMB}MB): ${oversizedFiles.join(", ")}`);
  }
}
