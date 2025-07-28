import fs from "fs";
import path from "path";
import { google, Auth } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

export interface GoogleCredentials {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export class GoogleAuthManager {
  private static instance: GoogleAuthManager;
  private auth: Auth.OAuth2Client | null = null;
  private credentialsPath: string;
  private oauthPath: string;

  private constructor() {
    this.credentialsPath =
      process.env.GDRIVE_CREDENTIALS_PATH ||
      path.join(process.cwd(), "credentials/.gdrive-server-credentials.json");
    this.oauthPath =
      process.env.GDRIVE_OAUTH_PATH || path.join(process.cwd(), "credentials/gcp-oauth.keys.json");
  }

  public static getInstance(): GoogleAuthManager {
    if (!GoogleAuthManager.instance) {
      GoogleAuthManager.instance = new GoogleAuthManager();
    }
    return GoogleAuthManager.instance;
  }

  public async getAuthenticatedClient(): Promise<Auth.OAuth2Client> {
    console.log("🔍 GoogleAuthManager.getAuthenticatedClient() called");
    console.log("🔍 Current auth instance:", this.auth ? "exists" : "null");
    console.log("🔍 Credentials path:", this.credentialsPath);
    console.log("🔍 OAuth path:", this.oauthPath);

    if (this.auth) {
      console.log("✅ Using existing auth instance");
      return this.auth;
    }

    // Check if credentials file exists
    const credentialsExist = fs.existsSync(this.credentialsPath);
    console.log("🔍 Credentials file exists:", credentialsExist);

    // If credentials don't exist, trigger automatic authentication
    if (!credentialsExist) {
      console.log("❌ Google credentials not found. Starting authentication flow...");
      await this.authenticateAndSaveCredentials();
    }

    console.log("📖 Reading credentials from:", this.credentialsPath);
    const credentials: GoogleCredentials = JSON.parse(
      fs.readFileSync(this.credentialsPath, "utf-8")
    );
    console.log("🔍 Loaded credentials keys:", Object.keys(credentials));

    // Read OAuth configuration to get client_id, client_secret, redirect_uri
    console.log("📖 Reading OAuth config from:", this.oauthPath);
    const oauthConfig = JSON.parse(fs.readFileSync(this.oauthPath, "utf-8"));
    console.log("🔍 OAuth config keys:", Object.keys(oauthConfig));

    // Extract client info from OAuth config
    const clientInfo = oauthConfig.installed || oauthConfig.web;
    if (!clientInfo) {
      throw new Error("Invalid OAuth configuration: missing 'installed' or 'web' section");
    }

    console.log("🔧 Creating OAuth2 client with client credentials");
    this.auth = new google.auth.OAuth2(
      clientInfo.client_id,
      clientInfo.client_secret,
      clientInfo.redirect_uris?.[0] || "urn:ietf:wg:oauth:2.0:oob"
    );
    this.auth.setCredentials(credentials);

    // Set the auth for all Google API calls
    console.log("🔧 Setting global auth for Google APIs");
    google.options({ auth: this.auth });

    console.log("✅ Authentication setup complete");
    return this.auth;
  }

  public async authenticateAndSaveCredentials(): Promise<void> {
    console.log("🔐 authenticateAndSaveCredentials() called");
    console.log("🔍 Checking OAuth file at:", this.oauthPath);

    const oauthExists = fs.existsSync(this.oauthPath);
    console.log("🔍 OAuth file exists:", oauthExists);

    if (!oauthExists) {
      const error =
        `Google OAuth configuration file not found at: ${this.oauthPath}\n` +
        "Please ensure you have the OAuth2 credentials file (usually named 'gcp-oauth.keys.json') " +
        "downloaded from Google Cloud Console and placed in the correct location.\n" +
        "You can download it from: https://console.cloud.google.com/apis/credentials";
      console.error("❌", error);
      throw new Error(error);
    }

    console.log("🔐 Starting Google authentication flow...");
    console.log("📱 Your browser will open to authenticate with Google");
    console.log("📍 After authentication, you'll be able to use Google Drive and Sheets tools");

    try {
      console.log("🔧 Calling authenticate() with keyfilePath:", this.oauthPath);
      const auth = await authenticate({
        keyfilePath: this.oauthPath,
        scopes: [
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/spreadsheets",
        ],
      });

      console.log("🔧 authenticate() returned, saving credentials to:", this.credentialsPath);
      console.log("🔍 Auth credentials keys:", Object.keys(auth.credentials || {}));

      fs.writeFileSync(this.credentialsPath, JSON.stringify(auth.credentials));
      console.log("✅ Google authentication successful! Credentials saved.");
      console.log("🚀 You can now use Google Drive and Sheets tools");

      // Create OAuth2Client from the authenticated result
      console.log("🔧 Creating OAuth2 client from authenticated result");
      // Extract credentials and create our own OAuth2Client for consistency
      const oauthConfig = JSON.parse(fs.readFileSync(this.oauthPath, "utf-8"));
      const clientInfo = oauthConfig.installed || oauthConfig.web;

      this.auth = new google.auth.OAuth2(
        clientInfo.client_id,
        clientInfo.client_secret,
        clientInfo.redirect_uris?.[0] || "urn:ietf:wg:oauth:2.0:oob"
      );
      this.auth.setCredentials(auth.credentials);
      google.options({ auth: this.auth });
      console.log("🔧 OAuth2 client setup complete");
    } catch (error) {
      console.error("❌ Google authentication failed:", error);
      throw new Error(
        "Google authentication failed. Please ensure you have proper permissions and try again.\n" +
          `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public isAuthenticated(): boolean {
    return fs.existsSync(this.credentialsPath);
  }

  public getCredentialsPath(): string {
    return this.credentialsPath;
  }

  public getOAuthPath(): string {
    return this.oauthPath;
  }
}

// Export a singleton instance
export const googleAuth = GoogleAuthManager.getInstance();

/**
 * Standalone function to update Google authentication
 * Can be used from package.json scripts or called directly
 */
export async function updateGoogleAuth(): Promise<void> {
  try {
    console.log("🔄 Starting Google authentication update...");

    const authManager = GoogleAuthManager.getInstance();
    await authManager.authenticateAndSaveCredentials();

    console.log("✅ Google authentication update completed successfully!");
    console.log(`📁 Credentials saved to: ${authManager.getCredentialsPath()}`);
  } catch (error) {
    console.error("❌ Google authentication update failed:", error);
    throw error;
  }
}

/**
 * Main function for direct execution
 */
async function main(): Promise<void> {
  try {
    await updateGoogleAuth();
    process.exit(0);
  } catch (error) {
    console.error("Authentication process failed:", error);
    process.exit(1);
  }
}

// Allow direct execution with: node google-auth.ts
if (require.main === module) {
  main();
}
