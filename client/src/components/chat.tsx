"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import ChatInput from "./chat-input";

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef(null);

  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full max-w-6xl flex flex-col">
      <div className="flex-1">{/* Message Area */}</div>
      <div className="sticky bottom-0 pb-6">
        <form className="rounded-2xl border focus-within:border-1 focus-within:border-blue-500 transition-all">
          <div>
            <ChatInput.FilePreview files={files} onRemoveFile={() => {}} />
            <ChatInput.Textarea value={input} onChange={e => setInput(e.target.value)} />
          </div>
          <ChatInput.Toolbar>
            <ChatInput.FileInput
              fileInputRef={fileInputRef}
              onFileChange={() => {}}
              onFileButtonClick={() => {}}
              status="submitted"
            />
            <ChatInput.SendButton onSubmit={() => {}} input={input} status="submitted" />
          </ChatInput.Toolbar>
        </form>
      </div>
      <Button onClick={toggleSidebar} className="fixed top-0 left-0">
        Sidebar
      </Button>
    </div>
  );
}
