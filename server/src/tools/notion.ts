import { tool } from "ai";
import { z } from "zod";

// Define proper types for Notion API responses
interface NotionUser {
  object: "user";
  id: string;
  type: "person" | "bot";
  name?: string;
  avatar_url?: string;
  person?: {
    email: string;
  };
  bot?: {
    owner: {
      type: "user" | "workspace";
      user?: NotionUser;
    };
    workspace_name?: string;
  };
}

interface NotionPage {
  object: "page";
  id: string;
  created_time: string;
  created_by: NotionUser;
  last_edited_time: string;
  last_edited_by: NotionUser;
  archived: boolean;
  icon?: {
    type: "emoji" | "external" | "file";
    emoji?: string;
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  cover?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  properties: Record<string, unknown>;
  parent: {
    type: "database_id" | "page_id" | "workspace";
    database_id?: string;
    page_id?: string;
  };
  url: string;
  public_url?: string;
}

interface NotionDatabase {
  object: "database";
  id: string;
  created_time: string;
  created_by: NotionUser;
  last_edited_time: string;
  last_edited_by: NotionUser;
  icon?: NotionPage["icon"];
  cover?: NotionPage["cover"];
  title: Array<{
    type: "text";
    text: { content: string; link?: { url: string } };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href?: string;
  }>;
  description: unknown[];
  properties: Record<string, unknown>;
  parent: NotionPage["parent"];
  url: string;
  public_url?: string;
  archived: boolean;
  is_inline: boolean;
}

interface NotionBlock {
  object: "block";
  id: string;
  parent: {
    type: "page_id" | "block_id" | "database_id";
    page_id?: string;
    block_id?: string;
    database_id?: string;
  };
  created_time: string;
  created_by: NotionUser;
  last_edited_time: string;
  last_edited_by: NotionUser;
  archived: boolean;
  has_children: boolean;
  type: string;
  [key: string]: unknown; // Block type-specific properties
}

interface NotionComment {
  object: "comment";
  id: string;
  parent: {
    type: "page_id" | "block_id";
    page_id?: string;
    block_id?: string;
  };
  discussion_id: string;
  created_time: string;
  created_by: NotionUser;
  last_edited_time: string;
  rich_text: Array<{
    type: "text";
    text: { content: string; link?: { url: string } };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href?: string;
  }>;
}

interface NotionResponse {
  object?: string;
  // Single resource responses
  user?: NotionUser;
  page?: NotionPage;
  database?: NotionDatabase;
  block?: NotionBlock;
  comment?: NotionComment;
  // Paginated responses
  results?: Array<NotionUser | NotionPage | NotionDatabase | NotionBlock | NotionComment>;
  next_cursor?: string;
  has_more?: boolean;
  // Error responses
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
  // Direct response for raw data
  [key: string]: unknown;
}

class NotionClient {
  private headers: { Authorization: string; "Content-Type": string; "Notion-Version": string };

  constructor(token: string) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    };
  }

  async getUser(userId: string): Promise<NotionResponse> {
    const response = await fetch(`https://api.notion.com/v1/users/${userId}`, {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async getUsers(startCursor?: string, pageSize?: number): Promise<NotionResponse> {
    const params = new URLSearchParams();
    if (startCursor) params.append("start_cursor", startCursor);
    if (pageSize) params.append("page_size", pageSize.toString());

    const response = await fetch(`https://api.notion.com/v1/users?${params}`, {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async getCurrentUser(): Promise<NotionResponse> {
    const response = await fetch("https://api.notion.com/v1/users/me", {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async search(
    query?: string,
    filter?: Record<string, unknown>,
    sort?: Record<string, unknown>,
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionResponse> {
    const body: Record<string, unknown> = {};
    if (query) body.query = query;
    if (filter) body.filter = filter;
    if (sort) body.sort = sort;
    if (startCursor) body.start_cursor = startCursor;
    if (pageSize) body.page_size = pageSize;

    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async getDatabase(databaseId: string): Promise<NotionResponse> {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async queryDatabase(
    databaseId: string,
    filter?: Record<string, unknown>,
    sorts?: Array<Record<string, unknown>>,
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionResponse> {
    const body: Record<string, unknown> = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (startCursor) body.start_cursor = startCursor;
    if (pageSize) body.page_size = pageSize;

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async createDatabase(
    parent: Record<string, unknown>,
    title: Array<Record<string, unknown>>,
    properties: Record<string, unknown>,
    icon?: Record<string, unknown>,
    cover?: Record<string, unknown>
  ): Promise<NotionResponse> {
    const body: Record<string, unknown> = {
      parent,
      title,
      properties,
    };
    if (icon) body.icon = icon;
    if (cover) body.cover = cover;

    const response = await fetch("https://api.notion.com/v1/databases", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async updateDatabase(
    databaseId: string,
    title?: Array<Record<string, unknown>>,
    description?: Array<Record<string, unknown>>,
    properties?: Record<string, unknown>,
    icon?: Record<string, unknown>,
    cover?: Record<string, unknown>
  ): Promise<NotionResponse> {
    const body: Record<string, unknown> = {};
    if (title) body.title = title;
    if (description) body.description = description;
    if (properties) body.properties = properties;
    if (icon) body.icon = icon;
    if (cover) body.cover = cover;

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async getPage(pageId: string): Promise<NotionResponse> {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async createPage(
    parent: Record<string, unknown>,
    properties?: Record<string, unknown>,
    children?: Array<Record<string, unknown>>,
    icon?: Record<string, unknown>,
    cover?: Record<string, unknown>
  ): Promise<NotionResponse> {
    const body: Record<string, unknown> = { parent };
    if (properties) body.properties = properties;
    if (children) body.children = children;
    if (icon) body.icon = icon;
    if (cover) body.cover = cover;

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async updatePage(
    pageId: string,
    properties?: Record<string, unknown>,
    archived?: boolean,
    icon?: Record<string, unknown>,
    cover?: Record<string, unknown>
  ): Promise<NotionResponse> {
    const body: Record<string, unknown> = {};
    if (properties) body.properties = properties;
    if (typeof archived === "boolean") body.archived = archived;
    if (icon) body.icon = icon;
    if (cover) body.cover = cover;

    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async getBlock(blockId: string): Promise<NotionResponse> {
    const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async getBlockChildren(
    blockId: string,
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionResponse> {
    const params = new URLSearchParams();
    if (startCursor) params.append("start_cursor", startCursor);
    if (pageSize) params.append("page_size", pageSize.toString());

    const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?${params}`, {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async appendBlockChildren(
    blockId: string,
    children: Array<Record<string, unknown>>
  ): Promise<NotionResponse> {
    const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({ children }),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async updateBlock(blockId: string, blockData: Record<string, unknown>): Promise<NotionResponse> {
    const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(blockData),
    });
    return response.json() as Promise<NotionResponse>;
  }

  async deleteBlock(blockId: string): Promise<NotionResponse> {
    const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
      method: "DELETE",
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async getComments(
    blockId?: string,
    pageId?: string,
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionResponse> {
    const params = new URLSearchParams();
    if (blockId) params.append("block_id", blockId);
    if (pageId) params.append("page_id", pageId);
    if (startCursor) params.append("start_cursor", startCursor);
    if (pageSize) params.append("page_size", pageSize.toString());

    const response = await fetch(`https://api.notion.com/v1/comments?${params}`, {
      headers: this.headers,
    });
    return response.json() as Promise<NotionResponse>;
  }

  async createComment(
    parent: Record<string, unknown>,
    richText: Array<Record<string, unknown>>
  ): Promise<NotionResponse> {
    const response = await fetch("https://api.notion.com/v1/comments", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        parent,
        rich_text: richText,
      }),
    });
    return response.json() as Promise<NotionResponse>;
  }
}

const notionClient = new NotionClient(process.env.NOTION_TOKEN!);

export const notion = tool({
  description:
    "Notion workspace management tool that provides comprehensive Notion API functionality including pages, databases, blocks, users, search, and comments management",
  parameters: z.object({
    action: z
      .enum([
        "get_user",
        "get_users",
        "get_current_user",
        "search",
        "get_database",
        "query_database",
        "create_database",
        "update_database",
        "get_page",
        "create_page",
        "update_page",
        "get_block",
        "get_block_children",
        "append_block_children",
        "update_block",
        "delete_block",
        "get_comments",
        "create_comment",
      ])
      .describe("The Notion action to perform"),
    // User operations
    user_id: z.string().optional().describe("User ID (required for get_user)"),
    // Search operations
    query: z.string().optional().describe("Search query text"),
    filter: z.record(z.unknown()).optional().describe("Search/query filter object"),
    sort: z.record(z.unknown()).optional().describe("Search sort object"),
    sorts: z.array(z.record(z.unknown())).optional().describe("Database query sorts array"),
    // Database operations
    database_id: z.string().optional().describe("Database ID (required for database operations)"),
    // Page operations
    page_id: z.string().optional().describe("Page ID (required for page operations)"),
    parent: z
      .record(z.unknown())
      .optional()
      .describe("Parent object (required for create operations)"),
    properties: z.record(z.unknown()).optional().describe("Properties object"),
    children: z.array(z.record(z.unknown())).optional().describe("Children blocks array"),
    icon: z.record(z.unknown()).optional().describe("Icon object"),
    cover: z.record(z.unknown()).optional().describe("Cover object"),
    title: z.array(z.record(z.unknown())).optional().describe("Title rich text array"),
    description: z.array(z.record(z.unknown())).optional().describe("Description rich text array"),
    archived: z.boolean().optional().describe("Archived status"),
    // Block operations
    block_id: z.string().optional().describe("Block ID (required for block operations)"),
    block_data: z.record(z.unknown()).optional().describe("Block data for updates"),
    // Comment operations
    rich_text: z.array(z.record(z.unknown())).optional().describe("Rich text array for comments"),
    // Pagination
    start_cursor: z.string().optional().describe("Pagination cursor for next page"),
    page_size: z.number().default(100).optional().describe("Number of items per page (max 100)"),
  }),
  execute: async ({
    action,
    user_id,
    query,
    filter,
    sort,
    sorts,
    database_id,
    page_id,
    parent,
    properties,
    children,
    icon,
    cover,
    title,
    description,
    archived,
    block_id,
    block_data,
    rich_text,
    start_cursor,
    page_size,
  }) => {
    try {
      switch (action) {
        case "get_user":
          if (!user_id) {
            throw new Error("user_id is required for get_user");
          }
          return JSON.stringify(await notionClient.getUser(user_id));

        case "get_users":
          return JSON.stringify(await notionClient.getUsers(start_cursor, page_size));

        case "get_current_user":
          return JSON.stringify(await notionClient.getCurrentUser());

        case "search":
          return JSON.stringify(
            await notionClient.search(query, filter, sort, start_cursor, page_size)
          );

        case "get_database":
          if (!database_id) {
            throw new Error("database_id is required for get_database");
          }
          return JSON.stringify(await notionClient.getDatabase(database_id));

        case "query_database":
          if (!database_id) {
            throw new Error("database_id is required for query_database");
          }
          return JSON.stringify(
            await notionClient.queryDatabase(database_id, filter, sorts, start_cursor, page_size)
          );

        case "create_database":
          if (!parent || !title || !properties) {
            throw new Error("parent, title, and properties are required for create_database");
          }
          return JSON.stringify(
            await notionClient.createDatabase(parent, title, properties, icon, cover)
          );

        case "update_database":
          if (!database_id) {
            throw new Error("database_id is required for update_database");
          }
          return JSON.stringify(
            await notionClient.updateDatabase(
              database_id,
              title,
              description,
              properties,
              icon,
              cover
            )
          );

        case "get_page":
          if (!page_id) {
            throw new Error("page_id is required for get_page");
          }
          return JSON.stringify(await notionClient.getPage(page_id));

        case "create_page":
          if (!parent) {
            throw new Error("parent is required for create_page");
          }
          return JSON.stringify(
            await notionClient.createPage(parent, properties, children, icon, cover)
          );

        case "update_page":
          if (!page_id) {
            throw new Error("page_id is required for update_page");
          }
          return JSON.stringify(
            await notionClient.updatePage(page_id, properties, archived, icon, cover)
          );

        case "get_block":
          if (!block_id) {
            throw new Error("block_id is required for get_block");
          }
          return JSON.stringify(await notionClient.getBlock(block_id));

        case "get_block_children":
          if (!block_id) {
            throw new Error("block_id is required for get_block_children");
          }
          return JSON.stringify(
            await notionClient.getBlockChildren(block_id, start_cursor, page_size)
          );

        case "append_block_children":
          if (!block_id || !children) {
            throw new Error("block_id and children are required for append_block_children");
          }
          return JSON.stringify(await notionClient.appendBlockChildren(block_id, children));

        case "update_block":
          if (!block_id || !block_data) {
            throw new Error("block_id and block_data are required for update_block");
          }
          return JSON.stringify(await notionClient.updateBlock(block_id, block_data));

        case "delete_block":
          if (!block_id) {
            throw new Error("block_id is required for delete_block");
          }
          return JSON.stringify(await notionClient.deleteBlock(block_id));

        case "get_comments":
          return JSON.stringify(
            await notionClient.getComments(block_id, page_id, start_cursor, page_size)
          );

        case "create_comment":
          if (!parent || !rich_text) {
            throw new Error("parent and rich_text are required for create_comment");
          }
          return JSON.stringify(await notionClient.createComment(parent, rich_text));

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
    }
  },
});

export const notionDescription = `
**Notion:**
- notion: Unified Notion workspace management with actions: get_user, get_users, get_current_user, search, get_database, query_database, create_database, update_database, get_page, create_page, update_page, get_block, get_block_children, append_block_children, update_block, delete_block, get_comments, create_comment
`;

export const notionUsage = `
- Use notion with action="search" to find pages and databases across the workspace
- Use notion with action="get_current_user" to get the authenticated user's info
- Use notion with action="query_database" to get filtered/sorted results from a database
- Use notion with action="get_page" to retrieve page content and properties
- Use notion with action="get_block_children" to read page/block content structure
- Use notion with action="create_page" to create new pages in databases or as child pages
- Use notion with action="create_comment" to add comments to pages or blocks
- Always specify required parameters for each action (see parameter descriptions)
- Notion IDs are UUIDs - get them from search/list operations first
`;
