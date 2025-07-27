import { Card } from "@/components/ui/card";
import { type Message } from "ai";

export default function UserMessage({ message }: { message: Message }) {
  if (message.role !== "user") return null;
  return (
    <Card className="max-w-[80%] p-4 bg-primary text-primary-foreground">
      <p className="whitespace-pre-wrap">{message.content}</p>
    </Card>
  );
}
