"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";

export function FileInput({ onChange }: { onChange: (files: File[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onChange(Array.from(files));
    }
  };

  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        multiple
        accept={".pdf,.txt,.md,.doc,.docx,.rtf,.csv,.json,.xml,.html,.htm,image/*"}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        type="button"
        className="cursor-pointer border"
      >
        <Paperclip />
      </Button>
    </>
  );
}
