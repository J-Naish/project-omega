import { Fragment } from "react";
import { type UIMessage } from "ai";
import Markdown from "../markdown";
import ToolInvocation from "./tool-invocation";

export default function AssistantMessage({ message }: { message: UIMessage }) {
  return (
    <div className="w-full">
      {message.parts?.map((part, index) => (
        <Fragment key={index}>
          {part.type === "text" && <Markdown>{part.text}</Markdown>}
          {part.type === "tool-invocation" && <ToolInvocation part={part} />}
        </Fragment>
      ))}
    </div>
  );
}
