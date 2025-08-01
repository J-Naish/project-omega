"use client";

import { useState, useRef } from "react";
import InputBox from "./input-box/input-box";

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef(null);

  return (
    <div className="w-full max-w-6xl flex flex-col">
      <div className="flex-1">{/* Message Area */}</div>
      <div className="sticky bottom-0 pb-6">
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
    </div>
  );
}
