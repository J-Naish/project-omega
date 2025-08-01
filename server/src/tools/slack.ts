import { tool } from "ai";
import { z } from "zod";

// Define proper types for Slack API responses
interface SlackChannel {
  id: string;
  name: string;
  is_archived: boolean;
  is_channel?: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_mpim?: boolean;
  is_private?: boolean;
  is_public?: boolean;
  created?: number;
  creator?: string;
  topic?: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose?: {
    value: string;
    creator: string;
    last_set: number;
  };
  num_members?: number;
}

interface SlackMessage {
  type: string;
  ts: string;
  user?: string;
  text?: string;
  thread_ts?: string;
  reply_count?: number;
  replies?: Array<{
    user: string;
    ts: string;
  }>;
  reactions?: Array<{
    name: string;
    users: string[];
    count: number;
  }>;
  attachments?: Array<{
    [key: string]: unknown;
  }>;
  blocks?: Array<{
    [key: string]: unknown;
  }>;
}

interface SlackUser {
  id: string;
  team_id?: string;
  name: string;
  deleted?: boolean;
  color?: string;
  real_name?: string;
  tz?: string;
  tz_label?: string;
  tz_offset?: number;
  profile?: SlackUserProfile;
  is_admin?: boolean;
  is_owner?: boolean;
  is_primary_owner?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_bot?: boolean;
  is_app_user?: boolean;
  updated?: number;
}

interface SlackUserProfile {
  avatar_hash?: string;
  status_text?: string;
  status_emoji?: string;
  real_name?: string;
  display_name?: string;
  real_name_normalized?: string;
  display_name_normalized?: string;
  email?: string;
  image_24?: string;
  image_32?: string;
  image_48?: string;
  image_72?: string;
  image_192?: string;
  image_512?: string;
  team?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  phone?: string;
  skype?: string;
}

interface SlackResponse {
  ok: boolean;
  error?: string;
  // Channel-related responses
  channels?: SlackChannel[];
  channel?: SlackChannel;
  // Message-related responses
  message?: SlackMessage;
  messages?: SlackMessage[];
  ts?: string;
  // User-related responses
  members?: SlackUser[];
  user?: SlackUser;
  profile?: SlackUserProfile;
  // Pagination
  response_metadata?: {
    next_cursor?: string;
    [key: string]: unknown;
  };
  // Additional fields that might be present
  has_more?: boolean;
  needed?: string;
  provided?: string;
  [key: string]: unknown;
}

class SlackClient {
  private botHeaders: { Authorization: string; "Content-Type": string };

  constructor(botToken: string) {
    this.botHeaders = {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    };
  }

  async getChannels(limit: number = 100, cursor?: string): Promise<SlackResponse> {
    const predefinedChannelIds = process.env.SLACK_CHANNEL_IDS;
    if (!predefinedChannelIds) {
      const params = new URLSearchParams({
        types: "public_channel",
        exclude_archived: "true",
        limit: Math.min(limit, 200).toString(),
        team_id: process.env.SLACK_TEAM_ID!,
      });

      if (cursor) {
        params.append("cursor", cursor);
      }

      const response = await fetch(`https://slack.com/api/conversations.list?${params}`, {
        headers: this.botHeaders,
      });

      return response.json() as Promise<SlackResponse>;
    }

    const predefinedChannelIdsArray = predefinedChannelIds.split(",").map(id => id.trim());
    const channels: SlackChannel[] = [];

    for (const channelId of predefinedChannelIdsArray) {
      const params = new URLSearchParams({
        channel: channelId,
      });

      const response = await fetch(`https://slack.com/api/conversations.info?${params}`, {
        headers: this.botHeaders,
      });
      const data = (await response.json()) as SlackResponse;

      if (data.ok && data.channel && !data.channel.is_archived) {
        channels.push(data.channel);
      }
    }

    return {
      ok: true,
      channels: channels,
      response_metadata: { next_cursor: "" },
    };
  }

  async postMessage(channel_id: string, text: string): Promise<SlackResponse> {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({
        channel: channel_id,
        text: text,
      }),
    });

    return response.json() as Promise<SlackResponse>;
  }

  async postReply(channel_id: string, thread_ts: string, text: string): Promise<SlackResponse> {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({
        channel: channel_id,
        thread_ts: thread_ts,
        text: text,
      }),
    });

    return response.json() as Promise<SlackResponse>;
  }

  async addReaction(
    channel_id: string,
    timestamp: string,
    reaction: string
  ): Promise<SlackResponse> {
    const response = await fetch("https://slack.com/api/reactions.add", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({
        channel: channel_id,
        timestamp: timestamp,
        name: reaction,
      }),
    });

    return response.json() as Promise<SlackResponse>;
  }

  async getChannelHistory(channel_id: string, limit: number = 10): Promise<SlackResponse> {
    const params = new URLSearchParams({
      channel: channel_id,
      limit: limit.toString(),
    });

    const response = await fetch(`https://slack.com/api/conversations.history?${params}`, {
      headers: this.botHeaders,
    });

    return response.json() as Promise<SlackResponse>;
  }

  async getThreadReplies(channel_id: string, thread_ts: string): Promise<SlackResponse> {
    const params = new URLSearchParams({
      channel: channel_id,
      ts: thread_ts,
    });

    const response = await fetch(`https://slack.com/api/conversations.replies?${params}`, {
      headers: this.botHeaders,
    });

    return response.json() as Promise<SlackResponse>;
  }

  async getUsers(limit: number = 100, cursor?: string): Promise<SlackResponse> {
    const params = new URLSearchParams({
      limit: Math.min(limit, 200).toString(),
      team_id: process.env.SLACK_TEAM_ID!,
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(`https://slack.com/api/users.list?${params}`, {
      headers: this.botHeaders,
    });

    return response.json() as Promise<SlackResponse>;
  }

  async getUserProfile(user_id: string): Promise<SlackResponse> {
    const params = new URLSearchParams({
      user: user_id,
      include_labels: "true",
    });

    const response = await fetch(`https://slack.com/api/users.profile.get?${params}`, {
      headers: this.botHeaders,
    });

    return response.json() as Promise<SlackResponse>;
  }
}

const slackClient = new SlackClient(process.env.SLACK_BOT_TOKEN!);

export const slack = tool({
  description:
    "Slack workspace management tool that provides comprehensive Slack functionality including channel management, messaging, user management, and thread interactions",
  parameters: z.object({
    action: z
      .enum([
        "list_channels",
        "post_message",
        "reply_to_thread",
        "add_reaction",
        "get_channel_history",
        "get_thread_replies",
        "get_users",
        "get_user_profile",
      ])
      .describe("The Slack action to perform"),
    channel_id: z.string().optional().describe("The ID of the channel (required for most actions)"),
    text: z
      .string()
      .optional()
      .describe("Message text (required for post_message and reply_to_thread)"),
    thread_ts: z
      .string()
      .optional()
      .describe(
        "Thread timestamp in format '1234567890.123456' (required for reply_to_thread and get_thread_replies)"
      ),
    timestamp: z.string().optional().describe("Message timestamp (required for add_reaction)"),
    reaction: z.string().optional().describe("Emoji name without :: (required for add_reaction)"),
    user_id: z.string().optional().describe("User ID (required for get_user_profile)"),
    limit: z
      .number()
      .default(100)
      .optional()
      .describe("Limit for list operations (default 100, max 200)"),
    cursor: z.string().optional().describe("Pagination cursor for next page of results"),
  }),
  execute: async ({
    action,
    channel_id,
    text,
    thread_ts,
    timestamp,
    reaction,
    user_id,
    limit = 100,
    cursor,
  }) => {
    try {
      switch (action) {
        case "list_channels":
          return JSON.stringify(await slackClient.getChannels(limit, cursor));

        case "post_message":
          if (!channel_id || !text) {
            throw new Error("channel_id and text are required for post_message");
          }
          return JSON.stringify(await slackClient.postMessage(channel_id, text));

        case "reply_to_thread":
          if (!channel_id || !thread_ts || !text) {
            throw new Error("channel_id, thread_ts, and text are required for reply_to_thread");
          }
          return JSON.stringify(await slackClient.postReply(channel_id, thread_ts, text));

        case "add_reaction":
          if (!channel_id || !timestamp || !reaction) {
            throw new Error("channel_id, timestamp, and reaction are required for add_reaction");
          }
          return JSON.stringify(await slackClient.addReaction(channel_id, timestamp, reaction));

        case "get_channel_history":
          if (!channel_id) {
            throw new Error("channel_id is required for get_channel_history");
          }
          return JSON.stringify(await slackClient.getChannelHistory(channel_id, limit));

        case "get_thread_replies":
          if (!channel_id || !thread_ts) {
            throw new Error("channel_id and thread_ts are required for get_thread_replies");
          }
          return JSON.stringify(await slackClient.getThreadReplies(channel_id, thread_ts));

        case "get_users":
          return JSON.stringify(await slackClient.getUsers(limit, cursor));

        case "get_user_profile":
          if (!user_id) {
            throw new Error("user_id is required for get_user_profile");
          }
          return JSON.stringify(await slackClient.getUserProfile(user_id));

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
    }
  },
});

export const slackDescription = `
**Slack:**
- slack: Unified Slack workspace management with actions: list_channels, post_message, reply_to_thread, add_reaction, get_channel_history, get_thread_replies, get_users, get_user_profile
`;

export const slackUsage = `
- Use slack with action="list_channels" to see available channels before posting
- Use slack with action="get_channel_history" to understand context before responding
- Use slack with action="post_message" for new messages or action="reply_to_thread" for responses
- Channel IDs and user IDs are required - get them from list operations first
- Always specify the required parameters for each action
`;
