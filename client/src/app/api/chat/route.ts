import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { systemPrompt } from "./systemPrompt";
import { webSearch } from "./web-search";

export async function POST(req: Request) {
  console.log('[MCP] Starting API route...');

  try {
    console.log('[MCP] Creating Notion transport...');
    const notionTransport = new Experimental_StdioMCPTransport({
      command: "node",
      args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/notion/bin/cli.mjs`],
      env: {
        OPENAPI_MCP_HEADERS: JSON.stringify({
          "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28"
        })
      }
    });

    console.log('[MCP] Creating Notion MCP client...');
    const notionMcpClient = await createMCPClient({
      transport: notionTransport,
    });

    console.log('[MCP] Getting Notion tools...');
    const notionTools = await notionMcpClient.tools();
    console.log('[MCP] Notion tools loaded:', Object.keys(notionTools));

    console.log('[MCP] Creating Slack transport...');
    const slackTransport = new Experimental_StdioMCPTransport({
      command: "node",
        args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/slack/dist/index.js`],
        env: {
          SLACK_TEAM_ID: process.env.SLACK_TEAM_ID!,
          SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
        }
    });

    console.log('[MCP] Creating Slack MCP client...');
    const slackMcpClient = await createMCPClient({
      transport: slackTransport,
    });

    console.log('[MCP] Getting Slack tools...');
    const slackTools = await slackMcpClient.tools();
    console.log('[MCP] Slack tools loaded:', Object.keys(slackTools));

    console.log('[MCP] Creating Google Drive transport...');
    const gdriveTransport = new Experimental_StdioMCPTransport({
      command: "node",
      args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/gdrive/dist/index.js`],
    });

    console.log('[MCP] Creating Google Drive MCP client...');
    const gdriveMcpClient = await createMCPClient({
      transport: gdriveTransport,
    });

    console.log('[MCP] Getting Google Drive tools...');
    const gdriveTools = await gdriveMcpClient.tools();
    console.log('[MCP] Google Drive tools loaded:', Object.keys(gdriveTools));

    const tools = {
      ...notionTools,
      ...slackTools,
      ...gdriveTools,
      webSearch
    };
    console.log('[MCP] Combined tools:', Object.keys(tools));


    const { messages } = await req.json();
    console.log('[MCP] Processing request with messages:', messages.length);

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      messages,
      system: systemPrompt,
      tools,
      maxSteps: 5,
      toolCallStreaming: true,
      onChunk: ({ chunk }) => {
        if (chunk.type === 'tool-call') {
          console.log(`[MCP] Calling tool: ${chunk.toolName}`);
        } else if (chunk.type === 'tool-result') {
          console.log(`[MCP] Tool result received for: ${chunk.toolCallId}`);
        }
      },
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          console.log(`[MCP] Step completed with ${toolCalls.length} tool calls`);
        }
      },
      onFinish: () => {
        notionMcpClient.close();
        slackMcpClient.close();
        gdriveMcpClient.close();
      },
      onError: (error) => {
        console.error('[MCP] Stream error:', error);
        notionMcpClient.close();
        slackMcpClient.close();
        gdriveMcpClient.close();
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[MCP] API route error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
