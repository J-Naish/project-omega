"use client";

import { useCallback, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";

interface CodeContent {
  type: "code";
  title: string;
  content: string;
}

interface TextContent {
  type: "text";
  title: string;
  content: string;
}

interface FileContent {
  type: "file";
  title: string;
  content: File;
}

interface ToolContent {
  type: "tool";
  title: string;
  content: string;
}

type Content = CodeContent | TextContent | FileContent | ToolContent;

class ContentPanelStore {
  private content: Content | null = null;
  private listeners = new Set<() => void>();

  getContent = () => this.content;

  setContent = (newContent: Content | null) => {
    if (this.content !== newContent) {
      this.content = newContent;
      this.notifyListeners();
    }
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notifyListeners = () => {
    this.listeners.forEach(listener => listener());
  };
}

const contentPanelStore = new ContentPanelStore();

export function useContentPanel() {
  const { open, setOpen } = useSidebar();

  const content = useSyncExternalStore(
    contentPanelStore.subscribe,
    contentPanelStore.getContent,
    contentPanelStore.getContent
  );

  const setContent = useCallback((newContent: Content | null) => {
    contentPanelStore.setContent(newContent);
  }, []);

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return {
    content,
    setContent,
    open,
    setOpen,
    toggle,
  };
}

export default function ContentPanel() {
  const { content, setOpen } = useContentPanel();

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <div className="flex justify-between">
          <div />
          <Button variant="ghost" className="cursor-pointer" onClick={() => setOpen(false)}>
            <X />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-8 pb-8">
        {content && content.type !== "file" && <>{content.content}</>}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
