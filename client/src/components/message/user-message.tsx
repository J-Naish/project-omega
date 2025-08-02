"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { type Message } from "ai";
import { FileText, Image, File } from "lucide-react";

interface MessageAttachment {
  name?: string;
  contentType?: string;
  url?: string;
}

const getFileIcon = (attachment: MessageAttachment) => {
  const type = attachment.contentType;
  if (type?.startsWith("image/")) return Image;
  if (type === "application/pdf") return FileText;
  if (
    type?.startsWith("text/") ||
    type === "application/json" ||
    type === "text/csv" ||
    attachment.name?.endsWith(".md") ||
    attachment.name?.endsWith(".txt")
  )
    return FileText;
  return File;
};

function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  const [imageError, setImageError] = useState(false);

  if (attachment.contentType?.startsWith("image/") && attachment.url && !imageError) {
    return (
      <div className="relative w-48 h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name || "Attached image"}
          className="w-full h-full rounded object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 rounded pointer-events-none border-1 border-white/10" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b">
          <span className="truncate block" title={attachment.name || "Image"}>
            {attachment.name || "Image"}
          </span>
        </div>
      </div>
    );
  }

  const IconComponent = getFileIcon(attachment);
  return (
    <div className="relative w-48 h-32">
      <div className="flex flex-col items-center justify-center gap-2 bg-muted rounded-md p-3 text-sm w-full h-full">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
        <span
          className="truncate text-center text-xs max-w-full"
          title={attachment.name || "Attachment"}
        >
          {attachment.name || "Unnamed file"}
        </span>
      </div>
      <div className="absolute inset-0 rounded-md pointer-events-none border-1 border-white/20" />
    </div>
  );
}

export default function UserMessage({ message }: { message: Message }) {
  if (message.role !== "user") return null;

  // Access experimental_attachments from the message with proper typing
  const messageWithAttachments = message as Message & {
    experimental_attachments?: MessageAttachment[];
  };
  const attachments = messageWithAttachments.experimental_attachments;

  return (
    <div className="max-w-[80%] flex flex-col items-end space-y-2">
      {/* Show attachments above the message card */}
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end">
          {attachments.map((attachment, index) => (
            <AttachmentPreview key={`${attachment.name}-${index}`} attachment={attachment} />
          ))}
        </div>
      )}

      {/* Message text card */}
      {message.content && (
        <Card className="p-4 bg-primary text-primary-foreground">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </Card>
      )}
    </div>
  );
}
