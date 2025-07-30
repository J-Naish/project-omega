import React from "react";
import { CodeRenderer, JsonRenderer, TableRenderer, TextRenderer } from "./content-renderers";

interface ContentViewerProps {
  content: string;
  type: "code" | "text" | "table" | "json";
  language?: string;
}

export function ContentViewer({ content, type, language }: ContentViewerProps) {
  switch (type) {
    case "code":
      return <CodeRenderer content={content} language={language} />;
    case "json":
      return <JsonRenderer content={content} />;
    case "table":
      return <TableRenderer content={content} />;
    default:
      return <TextRenderer content={content} />;
  }
}
