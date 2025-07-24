import { type Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AssistantMessage({ message }: { message: Message }) {

  const renderToolInvocations = (message: Message) => {
    if (!message.parts || message.parts.length === 0) return null;

    return message.parts.map((part, index) => {
      if (part.type === 'tool-invocation') {
        const { toolName, state } = part.toolInvocation;

        return (
          <div key={index} className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">
                {state === 'partial-call' && `Calling ${toolName}...`}
                {state === 'call' && `Executing ${toolName}...`}
                {state === 'result' && `${toolName} completed`}
              </span>
            </div>
            {state === 'result' && part.toolInvocation.result && (
              <div className="mt-1 text-xs text-gray-600">
                <details className="cursor-pointer">
                  <summary>View result</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {typeof part.toolInvocation.result === 'string' 
                      ? part.toolInvocation.result 
                      : JSON.stringify(part.toolInvocation.result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="max-w-[80%]">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold mb-2 mt-3">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-semibold mb-1 mt-2">{children}</h5>,
          h6: ({ children }) => <h6 className="text-sm font-semibold mb-1 mt-2">{children}</h6>,
          p: ({ children }) => <p className="mb-4">{children}</p>,
          pre: ({ children }) => (
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto my-4 text-gray-900 dark:text-gray-100">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100" {...props}>
                {children}
              </code>
            ) : (
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100" {...props}>
                {children}
              </code>
            );
          },
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-2">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
        }}
      >
        {message.content}
      </ReactMarkdown>
      {renderToolInvocations(message)}
    </div>
  );
}
