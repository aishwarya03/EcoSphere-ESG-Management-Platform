import ExcelJS from 'exceljs';
import AppError from '../utils/AppError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_HEADER = 'email';
const DEPARTMENT_CODE_HEADER = 'department code';

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

// Expects a header row with an "Email" column and an optional "Department Code" column.
export const parseImportRows = async (buffer) => {
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

  const headerRow = worksheet.getRow(1);
  let emailColumn;
  let departmentCodeColumn;
  headerRow.eachCell((cell, colNumber) => {
    const header = extractCellText(cell.value).trim().toLowerCase();
    if (header === EMAIL_HEADER) emailColumn = colNumber;
    if (header === DEPARTMENT_CODE_HEADER) departmentCodeColumn = colNumber;
  });

  if (!emailColumn) {
    throw new AppError('The uploaded file must have an "Email" column header in the first row', 422);
  }

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const email = extractCellText(row.getCell(emailColumn).value).trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) return;

    const departmentCode = departmentCodeColumn
      ? extractCellText(row.getCell(departmentCodeColumn).value).trim().toUpperCase()
      : '';

    rows.push({ email, departmentCode: departmentCode || null });
  });

  if (rows.length === 0) {
    throw new AppError('No valid email addresses were found in the uploaded file', 422);
  }

  return rows;
};
