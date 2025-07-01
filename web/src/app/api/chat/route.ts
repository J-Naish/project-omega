import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { systemPrompt } from "./systemPrompt";

export async function POST(req: Request) {

  const transport = new Experimental_StdioMCPTransport({
    command: "node",
    args: ["/Users/nash/production/vertex/project-omega/mcp-servers/notion/bin/cli.mjs"],
    env: {
      OPENAPI_MCP_HEADERS: JSON.stringify({
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28"
      })
    }
  });

  const mcpClient = await createMCPClient({
    transport,
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
