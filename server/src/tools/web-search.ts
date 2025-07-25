import { tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";

const exa = process.env.EXA_API_KEY ? new Exa(process.env.EXA_API_KEY) : null;

export const webSearch = tool({
  description: "Search the web for up-to-date information",
  parameters: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  execute: async ({ query }) => {
    if (!exa) {
      throw new Error("EXA_API_KEY environment variable is not set");
    }
    const { results } = await exa.searchAndContents(query, {
      livecrawl: "always",
      numResults: 3,
    });
    return results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.text.slice(0, 1000),
      publishedDate: result.publishedDate,
    }));
  },
});

export const webSearchDescription = `**Web Search Tool** (for current information):
- webSearch: Search the web for up-to-date information using live crawling
  - Use for: current events, recent news, latest information, real-time data
  - Returns: title, URL, content excerpt, and published date
  - Always use when users ask for current/recent information or when your knowledge might be outdated`;

export const webSearchUsage = `- **Web Search** → For current events, news, recent developments, real-time information, or when knowledge cutoff might be limiting. IMPORTANT: Always include source links in markdown format [title](url) for any information retrieved from web search.`;
