import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const result = streamText({
      model: anthropic("claude-3-7-sonnet-20250219"),
      messages,
      system: "You are a helpful assistant. Just respond normally without using any tools.",
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Test API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}