"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";

export function FileInput({
  fileInputRef,
  onChange,
  onClick,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
}) {
  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        onChange={onChange}
        className="hidden"
        multiple
        accept={".pdf,.txt,.md,.doc,.docx,.rtf,.csv,.json,.xml,.html,.htm,image/*"}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        type="button"
        className="cursor-pointer border"
      >
        <Paperclip />
      </Button>
    </>
  );
}
