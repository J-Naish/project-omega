import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function SendButton({
  onClick,
  input,
  status,
}: {
  onClick: (e: React.FormEvent) => void;
  input: string;
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  const isLoading = status === "submitted" || status === "streaming";
  return (
    <Button
      size="icon"
      onClick={onClick}
      disabled={!input.trim() || isLoading}
      className="cursor-pointer"
    >
      <Send className="w-4 h-4" />
    </Button>
  );
}
