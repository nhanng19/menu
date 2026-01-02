/**
 * Table mapping: Maps unique table codes to table IDs
 * This prevents guests from simply changing the URL to access different tables
 * QR codes should link to /table/[code] where code is the key below
 */

export const tableMapping: Record<string, number> = {
  'a1f8c3d2-4b5e-47f9-8a2c-1d6e9f3b5c7a': 1,
  '7b2e5f4a-9c1d-4e8b-b3f6-2a8d7c5e9f1b': 2,
  'c9d4a6f2-1e7b-4c5a-8f3d-6b9e2a4f8c1d': 3,
  '3e7a9b2f-5c4d-4f8a-9e1b-7c6f2d5a3e8b': 4,
  'f5b8d1e9-3a6c-4b7f-2e9d-8a5c1f6b4e7a': 5,
  '2c6e9f3b-7d1a-4e8c-5b9f-1a4d7c2e6f8b': 6,
};

/**
 * Get table ID from a code
 * Returns null if code is invalid
 */
export function getTableIdFromCode(code: string): number | null {
  const tableId = tableMapping[code];
  return tableId ? tableId : null;
}

/**
 * Get code for a table ID (for generating QR codes)
 */
export function getCodeForTableId(tableId: number): string | null {
  for (const [code, id] of Object.entries(tableMapping)) {
    if (id === tableId) {
      return code;
    }
  }
  return null;
}

/**
 * Get all table codes (for admin/QR code generation)
 */
export function getAllTableCodes(): Record<number, string> {
  const result: Record<number, string> = {};
  for (const [code, tableId] of Object.entries(tableMapping)) {
    result[tableId] = code;
  }
  return result;
}
