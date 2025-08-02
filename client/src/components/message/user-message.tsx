import { Card } from "@/components/ui/card";
import { type UIMessage } from "ai";

export default function UserMessage({ message }: { message: UIMessage }) {
  if (message.role !== "user") return null;

  return (
    <div className="max-w-[80%] flex flex-col items-end space-y-2">
      {/* preview of user attached files */}

      {/* Message text card */}
      {message.content && (
        <Card className="p-4 bg-primary text-primary-foreground">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </Card>
      )}
    </div>
  );
}
