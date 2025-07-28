/**
 * Custom hook for drag and drop functionality
 */

import { useState } from "react";
import type { DragDropHandlers } from "@/types/chat";

interface UseDragAndDropProps {
  onDrop: (files: FileList) => void;
}

export function useDragAndDrop({ onDrop }: UseDragAndDropProps): DragDropHandlers {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onDrop(files);
    }
  };

  return {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    isDragOver,
  };
}
