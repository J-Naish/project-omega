import Image from "next/image";
import { type Message } from "ai";

export default function ToolInvocation({ part }: { part: NonNullable<Message["parts"]>[number] }) {
  if (part.type !== "tool-invocation") return null;

  const { toolName, state } = part.toolInvocation;

  return (
    <div className="my-2 p-4 border rounded-2xl">
      <div className="flex items-center gap-2">
        <Icon toolName={toolName} />
        <span className="text-sm font-medium text-blue-700">
          {state === "partial-call" && `Calling ${toolName}...`}
          {state === "call" && `Executing ${toolName}...`}
          {state === "result" && `${toolName} completed`}
        </span>
      </div>
      {state === "result" && part.toolInvocation.result && (
        <div className="mt-1 text-xs text-gray-600">
          <details className="cursor-pointer">
            <summary>View result</summary>
            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {typeof part.toolInvocation.result === "string"
                ? part.toolInvocation.result
                : JSON.stringify(part.toolInvocation.result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function Icon({ toolName }: { toolName: string }) {
  let src: string;
  switch (toolName) {
    case "webSearch":
      src = "/web.png";
    case "slack":
      src = "/slack.png";
    case "notion":
      src = "/notion.png";
    case "gdrive":
      src = "/gdrive.png";
    case "gsheets":
      src = "/gsheets.png";
    default:
      src = "/utility.png";
  }

  return <Image alt="web-search" src={src} width={24} height={24} />;
}
