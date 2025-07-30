import React from "react";

interface ContentRendererProps {
  content: string;
  language?: string;
}

interface ContentRendererPropsBase {
  content: string;
}

export function CodeRenderer({ content, language }: ContentRendererProps) {
  return (
    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
      <code className={`language-${language || "text"}`}>{content}</code>
    </pre>
  );
}

export function JsonRenderer({ content }: ContentRendererPropsBase) {
  try {
    const formatted = JSON.stringify(JSON.parse(content), null, 2);
    return (
      <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
        <code className="language-json">{formatted}</code>
      </pre>
    );
  } catch {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
        Invalid JSON content
      </div>
    );
  }
}

export function TableRenderer({ content }: ContentRendererPropsBase) {
  return (
    <div className="overflow-auto">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export function TextRenderer({ content }: ContentRendererPropsBase) {
  return (
    <div className="whitespace-pre-wrap p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
      {content}
    </div>
  );
}
