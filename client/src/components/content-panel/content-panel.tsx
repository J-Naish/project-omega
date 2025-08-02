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

export function useContentPanel() {
  const [content, setContent] = useState("");

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
        <Markdown>{content}</Markdown>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
