const toIsoDate = (date) => date.toISOString().slice(0, 10);

export const getQuarterRange = (date = new Date()) => {
  const quarter = Math.floor(date.getMonth() / 3);
  const start = new Date(date.getFullYear(), quarter * 3, 1);
  const end = new Date(date.getFullYear(), quarter * 3 + 3, 0);
  return { start: toIsoDate(start), end: toIsoDate(end) };
};

export const getYearRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31);
  return { start: toIsoDate(start), end: toIsoDate(end) };
};

export const presets = {
  quarter: { label: 'This Quarter', getRange: getQuarterRange },
  year: { label: 'This Year', getRange: getYearRange },
  custom: { label: 'Custom' },
};

export const monthLabel = (isoMonth) => {
  const [year, month] = isoMonth.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
};

export const isWithinRange = (isoDate, start, end) => {
  if (!isoDate) return false;
  const d = isoDate.slice(0, 10);
  return (!start || d >= start) && (!end || d <= end);
};
