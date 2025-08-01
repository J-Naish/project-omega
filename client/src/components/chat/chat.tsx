"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import InputBox from "./input-box/input-box";

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef(null);

  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full max-w-6xl flex flex-col bg-yellow-50">
      <div className="flex-1">{/* Message Area */}</div>
      <div className="sticky bottom-0 pb-6 bg-pink-50">
        <InputBox
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
      <Sidebar side="right" collapsible="offcanvas" variant="sidebar"></Sidebar>
    </div>
  );
}
