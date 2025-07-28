import { Router, Request, Response } from "express";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { webSearch, webSearchDescription, webSearchUsage } from "../tools/web-search";
import { slack, slackDescription, slackUsage } from "../tools/slack";
import { notion, notionDescription, notionUsage } from "../tools/notion";
import { googleDrive, googleDriveDescription, googleDriveUsage } from "../tools/google-drive";
import { googleSheets, googleSheetsDescription, googleSheetsUsage } from "../tools/google-sheets";

interface FileAttachment {
  name: string;
  contentType: string;
  url: string;
}

const router = Router();

const systemPrompt = `You are a helpful productivity assistant. You have access to tools for managing tasks, communication, and web research:

${webSearchDescription}

${slackDescription}

${notionDescription}

${googleDriveDescription}

${googleSheetsDescription}

**File Attachment Support:**
You can analyze and work with user-uploaded files including:
- Images (JPG, PNG, GIF, etc.) - You can see and describe image content
- PDFs - You can read and extract text content
- Text files (.txt, .md, .csv, .json, etc.) - You can read and process the content
- Documents (.doc, .docx) - You can read document content

When users attach files, analyze them thoroughly and provide detailed insights, summaries, or answers based on the file content.

**When to use each tool:**
${webSearchUsage}

${slackUsage}

${notionUsage}

${googleDriveUsage}

${googleSheetsUsage}

Current Date: ${new Date().toISOString().split("T")[0]}. Use web search for recent information.
Always prioritize using the most appropriate tools for the user's request. For any information that might be time-sensitive or recent, use web search first.

**Response Format:** Always format your responses using Markdown for better readability. Use headings, lists, links, code blocks, and other Markdown elements as appropriate.
`;

router.post("/", async (req: Request, res: Response) => {
  console.log("チャットAPIが呼ばれました");
  console.log("リクエスト概要:", req.method, req.url);
  console.log("リクエストヘッダー:", req.headers);
  console.log("リクエストボディのキー:", Object.keys(req.body || {}));

  try {
    const tools = {
      webSearch,
      slack,
      notion,
      googleDrive,
      googleSheets,
    };
    console.log("ツール一覧:", Object.keys(tools));

    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1];
    console.log("メッセージ", lastMessage);

    // Log file attachments if present
    if (lastMessage?.experimental_attachments && lastMessage.experimental_attachments.length > 0) {
      console.log("添付ファイル数:", lastMessage.experimental_attachments.length);
      lastMessage.experimental_attachments.forEach((attachment: FileAttachment, index: number) => {
        console.log(`添付ファイル ${index + 1}:`, {
          name: attachment.name,
          contentType: attachment.contentType,
          size: attachment.url ? Math.round(attachment.url.length * 0.75) : "unknown", // Rough base64 size estimate
        });

        // Validate attachment format
        if (!attachment.name || !attachment.contentType || !attachment.url) {
          console.warn(`添付ファイル ${index + 1} の形式が不正です:`, attachment);
        }

        // Check if it's a supported file type
        const supportedTypes = [
          "image/",
          "application/pdf",
          "text/",
          "application/json",
          "text/csv",
          "application/msword",
          "application/vnd.openxmlformats-officedocument",
        ];
        const isSupported = supportedTypes.some(type => attachment.contentType?.startsWith(type));
        if (!isSupported) {
          console.warn(
            `添付ファイル ${index + 1} はサポートされていないタイプです:`,
            attachment.contentType
          );
        }
      });
    }

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      messages,
      system: systemPrompt,
      tools,
      maxSteps: 5,
      toolCallStreaming: true,
      onChunk: ({ chunk }) => {
        if (chunk.type === "tool-call") {
          console.log(`ツール: ${chunk.toolName}`);
        } else if (chunk.type === "tool-result") {
          console.log(`ツールコールID: ${chunk.toolCallId}`);
        }
      },
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          console.log(`${toolCalls.length}のツールコールの結果、ステップ終了`);
        }
      },
      onFinish: () => {
        console.log("ストリーム終了");
      },
      onError: error => {
        console.error("ストリームエラー:", error);
      },
    });

    console.log("ストリームを送信");
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error("チャットAPIエラー:", error);
    return res.status(500).json({ error });
  }
});

export default router;
