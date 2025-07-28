/**
 * File preview component for chat input
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getFileIcon, isImageFile } from "@/lib/file-icons";
import { formatFileSize } from "@/lib/file-utils";
import type { FilePreviewProps } from "@/types/chat";

interface FileItemPreviewProps {
  file: File;
  index: number;
  onRemove?: (index: number) => void;
}

/**
 * Individual file preview item component
 */
function FileItemPreview({ file, index, onRemove }: FileItemPreviewProps) {
  const [imageError, setImageError] = useState(false);

  if (isImageFile(file) && !imageError) {
    const imageSrc = URL.createObjectURL(file);

    return (
      <div className="relative w-48 h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={file.name || "Attached image"}
          className="w-full h-full rounded object-cover"
          onError={() => setImageError(true)}
          onLoad={() => URL.revokeObjectURL(imageSrc)}
        />
        <div className="absolute inset-0 rounded pointer-events-none border-1 border-white/10" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b">
          <span className="truncate block" title={file.name || "Image"}>
            {file.name || "Image"}
          </span>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer bg-black/20"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  const IconComponent = getFileIcon(file);

  return (
    <div className="relative w-48 h-32">
      <div className="flex flex-col items-center justify-center gap-2 bg-muted rounded-md p-3 text-sm w-full h-full">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
        <div className="text-center space-y-1">
          <span className="truncate text-xs max-w-full block" title={file.name}>
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
        </div>
      </div>
      <div className="absolute inset-0 rounded-md pointer-events-none border-1 border-white/20" />
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          onClick={() => onRemove(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * File preview container component
 */
export function FilePreview({ files, onRemoveFile }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {files.map((file, index) => (
        <FileItemPreview
          key={`${file.name}-${index}`}
          file={file}
          index={index}
          onRemove={onRemoveFile}
        />
      ))}
    </div>
  );
}
