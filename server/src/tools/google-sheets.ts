import { tool } from "ai";
import { z } from "zod";
import { google, sheets_v4 } from "googleapis";
import { googleAuth } from "./google-auth";

// Define proper types for Google Sheets API responses (compatible with Google API schemas)
interface SheetProperties {
  sheetId?: number | null;
  title?: string | null;
  index?: number | null;
  sheetType?: string | null;
  gridProperties?: {
    rowCount?: number | null;
    columnCount?: number | null;
    frozenRowCount?: number | null;
    frozenColumnCount?: number | null;
    hideGridlines?: boolean | null;
  } | null;
  tabColor?: {
    red?: number | null;
    green?: number | null;
    blue?: number | null;
    alpha?: number | null;
  } | null;
  hidden?: boolean | null;
  rightToLeft?: boolean | null;
}

interface SpreadsheetProperties {
  title?: string | null;
  locale?: string | null;
  autoRecalc?: string | null;
  timeZone?: string | null;
  defaultFormat?: {
    backgroundColor?: object | null;
    padding?: object | null;
    verticalAlignment?: string | null;
    wrapStrategy?: string | null;
    textDirection?: string | null;
    textFormat?: object | null;
  } | null;
  iterativeCalculationSettings?: {
    maxIterations?: number | null;
    convergenceThreshold?: number | null;
  } | null;
}

interface Spreadsheet {
  spreadsheetId?: string | null;
  properties?: SpreadsheetProperties | null;
  sheets?: Array<{
    properties?: SheetProperties | null;
  }> | null;
  namedRanges?: Array<{
    namedRangeId?: string | null;
    name?: string | null;
    range?: {
      sheetId?: number | null;
      startRowIndex?: number | null;
      endRowIndex?: number | null;
      startColumnIndex?: number | null;
      endColumnIndex?: number | null;
    } | null;
  }> | null;
  spreadsheetUrl?: string | null;
}

interface ValueRange {
  range?: string | null;
  majorDimension?: string | null;
  values?: string[][] | null;
}

interface BatchGetValuesResponse {
  spreadsheetId?: string | null;
  valueRanges?: ValueRange[] | null;
}

interface UpdateValuesResponse {
  spreadsheetId?: string | null;
  updatedRange?: string | null;
  updatedRows?: number | null;
  updatedColumns?: number | null;
  updatedCells?: number | null;
}

interface AppendValuesResponse {
  spreadsheetId?: string | null;
  tableRange?: string | null;
  updates?: UpdateValuesResponse | null;
}

interface GoogleSheetsResponse {
  // Spreadsheet metadata
  spreadsheet?: Spreadsheet;
  // Values responses
  values?: string[][];
  range?: string;
  majorDimension?: string;
  // Batch responses
  valueRanges?: ValueRange[];
  // Update responses
  updatedRange?: string;
  updatedRows?: number;
  updatedColumns?: number;
  updatedCells?: number;
  // Append responses
  tableRange?: string;
  updates?: UpdateValuesResponse;
  // Clear responses
  clearedRange?: string;
  // Error responses
  error?: string;
  [key: string]: unknown;
}

class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;

  constructor() {
    this.sheets = google.sheets("v4");
  }

  async ensureAuthenticated(): Promise<void> {
    console.log("🔍 GoogleSheetsClient.ensureAuthenticated() called");
    try {
      await googleAuth.getAuthenticatedClient();
      console.log("✅ GoogleSheetsClient authentication successful");
    } catch (error) {
      console.error("❌ GoogleSheetsClient authentication failed:", error);
      throw error;
    }
  }

  async getSpreadsheet(
    spreadsheetId: string,
    includeGridData: boolean = false
  ): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData,
      });

      return {
        spreadsheet: response.data,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async readRange(
    spreadsheetId: string,
    range: string,
    majorDimension: string = "ROWS"
  ): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
        majorDimension,
      });

      const data: ValueRange = response.data;
      return {
        values: data.values || [],
        range: data.range || undefined,
        majorDimension: data.majorDimension || undefined,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async readMultipleRanges(
    spreadsheetId: string,
    ranges: string[],
    majorDimension: string = "ROWS"
  ): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
        majorDimension,
      });

      const data: BatchGetValuesResponse = response.data;
      return {
        valueRanges: data.valueRanges || undefined,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async writeRange(
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: string = "USER_ENTERED"
  ): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption,
        requestBody: {
          values,
        },
      });

      const data: UpdateValuesResponse = response.data;
      return {
        updatedRange: data.updatedRange || undefined,
        updatedRows: data.updatedRows || undefined,
        updatedColumns: data.updatedColumns || undefined,
        updatedCells: data.updatedCells || undefined,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async appendToRange(
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: string = "USER_ENTERED",
    insertDataOption: string = "INSERT_ROWS"
  ): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        insertDataOption,
        requestBody: {
          values,
        },
      });

      const data: AppendValuesResponse = response.data;
      return {
        tableRange: data.tableRange || undefined,
        updates: data.updates || undefined,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async clearRange(spreadsheetId: string, range: string): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });

      return {
        clearedRange: response.data.clearedRange || undefined,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createSpreadsheet(title: string, sheetTitles?: string[]): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const sheets = sheetTitles?.map((sheetTitle, index) => ({
        properties: {
          title: sheetTitle,
          index,
        },
      })) || [
        {
          properties: {
            title: "Sheet1",
            index: 0,
          },
        },
      ];

      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title,
          },
          sheets,
        },
      });

      return {
        spreadsheet: response.data,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async addSheet(spreadsheetId: string, title: string): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });

      return {
        spreadsheet: response.data,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async formatAsTable(spreadsheetId: string, range: string): Promise<GoogleSheetsResponse> {
    await this.ensureAuthenticated();

    try {
      // This is a simplified table formatting - you can expand this with more sophisticated formatting
      const response = await this.readRange(spreadsheetId, range);

      if (response.error || !response.values || response.values.length === 0) {
        return response;
      }

      // Convert the data to a more readable table format
      const headers = response.values[0];
      const rows = response.values.slice(1);

      const tableData = {
        headers,
        rows,
        totalRows: rows.length,
        totalColumns: headers.length,
        range: response.range,
      };

      return { ...response, tableData };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

const googleSheetsClient = new GoogleSheetsClient();

export const googleSheets = tool({
  description:
    "Google Sheets management tool that provides comprehensive Google Sheets API functionality including reading, writing, formatting, and managing spreadsheets and worksheets",
  parameters: z.object({
    action: z
      .enum([
        "get_spreadsheet",
        "read_range",
        "read_multiple_ranges",
        "write_range",
        "append_to_range",
        "clear_range",
        "create_spreadsheet",
        "add_sheet",
        "format_as_table",
      ])
      .describe("The Google Sheets action to perform"),
    // Spreadsheet operations
    spreadsheet_id: z.string().optional().describe("Spreadsheet ID (required for most operations)"),
    include_grid_data: z
      .boolean()
      .default(false)
      .optional()
      .describe("Include cell data in get_spreadsheet"),
    // Range operations
    range: z
      .string()
      .optional()
      .describe("Range to read/write (e.g., 'Sheet1!A1:D10' or 'Sheet1' for entire sheet)"),
    ranges: z.array(z.string()).optional().describe("Multiple ranges for batch read operations"),
    major_dimension: z
      .enum(["ROWS", "COLUMNS"])
      .default("ROWS")
      .optional()
      .describe("Major dimension for reading data"),
    // Data operations
    values: z.array(z.array(z.string())).optional().describe("2D array of values to write/append"),
    value_input_option: z
      .enum(["RAW", "USER_ENTERED"])
      .default("USER_ENTERED")
      .optional()
      .describe("How input data should be interpreted"),
    insert_data_option: z
      .enum(["OVERWRITE", "INSERT_ROWS"])
      .default("INSERT_ROWS")
      .optional()
      .describe("How to insert data when appending"),
    // Creation operations
    title: z
      .string()
      .optional()
      .describe("Title for new spreadsheet (required for create_spreadsheet)"),
    sheet_title: z.string().optional().describe("Title for new sheet (required for add_sheet)"),
    sheet_titles: z
      .array(z.string())
      .optional()
      .describe("Titles for multiple sheets in new spreadsheet"),
  }),
  execute: async ({
    action,
    spreadsheet_id,
    include_grid_data,
    range,
    ranges,
    major_dimension = "ROWS",
    values,
    value_input_option = "USER_ENTERED",
    insert_data_option = "INSERT_ROWS",
    title,
    sheet_title,
    sheet_titles,
  }) => {
    console.log("🚀 GoogleSheets tool executed with action:", action);
    try {
      switch (action) {
        case "get_spreadsheet":
          if (!spreadsheet_id) {
            throw new Error("spreadsheet_id is required for get_spreadsheet");
          }
          return JSON.stringify(
            await googleSheetsClient.getSpreadsheet(spreadsheet_id, include_grid_data)
          );

        case "read_range":
          if (!spreadsheet_id || !range) {
            throw new Error("spreadsheet_id and range are required for read_range");
          }
          return JSON.stringify(
            await googleSheetsClient.readRange(spreadsheet_id, range, major_dimension)
          );

        case "read_multiple_ranges":
          if (!spreadsheet_id || !ranges) {
            throw new Error("spreadsheet_id and ranges are required for read_multiple_ranges");
          }
          return JSON.stringify(
            await googleSheetsClient.readMultipleRanges(spreadsheet_id, ranges, major_dimension)
          );

        case "write_range":
          if (!spreadsheet_id || !range || !values) {
            throw new Error("spreadsheet_id, range, and values are required for write_range");
          }
          return JSON.stringify(
            await googleSheetsClient.writeRange(spreadsheet_id, range, values, value_input_option)
          );

        case "append_to_range":
          if (!spreadsheet_id || !range || !values) {
            throw new Error("spreadsheet_id, range, and values are required for append_to_range");
          }
          return JSON.stringify(
            await googleSheetsClient.appendToRange(
              spreadsheet_id,
              range,
              values,
              value_input_option,
              insert_data_option
            )
          );

        case "clear_range":
          if (!spreadsheet_id || !range) {
            throw new Error("spreadsheet_id and range are required for clear_range");
          }
          return JSON.stringify(await googleSheetsClient.clearRange(spreadsheet_id, range));

        case "create_spreadsheet":
          if (!title) {
            throw new Error("title is required for create_spreadsheet");
          }
          return JSON.stringify(await googleSheetsClient.createSpreadsheet(title, sheet_titles));

        case "add_sheet":
          if (!spreadsheet_id || !sheet_title) {
            throw new Error("spreadsheet_id and sheet_title are required for add_sheet");
          }
          return JSON.stringify(await googleSheetsClient.addSheet(spreadsheet_id, sheet_title));

        case "format_as_table":
          if (!spreadsheet_id || !range) {
            throw new Error("spreadsheet_id and range are required for format_as_table");
          }
          return JSON.stringify(await googleSheetsClient.formatAsTable(spreadsheet_id, range));

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
    }
  },
});

export const googleSheetsDescription = `
**Google Sheets:**
- googleSheets: Unified Google Sheets management with actions: get_spreadsheet, read_range, read_multiple_ranges, write_range, append_to_range, clear_range, create_spreadsheet, add_sheet, format_as_table
`;

export const googleSheetsUsage = `
- Use googleSheets with action="read_range" to read data from specific cells or ranges
- Use googleSheets with action="write_range" to update existing cells with new data
- Use googleSheets with action="append_to_range" to add new rows of data
- Use googleSheets with action="create_spreadsheet" to create new spreadsheets
- Use googleSheets with action="format_as_table" to read data in a structured table format
- Spreadsheet IDs are required for most operations - get them from Google Sheets URLs
- Range format: 'SheetName!A1:D10' or 'SheetName' for entire sheet
- [IMPORTANT] If you cannot specify what Google Spreadsheet to manage, use the googleDrive tool first.
`;
