import Image from "next/image";
import { type Message } from "ai";

export default function ToolInvocation({ part }: { part: NonNullable<Message["parts"]>[number] }) {
  if (part.type !== "tool-invocation") return null;

  const { toolName, state, args } = part.toolInvocation;

  console.log(part.toolInvocation);

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
        <Head toolName={toolName} state={state} query={args?.query} action={args?.action} />
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
  query,
  action,
}: {
  toolName: string;
  state: "partial-call" | "call" | "result";
  query?: string;
  action?: string;
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
    case "googleDrive":
      src = "/google-drive.png";
      label = "Google Drive";
      break;
    case "googleSheets":
      src = "/google-sheets.png";
      label = "Google Sheets";
      break;
    default:
      src = "/utility.png";
      label = toolName;
  }

  return (
    <div className="flex items-center gap-2">
      <Image alt={`${toolName} icon`} src={src} width={24} height={24} />
      {state === "partial-call" && (
        <span className="animate-pulse font-medium">{`Calling ${label}...`}</span>
      )}
      {state === "call" && (
        <span className="animate-pulse font-medium">{`Executing ${label}...`}</span>
      )}
      {state === "result" && (
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-medium">{`${label} completed`}</span>
          {query && <span className="text-xs text-muted-foreground truncate">{query}</span>}
          {action && <span className="text-xs text-muted-foreground truncate">{action}</span>}
        </div>
      )}
    </div>
  );
}
