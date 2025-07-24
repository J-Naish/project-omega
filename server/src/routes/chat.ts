import { Router, Request, Response } from 'express';
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { systemPrompt } from "../config/systemPrompt";
import { webSearch } from "../tools/web-search";

const router = Router();

// Simple test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Chat API is working', timestamp: new Date().toISOString() });
});

router.post('/', async (req: Request, res: Response) => {
  console.log('Starting API route...');
  console.log('Request received:', req.method, req.url);
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body || {}));

  try {
    // console.log('[MCP] Creating Notion transport...');
    // const notionTransport = new Experimental_StdioMCPTransport({
    //   command: "node",
    //   args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/notion/bin/cli.mjs`],
    //   env: {
    //     OPENAPI_MCP_HEADERS: JSON.stringify({
    //       "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
    //       "Notion-Version": "2022-06-28"
    //     })
    //   }
    // });

    // console.log('[MCP] Creating Notion MCP client...');
    // const notionMcpClient = await createMCPClient({
    //   transport: notionTransport,
    // });

    // console.log('[MCP] Getting Notion tools...');
    // const notionTools = await notionMcpClient.tools();
    // console.log('[MCP] Notion tools loaded:', Object.keys(notionTools));

    // console.log('[MCP] Creating Slack transport...');
    // const slackTransport = new Experimental_StdioMCPTransport({
    //   command: "node",
    //     args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/slack/dist/index.js`],
    //     env: {
    //       SLACK_TEAM_ID: process.env.SLACK_TEAM_ID!,
    //       SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
    //     }
    // });

    // console.log('[MCP] Creating Slack MCP client...');
    // const slackMcpClient = await createMCPClient({
    //   transport: slackTransport,
    // });

    // console.log('[MCP] Getting Slack tools...');
    // const slackTools = await slackMcpClient.tools();
    // console.log('[MCP] Slack tools loaded:', Object.keys(slackTools));

    // console.log('[MCP] Creating Google Drive transport...');
    // const gdriveTransport = new Experimental_StdioMCPTransport({
    //   command: "node",
    //   args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/gdrive/dist/index.js`],
    // });

    // console.log('[MCP] Creating Google Drive MCP client...');
    // const gdriveMcpClient = await createMCPClient({
    //   transport: gdriveTransport,
    // });

    // console.log('[MCP] Getting Google Drive tools...');
    // const gdriveTools = await gdriveMcpClient.tools();
    // console.log('[MCP] Google Drive tools loaded:', Object.keys(gdriveTools));

    const tools = {
      // ...notionTools,
      // ...slackTools,
      // ...gdriveTools,
      webSearch
    };
    console.log('[MCP] Combined tools:', Object.keys(tools));

    const { messages } = req.body;
    console.log('[MCP] Processing request with messages:', messages?.length || 0);

    // Check if we have messages
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Check if Anthropic API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(process.env.ANTHROPIC_API_KEY);
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not set' });
    }

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
        console.log('[MCP] Stream finished');
        // notionMcpClient.close();
        // slackMcpClient.close();
        // gdriveMcpClient.close();
      },
      onError: (error) => {
        console.error('[MCP] Stream error:', error);
        // notionMcpClient.close();
        // slackMcpClient.close();
        // gdriveMcpClient.close();
      }
    });

    console.log('[MCP] Piping stream to response...');
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error('[MCP] API route error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;