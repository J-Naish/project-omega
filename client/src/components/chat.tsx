"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import ChatInput from "./chat-input/chat-input";

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef(null);

  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full max-w-6xl flex flex-col">
      <div className="flex-1">{/* Message Area */}</div>
      <div className="sticky bottom-0 pb-6">
        <ChatInput
          input={input}
          files={files}
          fileInputRef={fileInputRef}
          onRemoveFile={() => {}}
          onFileChange={() => {}}
          onFileButtonClick={() => {}}
          status="submitted"
          onSubmit={() => {}}
        />
      </div>
      <Button onClick={toggleSidebar} className="fixed top-0 left-0">
        Sidebar
      </Button>
    </div>
  );
}
