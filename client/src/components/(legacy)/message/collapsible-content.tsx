import React from "react";
import { ChevronRight, Code, FileText, Table, Braces } from "lucide-react";
import { useContentPanel, type ContentPanelItem } from "../content-panel";

interface CollapsibleContentProps extends Omit<ContentPanelItem, "id"> {
  id: string;
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
    <div
      className="my-4 px-4 py-3 border rounded-lg cursor-pointer gap-2 bg-card text-card-foreground"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center gap-3 text-sm min-w-0">
          {getIcon()}
          <span className="font-medium">{getTypeLabel()}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="truncate">{title}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
      </div>

      {summary && <p className="text-sm mt-3 px-0 text-muted-foreground">{summary}</p>}

      {preview && (
        <div className="mt-3 px-3 py-2rounded font-mono text-xs overflow-hidden">
          <div className="line-clamp-2">{preview}</div>
        </div>
      )}
    </div>
  );
}
