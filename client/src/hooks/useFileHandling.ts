/**
 * Custom hook for file handling logic
 */

import { useRef } from "react";
import { validateFiles, createFileList, showFileValidationError } from "@/lib/file-utils";

interface UseFileHandlingProps {
  onFileSelect?: (files: FileList | null) => void;
}

export function useFileHandling({ onFileSelect }: UseFileHandlingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validation = validateFiles(files);

      if (validation.hasErrors) {
        showFileValidationError(validation.oversizedFiles);
      }

      if (validation.validFiles.length > 0) {
        const validFileList = createFileList(validation.validFiles);
        onFileSelect?.(validFileList);
      }
    }

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processDroppedFiles = (files: FileList) => {
    if (files.length > 0) {
      const validation = validateFiles(files);

      if (validation.hasErrors) {
        showFileValidationError(validation.oversizedFiles);
      }

      if (validation.validFiles.length > 0) {
        const validFileList = createFileList(validation.validFiles);
        onFileSelect?.(validFileList);
      }
    }
  };

  return {
    fileInputRef,
    triggerFileSelect,
    handleFileChange,
    processDroppedFiles,
  };
}
