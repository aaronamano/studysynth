import { google } from 'googleapis';
import { getStoredAuth } from './google-auth';

export const getDocsClient = async () => {
  const { tokens } = await getStoredAuth();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  });

  return google.docs({ version: 'v1', auth });
};

export const getSheetsClient = async () => {
  const { tokens } = await getStoredAuth();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  });

  return google.sheets({ version: 'v4', auth });
};

export const getDriveClient = async () => {
  const { tokens } = await getStoredAuth();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  });

  return google.drive({ version: 'v3', auth });
};

export interface CreateDocumentOptions {
  title: string;
  content?: string;
}

export async function createGoogleDoc(options: CreateDocumentOptions): Promise<string> {
  const docs = await getDocsClient();
  
  const requests = [];
  if (options.content) {
    requests.push({
      insertText: {
        location: { index: 1 },
        text: options.content
      }
    });
  }

  const doc = await docs.documents.create({
    requestBody: {
      title: options.title
    }
  });

  if (options.content && doc.data.documentId) {
    await docs.documents.batchUpdate({
      documentId: doc.data.documentId,
      requestBody: {
        requests
      }
    });
  }

  return doc.data.documentId!;
}

export interface CreateSpreadsheetOptions {
  title: string;
  sheets?: { title: string; rows?: number; columns?: number }[];
}

export async function createGoogleSheet(options: CreateSpreadsheetOptions): Promise<string> {
  const sheets = await getSheetsClient();
  
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: options.title
      },
      sheets: options.sheets?.map(sheet => ({
        properties: {
          title: sheet.title || 'Sheet1',
          sheetType: 'GRID',
          gridProperties: {
            rowCount: sheet.rows || 1000,
            columnCount: sheet.columns || 26
          }
        }
      }))
    }
  });

  return spreadsheet.data.spreadsheetId!;
}