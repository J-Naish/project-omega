"use client";

import { X, Copy, Eye } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useContentPanel } from "./content-panel-context";
import { useEffect } from "react";

export function ContentPanel() {
  const { isOpen, currentContent, closePanel } = useContentPanel();
  const { setOpen } = useSidebar();

  // Sync the sidebar state with content panel state
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen, setOpen]);

  const copyToClipboard = async () => {
    if (currentContent?.content) {
      await navigator.clipboard.writeText(currentContent.content);
    }
  };

  const renderContent = () => {
    if (!currentContent) return null;

    switch (currentContent.type) {
      case "code":
        return (
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
            <code className={`language-${currentContent.language || "text"}`}>
              {currentContent.content}
            </code>
          </pre>
        );
      case "json":
        return (
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
            <code className="language-json">
              {JSON.stringify(JSON.parse(currentContent.content), null, 2)}
            </code>
          </pre>
        );
      case "table":
        return (
          <div className="overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
          </div>
        );
      default:
        return (
          <div className="whitespace-pre-wrap p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {currentContent.content}
          </div>
        );
    }
  };

  if (!currentContent) return null;

  return (
    <Sidebar side="right" variant="floating" collapsible="offcanvas" className="w-96">
      <SidebarHeader className="flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <h3 className="font-semibold text-sm">{currentContent.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0">
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={closePanel} className="h-8 w-8 p-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">{renderContent()}</SidebarContent>
    </Sidebar>
  );
}
