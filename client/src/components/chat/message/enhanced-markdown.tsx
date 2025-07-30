import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CollapsibleContent } from "./collapsible-content";

interface EnhancedMarkdownProps {
  children: string | null | undefined;
}

export default function EnhancedMarkdown({ children }: EnhancedMarkdownProps) {
  if (!children) return null;

  // Process the markdown content to identify collapsible sections
  const processedContent = processCollapsibleContent(children);

  return (
    <div>
      {processedContent.map((section, index) => {
        if (section.type === "collapsible") {
          return (
            <CollapsibleContent
              key={`collapsible-${index}`}
              id={`content-${Date.now()}-${index}`}
              title={section.title || "Collapsible Content"}
              content={section.content}
              type={section.contentType || "text"}
              language={section.language}
              summary={section.summary}
              preview={section.preview}
            />
          );
        } else {
          return (
            <ReactMarkdown
              key={`markdown-${index}`}
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <H1>{children}</H1>,
                h2: ({ children }) => <H2>{children}</H2>,
                h3: ({ children }) => <H3>{children}</H3>,
                h4: ({ children }) => <H4>{children}</H4>,
                h5: ({ children }) => <H5>{children}</H5>,
                h6: ({ children }) => <H6>{children}</H6>,
                p: ({ children }) => <P>{children}</P>,
                pre: ({ children }) => <Pre>{children}</Pre>,
                code: ({ className, children, ...props }) => (
                  <Code className={className} {...props}>
                    {children}{" "}
                  </Code>
                ),
                a: ({ href, children }) => <A href={href}>{children}</A>,
                ul: ({ children }) => <Ul>{children}</Ul>,
                ol: ({ children }) => <Ol>{children}</Ol>,
                li: ({ children }) => <Li>{children}</Li>,
                blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
                table: ({ children }) => <Table>{children}</Table>,
                th: ({ children }) => <Th>{children}</Th>,
                td: ({ children }) => <Td>{children}</Td>,
              }}
            >
              {section.content}
            </ReactMarkdown>
          );
        }
      })}
    </div>
  );
}

// Process content to identify collapsible sections
function processCollapsibleContent(content: string) {
  const sections: Array<{
    type: "normal" | "collapsible";
    content: string;
    title?: string;
    contentType?: "code" | "text" | "table" | "json";
    language?: string;
    summary?: string;
    preview?: string;
  }> = [];

  // Look for collapsible markers added by AI
  const collapsibleRegex = /<!--COLLAPSIBLE:(.*?)-->([\s\S]*?)<!--\/COLLAPSIBLE-->/g;
  let lastIndex = 0;
  let match;

  while ((match = collapsibleRegex.exec(content)) !== null) {
    // Add normal content before this collapsible section
    if (match.index > lastIndex) {
      const normalContent = content.slice(lastIndex, match.index).trim();
      if (normalContent) {
        sections.push({
          type: "normal",
          content: normalContent,
        });
      }
    }

    // Parse collapsible metadata
    try {
      const metadata = JSON.parse(match[1]);
      const collapsibleContent = match[2].trim();

      sections.push({
        type: "collapsible",
        content: collapsibleContent,
        title: metadata.title,
        contentType: metadata.type,
        language: metadata.language,
        summary: metadata.summary,
        preview: collapsibleContent.slice(0, 100) + (collapsibleContent.length > 100 ? "..." : ""),
      });
    } catch {
      // If parsing fails, treat as normal content
      sections.push({
        type: "normal",
        content: match[0],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining normal content
  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex).trim();
    if (remainingContent) {
      sections.push({
        type: "normal",
        content: remainingContent,
      });
    }
  }

  // If no collapsible sections found, return the original content as normal
  if (sections.length === 0) {
    sections.push({
      type: "normal",
      content,
    });
  }

  return sections;
}

// Original markdown components
function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>;
}

function H4({ children }: { children: React.ReactNode }) {
  return <h4 className="text-base font-semibold mb-2 mt-3">{children}</h4>;
}

function H5({ children }: { children: React.ReactNode }) {
  return <h5 className="text-sm font-semibold mb-1 mt-2">{children}</h5>;
}

function H6({ children }: { children: React.ReactNode }) {
  return <h6 className="text-sm font-semibold mb-1 mt-2">{children}</h6>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4">{children}</p>;
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto my-4 text-gray-900 dark:text-gray-100">
      {children}
    </pre>
  );
}

function Code({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match;
  return isInline ? (
    <code
      className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100"
      {...props}
    >
      {children}
    </code>
  ) : (
    <code className="text-sm font-mono text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </code>
  );
}

function A({ href, children }: { href?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 space-y-1">{children}</ul>;
}

function Ol({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal pl-6 space-y-1">{children}</ol>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="ml-2">{children}</li>;
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{children}</td>;
}
