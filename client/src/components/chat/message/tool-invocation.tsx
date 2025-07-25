import Image from "next/image";
import { type Message } from "ai";

export default function ToolInvocation({ part }: { part: NonNullable<Message["parts"]>[number] }) {
  if (part.type !== "tool-invocation") return null;

  const { toolName, state } = part.toolInvocation;

  return (
    <div className="my-2 p-4 border rounded-2xl">
      <Head toolName={toolName} state={state} />
      {state === "result" && part.toolInvocation.result && (
        <div className="mt-2 pl-8 text-xs text-muted-foreground">
          <details className="cursor-pointer">
            <summary>View result</summary>
            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
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

function Head({
  toolName,
  state,
}: {
  toolName: string;
  state: "partial-call" | "call" | "result";
}) {
  let src: string;
  let label: string;
  switch (toolName) {
    case "webSearch":
      src = "/web.png";
      label = "Web Search";
      break;
    case "slack":
      src = "/slack.png";
      label = "Slack";
      break;
    case "notion":
      src = "/notion.png";
      label = "Notion";
      break;
    case "gdrive":
      src = "/gdrive.png";
      label = "Google Drive";
      break;
    case "gsheets":
      src = "/gsheets.png";
      label = "Google Sheets";
      break;
    default:
      src = "/utility.png";
      label = toolName;
  }

  return (
    <div className="flex items-center gap-2">
      <Image alt={`${toolName} icon`} src={src} width={24} height={24} />
      <span className="font-semibold">
        {state === "partial-call" && `Calling ${label}...`}
        {state === "call" && `Executing ${label}...`}
        {state === "result" && `${label} completed`}
      </span>
    </div>
  );
}
