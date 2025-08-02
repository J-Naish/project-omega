import { tool } from "ai";
import { z } from "zod";

export const collapsible = tool({
  description:
    "Create collapsible content sections for the side panel. Use this tool to mark long content, code snippets, detailed explanations, or any content that would benefit from being collapsed in the main chat and expanded in a side panel.",
  parameters: z.object({
    type: z
      .enum(["code", "text", "list", "table", "explanation", "output"])
      .describe("The type of collapsible content"),
    summary: z
      .string()
      .min(1)
      .max(100)
      .describe("A brief summary that will be shown in the main chat"),
    content: z
      .string()
      .min(1)
      .describe("The full content that will be displayed in the side panel"),
  }),
  execute: async ({ type, summary, content }) => {
    const collapsibleId = `collapsible_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const response = {
      id: collapsibleId,
      type,
      summary,
      content,
    };

    return JSON.stringify(response);
  },
});

export const collapsibleDescription = `
**Collapsible Content Tool:**
- Creates collapsible sections for long content, code snippets, and detailed explanations
- Content is summarized in the main chat with option to expand in side panel
- Supports multiple content types: code, text, lists, tables, explanations, and outputs
- Provides syntax highlighting for code and metadata for additional context
`;

export const collapsibleUsage = `
**When to use Collapsible:**
- Long code snippets or files (>10 lines)
- Detailed technical explanations or documentation
- Large data outputs or tables
- Multi-step instructions or processes
- Any content that would make the main chat too long or cluttered
- Configuration files, logs, or structured data

**Example usage:**
- Code implementations with line counts >15
- Database query results with many rows
- Step-by-step guides or tutorials
- API documentation or specifications
- Error logs or debugging information
`;
