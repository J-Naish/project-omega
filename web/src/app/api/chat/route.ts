import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { systemPrompt } from "../systemPrompt";

export async function POST(req: Request) {

  const mcpClient = await createMCPClient({
    transport: {
      type: "sse",
      url: ""
    }
  });

  const { messages } = await req.json();

  const tools = await mcpClient.tools();

  const result = streamText({
    model: anthropic("claude-3-7-sonnet-20250219"),
    messages,
    system: systemPrompt,
    tools,
    onFinish: ()=> {
      mcpClient.close();
    },
  });

  return result.toDataStreamResponse();
}
