import React from "react";
import { X, Copy, Eye } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface PanelHeaderProps {
  title: string;
  onCopy: () => Promise<void>;
  onClose: () => void;
}

export function PanelHeader({ title, onCopy, onClose }: PanelHeaderProps) {
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
          onClick={onCopy}
          className="h-8 w-8 p-0"
          title="Copy content"
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
          title="Close panel"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </SidebarHeader>
  );
}
