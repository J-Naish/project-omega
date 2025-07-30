"use client";

import { MessageArea } from "@/components/chat/message/message-area";
import ChatInput from "@/components/chat/chat-input";
import { useChatInterface } from "@/hooks/useChatInterface";
import { ContentPanelProvider } from "@/components/chat/content-panel/content-panel-context";
import { ContentPanel } from "@/components/chat/content-panel/content-panel";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

/**
 * Main chat interface component
 */
export default function ChatInterface() {
  const {
    messages,
    input,
    status,
    error,
    attachedFiles,
    handleInputChange,
    handleSubmitWithFiles,
    handleFileSelect,
    handleRemoveFile,
    handleClearInput,
    reload,
  } = useChatInterface();

  return (
    <SidebarProvider defaultOpen={false}>
      <ContentPanelProvider>
        <div className="flex h-screen w-full">
          <SidebarInset className="flex-1">
            <div className="relative h-full max-w-4xl px-4 mx-auto">
              <div className="h-full pb-32 overflow-hidden">
                <MessageArea messages={messages} status={status} error={error} onRetry={reload} />
              </div>
              <div className="fixed bottom-0 left-0 right-0 bg-background">
                <div className="max-w-4xl px-4 mx-auto">
                  <ChatInput
                    input={input}
                    setInput={handleInputChange}
                    onSend={handleSubmitWithFiles}
                    onFileSelect={handleFileSelect}
                    attachedFiles={attachedFiles}
                    onRemoveFile={handleRemoveFile}
                    onClearInput={handleClearInput}
                    status={status}
                  />
                </div>
              </div>
            </div>
          </SidebarInset>
          <ContentPanel />
        </div>
      </ContentPanelProvider>
    </SidebarProvider>
  );
}
