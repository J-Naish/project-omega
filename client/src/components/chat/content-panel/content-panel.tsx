"use client";

import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useContentPanel } from "./content-panel-context";
import { PanelHeader } from "./panel-header";
import { ContentViewer } from "./content-viewer";
import { useEffect } from "react";

export function ContentPanel() {
  const { isOpen, currentContent, closePanel } = useContentPanel();
  const { setOpen } = useSidebar();

  // Sync the sidebar state with content panel state
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen, setOpen]);

  const handleCopy = async () => {
    if (currentContent?.content) {
      await navigator.clipboard.writeText(currentContent.content);
    }
  };

  if (!currentContent) return null;

  return (
    <Sidebar side="right" variant="floating" collapsible="offcanvas" className="w-96">
      <PanelHeader title={currentContent.title} onCopy={handleCopy} onClose={closePanel} />
      <SidebarContent className="p-4">
        <ContentViewer
          content={currentContent.content}
          type={currentContent.type}
          language={currentContent.language}
        />
      </SidebarContent>
    </Sidebar>
  );
}
