import { type Message } from "ai";
import Markdown from "./markdown";
import ToolInvocations from "./tool-invocations";

export default function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="max-w-[80%]">
      <Markdown>
        {message.content}
      </Markdown>
      <ToolInvocations message={message} />
    </div>
  );
}
