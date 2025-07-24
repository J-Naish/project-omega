import { Router, Request, Response } from 'express';
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { webSearch, webSearchDescription, webSearchUsage } from "../tools/web-search";

const router = Router();


const systemPrompt =
`You are a helpful productivity assistant. You have access to tools for managing tasks, communication, and web research:

${webSearchDescription}

**When to use each tool:**
${webSearchUsage}

Always prioritize using the most appropriate tools for the user's request. For any information that might be time-sensitive or recent, use web search first.
`;


router.post('/', async (req: Request, res: Response) => {
  console.log('チャットAPIが呼ばれました');
  console.log('リクエスト概要:', req.method, req.url);
  console.log('リクエストヘッダー:', req.headers);
  console.log('リクエストボディのキー:', Object.keys(req.body || {}));

  try {
    // console.log('Creating Notion transport...');
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

    // console.log('Creating Notion MCP client...');
    // const notionMcpClient = await createMCPClient({
    //   transport: notionTransport,
    // });

    // console.log('Getting Notion tools...');
    // const notionTools = await notionMcpClient.tools();
    // console.log('Notion tools loaded:', Object.keys(notionTools));

    // console.log('Creating Slack transport...');
    // const slackTransport = new Experimental_StdioMCPTransport({
    //   command: "node",
    //     args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/slack/dist/index.js`],
    //     env: {
    //       SLACK_TEAM_ID: process.env.SLACK_TEAM_ID!,
    //       SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
    //     }
    // });

    // console.log('Creating Slack MCP client...');
    // const slackMcpClient = await createMCPClient({
    //   transport: slackTransport,
    // });

    // console.log('Getting Slack tools...');
    // const slackTools = await slackMcpClient.tools();
    // console.log('Slack tools loaded:', Object.keys(slackTools));

    // console.log('Creating Google Drive transport...');
    // const gdriveTransport = new Experimental_StdioMCPTransport({
    //   command: "node",
    //   args: [`${process.env.PROJECT_PATH}/project-omega/mcp-servers/gdrive/dist/index.js`],
    // });

    // console.log('Creating Google Drive MCP client...');
    // const gdriveMcpClient = await createMCPClient({
    //   transport: gdriveTransport,
    // });

    // console.log('Getting Google Drive tools...');
    // const gdriveTools = await gdriveMcpClient.tools();
    // console.log('Google Drive tools loaded:', Object.keys(gdriveTools));

    const tools = {
      // ...notionTools,
      // ...slackTools,
      // ...gdriveTools,
      webSearch
    };
    console.log('ツール一覧:', Object.keys(tools));

    const { messages } = req.body;
    console.log("メッセージ", messages[messages.length - 1]);

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      messages,
      system: systemPrompt,
      tools,
      maxSteps: 5,
      toolCallStreaming: true,
      onChunk: ({ chunk }) => {
        if (chunk.type === 'tool-call') {
          console.log(`ツール: ${chunk.toolName}`);
        } else if (chunk.type === 'tool-result') {
          console.log(`ツールコールID: ${chunk.toolCallId}`);
        }
      },
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          console.log(`${toolCalls.length}のツールコールの結果、ステップ終了`);
        }
      },
      onFinish: () => {
        console.log('ストリーム終了');
        // notionMcpClient.close();
        // slackMcpClient.close();
        // gdriveMcpClient.close();
      },
      onError: (error) => {
        console.error('ストリームエラー:', error);
        // notionMcpClient.close();
        // slackMcpClient.close();
        // gdriveMcpClient.close();
      }
    });

    console.log('ストリームを送信');
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error('チャットAPIエラー:', error);
    return res.status(500).json({ error: 'サーバーエラー' });
  }
});

export default router;