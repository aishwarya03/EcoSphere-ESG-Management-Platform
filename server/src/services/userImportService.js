import ExcelJS from 'exceljs';
import AppError from '../utils/AppError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const extractCellText = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text; // hyperlink cell
    if (Array.isArray(value.richText)) return value.richText.map((rt) => rt.text).join('');
    if (value.result != null) return String(value.result); // formula cell
  }
  return '';
};

export const parseEmailsFromWorkbook = async (buffer) => {
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch (err) {
    throw new AppError('Could not read the uploaded file. Please upload a valid .xlsx file', 422);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new AppError('The uploaded workbook has no sheets', 422);
  }

  const emails = [];
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      const value = extractCellText(cell.value).trim();
      if (EMAIL_REGEX.test(value)) {
        emails.push(value.toLowerCase());
      }
    });
  });

  if (emails.length === 0) {
    throw new AppError('No valid email addresses were found in the uploaded file', 422);
  }

  return emails;
};
