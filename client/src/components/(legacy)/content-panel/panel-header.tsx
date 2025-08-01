import React, { useState } from "react";
import { X, Copy, Eye, Check } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface PanelHeaderProps {
  title: string;
  onCopy: () => Promise<void>;
  onClose: () => void;
}

export function PanelHeader({ title, onCopy, onClose }: PanelHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setIsCopied(true);

    // Reset icon after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <SidebarHeader className="flex-row items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 cursor-pointer"
          title={isCopied ? "Copied!" : "Copy content"}
        >
          {isCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 cursor-pointer"
          title="Close panel"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </SidebarHeader>
  );
}
