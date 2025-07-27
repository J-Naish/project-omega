import { tool } from "ai";
import { z } from "zod";
import { google, drive_v3 } from "googleapis";
import { googleAuth } from "./google-auth";

// Define proper types for Google Drive API responses (compatible with Google API schemas)
interface DriveFile {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  modifiedTime?: string | null;
  size?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  parents?: string[] | null;
  trashed?: boolean | null;
  starred?: boolean | null;
  shared?: boolean | null;
  description?: string | null;
  createdTime?: string | null;
  lastModifyingUser?: {
    displayName?: string | null;
    emailAddress?: string | null;
  } | null;
  owners?: Array<{
    displayName?: string | null;
    emailAddress?: string | null;
  }> | null;
  permissions?: Array<{
    role?: string | null;
    type?: string | null;
    emailAddress?: string | null;
  }> | null;
}

// interface DriveSearchResponse {
//   files?: DriveFile[];
//   nextPageToken?: string;
//   incompleteSearch?: boolean;
//   kind?: string;
// }

interface DriveFileContent {
  id: string;
  name?: string | null;
  mimeType?: string | null;
  content?: string;
  base64Content?: string;
  exportMimeType?: string;
  error?: string;
}

interface GoogleDriveResponse {
  // Search responses
  files?: DriveFile[];
  nextPageToken?: string;
  totalResults?: number;
  // File content responses
  content?: DriveFileContent;
  // List responses
  resources?: Array<{
    uri: string;
    name?: string;
    mimeType?: string;
  }>;
  nextCursor?: string;
  // Error responses
  error?: string;
  [key: string]: unknown;
}

class GoogleDriveClient {
  private drive: drive_v3.Drive;

  constructor() {
    this.drive = google.drive("v3");
  }

  async ensureAuthenticated(): Promise<void> {
    console.log("🔍 GoogleDriveClient.ensureAuthenticated() called");
    try {
      await googleAuth.getAuthenticatedClient();
      console.log("✅ GoogleDriveClient authentication successful");
    } catch (error) {
      console.error("❌ GoogleDriveClient authentication failed:", error);
      throw error;
    }
  }

  async searchFiles(
    query: string,
    pageSize: number = 10,
    pageToken?: string,
    includeDeleted: boolean = false
  ): Promise<GoogleDriveResponse> {
    console.log("🔍 GoogleDriveClient.searchFiles() called with query:", query);
    try {
      await this.ensureAuthenticated();
      // Escape special characters in the query
      const escapedQuery = query.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      let formattedQuery = `fullText contains '${escapedQuery}'`;

      if (!includeDeleted) {
        formattedQuery += " and trashed=false";
      }

      const params: drive_v3.Params$Resource$Files$List = {
        q: formattedQuery,
        pageSize: Math.min(pageSize, 100),
        fields:
          "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, parents, starred, shared, description, createdTime)",
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      console.log("🔧 Making Google Drive API call with params:", JSON.stringify(params, null, 2));
      const response = await this.drive.files.list(params);
      console.log("✅ Google Drive API response received, status:", response.status);
      console.log("🔍 Response data keys:", Object.keys(response.data || {}));

      const data = response.data;
      const result = {
        files: data.files || [],
        nextPageToken: data.nextPageToken || undefined,
        totalResults: data.files?.length || 0,
      };

      console.log("📊 Search result:", {
        filesFound: result.files.length,
        hasNextPage: !!result.nextPageToken,
        totalResults: result.totalResults,
      });

      return result;
    } catch (error) {
      console.error("❌ Google Drive search failed:", error);
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getFile(fileId: string, includeContent: boolean = false): Promise<GoogleDriveResponse> {
    try {
      await this.ensureAuthenticated();
      // Get file metadata
      const metadataResponse = await this.drive.files.get({
        fileId,
        fields:
          "id, name, mimeType, modifiedTime, size, webViewLink, webContentLink, parents, trashed, starred, shared, description, createdTime, lastModifyingUser, owners",
      });

      const file = metadataResponse.data;

      if (!includeContent) {
        return { files: [file] };
      }

      // Get file content if requested
      const content = await this.getFileContent(fileId);
      return { content };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getFileContent(fileId: string): Promise<DriveFileContent> {
    try {
      await this.ensureAuthenticated();
      // First get file metadata to check mime type
      const file = await this.drive.files.get({
        fileId,
        fields: "id, name, mimeType",
      });

      const result: DriveFileContent = {
        id: fileId,
        name: file.data.name || null,
        mimeType: file.data.mimeType || null,
      };

      // For Google Apps files, we need to export them
      if (file.data.mimeType?.startsWith("application/vnd.google-apps")) {
        let exportMimeType: string;
        switch (file.data.mimeType) {
          case "application/vnd.google-apps.document":
            exportMimeType = "text/markdown";
            break;
          case "application/vnd.google-apps.spreadsheet":
            exportMimeType = "text/csv";
            break;
          case "application/vnd.google-apps.presentation":
            exportMimeType = "text/plain";
            break;
          case "application/vnd.google-apps.drawing":
            exportMimeType = "image/png";
            result.base64Content = "true"; // Flag that this will be base64
            break;
          default:
            exportMimeType = "text/plain";
        }

        const exportResponse = await this.drive.files.export(
          { fileId, mimeType: exportMimeType },
          { responseType: exportMimeType.startsWith("image/") ? "arraybuffer" : "text" }
        );

        result.exportMimeType = exportMimeType;

        if (exportMimeType.startsWith("image/")) {
          result.base64Content = Buffer.from(exportResponse.data as ArrayBuffer).toString("base64");
        } else {
          result.content = exportResponse.data as string;
        }
      } else {
        // For regular files, download content
        const downloadResponse = await this.drive.files.get(
          { fileId, alt: "media" },
          { responseType: "arraybuffer" }
        );

        const mimeType = file.data.mimeType || "application/octet-stream";
        if (mimeType.startsWith("text/") || mimeType === "application/json") {
          result.content = Buffer.from(downloadResponse.data as ArrayBuffer).toString("utf-8");
        } else {
          result.base64Content = Buffer.from(downloadResponse.data as ArrayBuffer).toString(
            "base64"
          );
        }
      }

      return result;
    } catch (error) {
      return {
        id: fileId,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async listFiles(
    pageSize: number = 10,
    pageToken?: string,
    folderId?: string
  ): Promise<GoogleDriveResponse> {
    console.log("🔍 GoogleDriveClient.listFiles() called", { pageSize, folderId });
    try {
      await this.ensureAuthenticated();
      const params: drive_v3.Params$Resource$Files$List = {
        pageSize: Math.min(pageSize, 100),
        fields:
          "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, parents)",
        q: "trashed=false",
      };

      if (folderId) {
        params.q += ` and '${folderId}' in parents`;
      }

      if (pageToken) {
        params.pageToken = pageToken;
      }

      console.log("🔧 Making Google Drive API call with params:", JSON.stringify(params, null, 2));
      const response = await this.drive.files.list(params);
      console.log("✅ Google Drive API response received, status:", response.status);
      console.log("🔍 Response data keys:", Object.keys(response.data || {}));

      const data = response.data;
      const result = {
        resources:
          data.files?.map(file => ({
            uri: `gdrive:///${file.id}`,
            name: file.name || undefined,
            mimeType: file.mimeType || undefined,
          })) || [],
        nextCursor: data.nextPageToken || undefined,
      };

      console.log("📊 List result:", {
        filesFound: result.resources.length,
        hasNextPage: !!result.nextCursor,
      });

      return result;
    } catch (error) {
      console.error("❌ Google Drive list failed:", error);
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createFolder(name: string, parentId?: string): Promise<GoogleDriveResponse> {
    try {
      await this.ensureAuthenticated();
      const fileMetadata: drive_v3.Schema$File = {
        name,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentId) {
        fileMetadata.parents = [parentId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, mimeType, parents, webViewLink",
      });

      return { files: [response.data] };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

const googleDriveClient = new GoogleDriveClient();

export const googleDrive = tool({
  description:
    "Google Drive management tool that provides comprehensive Google Drive API functionality including search, file access, folder management, and content retrieval with automatic format conversion",
  parameters: z.object({
    action: z
      .enum(["search", "get_file", "get_file_content", "list_files", "create_folder"])
      .describe("The Google Drive action to perform"),
    // Search parameters
    query: z.string().optional().describe("Search query text (required for search)"),
    include_deleted: z
      .boolean()
      .default(false)
      .optional()
      .describe("Include deleted/trashed files in search"),
    // File operations
    file_id: z.string().optional().describe("File ID (required for get_file, get_file_content)"),
    include_content: z
      .boolean()
      .default(false)
      .optional()
      .describe("Include file content in get_file response"),
    // List operations
    folder_id: z
      .string()
      .optional()
      .describe("Folder ID to list files from (optional for list_files)"),
    // Create operations
    name: z.string().optional().describe("Name for new folder (required for create_folder)"),
    parent_id: z.string().optional().describe("Parent folder ID for new folder"),
    // Pagination
    page_size: z.number().default(10).optional().describe("Number of items per page (max 100)"),
    page_token: z.string().optional().describe("Pagination token for next page"),
  }),
  execute: async ({
    action,
    query,
    include_deleted,
    file_id,
    include_content,
    folder_id,
    name,
    parent_id,
    page_size = 10,
    page_token,
  }) => {
    console.log("🚀 GoogleDrive tool executed with action:", action);
    try {
      switch (action) {
        case "search":
          if (!query) {
            throw new Error("query is required for search");
          }
          return JSON.stringify(
            await googleDriveClient.searchFiles(query, page_size, page_token, include_deleted)
          );

        case "get_file":
          if (!file_id) {
            throw new Error("file_id is required for get_file");
          }
          return JSON.stringify(await googleDriveClient.getFile(file_id, include_content));

        case "get_file_content":
          if (!file_id) {
            throw new Error("file_id is required for get_file_content");
          }
          return JSON.stringify(await googleDriveClient.getFileContent(file_id));

        case "list_files":
          return JSON.stringify(
            await googleDriveClient.listFiles(page_size, page_token, folder_id)
          );

        case "create_folder":
          if (!name) {
            throw new Error("name is required for create_folder");
          }
          return JSON.stringify(await googleDriveClient.createFolder(name, parent_id));

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
    }
  },
});

export const googleDriveDescription = `
**Google Drive:**
- googleDrive: Unified Google Drive management with actions: search, get_file, get_file_content, list_files, create_folder
`;

export const googleDriveUsage = `
- Use googleDrive with action="search" to find files by content or name
- Use googleDrive with action="get_file_content" to read file contents with automatic format conversion
- Use googleDrive with action="list_files" to browse folder contents or recent files
- Use googleDrive with action="create_folder" to organize files in new folders
- File IDs are required for most operations - get them from search or list operations first
- Supports automatic conversion: Google Docs→Markdown, Sheets→CSV, Slides→Plain text
`;
