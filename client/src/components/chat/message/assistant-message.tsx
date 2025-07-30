import { Fragment } from "react";
import { type Message } from "ai";
import EnhancedMarkdown from "./enhanced-markdown";
import ToolInvocation from "./tool-invocation";

export default function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="w-full">
      {message.parts?.map((part, index) => (
        <Fragment key={index}>
          {part.type === "text" && <EnhancedMarkdown>{part.text}</EnhancedMarkdown>}
          {part.type === "tool-invocation" && <ToolInvocation part={part} />}
        </Fragment>
      ))}
    </div>
  );
}
