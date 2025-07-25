import Image from "next/image";
import { type Message } from "ai";

export default function ToolInvocation({ part }: { part: NonNullable<Message["parts"]>[number] }) {
  if (part.type !== "tool-invocation") return null;

  const { toolName, state } = part.toolInvocation;

  return (
    <div
      className={`my-2 relative w-full ${state !== "result" ? "overflow-hidden" : ""} rounded-2xl z-0`}
    >
      {state !== "result" && (
        <div className="absolute inset-[-40px] bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 animate-[spin_3s_linear_infinite] blur-[160px] shadow-[0_-3px_12px_0_rgb(186,66,255),0_3px_12px_0_rgb(0,225,255)]" />
      )}
      <div
        className={`relative z-10 p-4 bg-background rounded-2xl ${state !== "result" ? "m-[1px]" : "border"}`}
      >
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
      <span className={`font-medium ${state !== "result" ? "animate-pulse" : ""}`}>
        {state === "partial-call" && `Calling ${label}...`}
        {state === "call" && `Executing ${label}...`}
        {state === "result" && `${label} completed`}
      </span>
    </div>
  );
}
