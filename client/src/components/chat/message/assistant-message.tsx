import { Fragment } from "react";
import { type Message } from "ai";
import Markdown from "./markdown";
import ToolInvocation from "./tool-invocation";

export default function AssistantMessage({ message }: { message: Message }) {
  return (
    <div>
      {message.parts?.map((part, index) => (
        <Fragment key={index}>
          {part.type === "text" && <Markdown>{part.text}</Markdown>}
          {part.type === "tool-invocation" && <ToolInvocation part={part} />}
        </Fragment>
      ))}
    </div>
  );
}
