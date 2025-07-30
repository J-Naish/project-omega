import React from "react";
import { ChevronRight, Code, FileText, Table, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContentPanel } from "../content-panel/content-panel-context";

interface CollapsibleContentProps {
  id: string;
  title: string;
  content: string;
  type: "code" | "text" | "table" | "json";
  language?: string;
  summary?: string;
  preview?: string;
}

export function CollapsibleContent({
  id,
  title,
  content,
  type,
  language,
  summary,
  preview,
}: CollapsibleContentProps) {
  const { openContent } = useContentPanel();

  const handleClick = () => {
    openContent({
      id,
      title,
      content,
      type,
      language,
    });
  };

  const getIcon = () => {
    switch (type) {
      case "code":
        return <Code className="w-4 h-4" />;
      case "json":
        return <Braces className="w-4 h-4" />;
      case "table":
        return <Table className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "code":
        return language ? `${language.toUpperCase()} Code` : "Code";
      case "json":
        return "JSON Data";
      case "table":
        return "Table";
      default:
        return "Text Content";
    }
  };

  return (
    <div className="my-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
      <Button
        variant="ghost"
        onClick={handleClick}
        className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 min-w-0">
            {getIcon()}
            <span className="font-medium">{getTypeLabel()}</span>
            <span className="text-xs">•</span>
            <span className="truncate">{title}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
        </div>
      </Button>

      {summary && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-0">{summary}</p>}

      {preview && (
        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-xs text-gray-500 dark:text-gray-400 font-mono overflow-hidden">
          <div className="line-clamp-2">{preview}</div>
        </div>
      )}
    </div>
  );
}
