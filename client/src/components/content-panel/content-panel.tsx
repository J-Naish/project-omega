"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import Markdown from "../markdown";

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

export function useContentPanel() {
  const [content, setContent] = useState<Content | null>(null);

  const { open, setOpen } = useSidebar();

  const toggle = () => {
    setOpen(!open);
  };

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
        {content && content.type !== "file" && <Markdown>{content.content}</Markdown>}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
