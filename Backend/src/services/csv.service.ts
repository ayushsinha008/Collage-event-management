import { Parser } from 'json2csv';
import { ApiError } from '../utils/ApiError';

export const generateCSV = (fields: string[], data: any[]): string => {
  try {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    return csv;
  } catch (error: any) {
    throw new ApiError(500, `CSV generation failed: ${error.message}`);
  }
};
