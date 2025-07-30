"use client";

import React, { createContext, useContext, useState } from "react";

interface ContentPanelItem {
  id: string;
  title: string;
  content: string;
  type: "code" | "text" | "table" | "json";
  language?: string; // for code blocks
}

interface ContentPanelContextType {
  isOpen: boolean;
  currentContent: ContentPanelItem | null;
  openContent: (item: ContentPanelItem) => void;
  closePanel: () => void;
}

const ContentPanelContext = createContext<ContentPanelContextType | null>(null);

export function useContentPanel() {
  const context = useContext(ContentPanelContext);
  if (!context) {
    throw new Error("useContentPanel must be used within ContentPanelProvider");
  }
  return context;
}

export function ContentPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentPanelItem | null>(null);

  const openContent = (item: ContentPanelItem) => {
    setCurrentContent(item);
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
    setCurrentContent(null);
  };

  return (
    <ContentPanelContext.Provider
      value={{
        isOpen,
        currentContent,
        openContent,
        closePanel,
      }}
    >
      {children}
    </ContentPanelContext.Provider>
  );
}
