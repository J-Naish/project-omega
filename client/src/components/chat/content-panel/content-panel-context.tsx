"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ContentPanelItem {
  id: string;
  title: string;
  content: string;
  type: "code" | "text" | "table" | "json";
  language?: string;
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

interface ContentPanelProviderProps {
  children: React.ReactNode;
}

export function ContentPanelProvider({ children }: ContentPanelProviderProps) {
  const [currentContent, setCurrentContent] = useState<ContentPanelItem | null>(null);

  // Derive isOpen from currentContent to simplify state management
  const isOpen = currentContent !== null;

  const openContent = useCallback((item: ContentPanelItem) => {
    setCurrentContent(item);
  }, []);

  const closePanel = useCallback(() => {
    setCurrentContent(null);
  }, []);

  const contextValue = {
    isOpen,
    currentContent,
    openContent,
    closePanel,
  };

  return (
    <ContentPanelContext.Provider value={contextValue}>{children}</ContentPanelContext.Provider>
  );
}
