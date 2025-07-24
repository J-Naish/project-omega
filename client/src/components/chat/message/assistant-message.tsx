import { type Message } from "ai";
import Markdown from "./markdown";

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
      <Markdown>
        {message.content}
      </Markdown>
      {renderToolInvocations(message)}
    </div>
  );
}
