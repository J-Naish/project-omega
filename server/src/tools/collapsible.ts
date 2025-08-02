import { tool } from "ai";
import { z } from "zod";

export const collapsible = tool({
  description:
    "Create collapsible content sections for the side panel. Use this tool to mark long code snippets or any content that would benefit from being collapsed in the main chat and expanded in a side panel. do not use this tool for raw texts unless the user requires so.",
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
- Creates collapsible sections for very long content and code snippets
- Content is summarized in the main chat with option to expand in side panel
- Supports multiple content types: code, text, lists, tables,, and outputs
- Provides syntax highlighting for code and metadata for additional context
`;

export const collapsibleUsage = `
**When to use Collapsible:**
- Long code snippets or files (>10 lines)
- Large data outputs or tables
- Any content that would make the main chat too long or cluttered
- Configuration files, logs, or structured data

**Example usage:**
- Code implementations with line counts >15
- Database query results with many rows
- API documentation or specifications
`;
