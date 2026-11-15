/**
 * Practice Ledger → Google Sheets sync.
 *
 * Paste this whole file into Extensions → Apps Script of the Google Sheet that
 * should hold your CPD log, then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone) and paste the web app URL into
 * Practice Ledger → Settings.
 *
 * The tabs this script writes are a mirror of Practice Ledger: each sync
 * rewrites them, so make edits in Practice Ledger rather than in the sheet.
 */
const TOKEN = '__TOKEN__';

function doPost(e) {
  let out;
  try {
    const body = JSON.parse(e.postData.contents);
    if (!TOKEN || TOKEN.indexOf('__') === 0 || body.token !== TOKEN) throw new Error('Invalid token');

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const book = SpreadsheetApp.getActiveSpreadsheet();
      (body.tabs || []).forEach(function (tab) { writeTab(book, tab); });
      out = { ok: true, url: book.getUrl(), tabs: (body.tabs || []).length };
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput('Practice Ledger sync endpoint is running.');
}

function writeTab(book, tab) {
  const name = String(tab.name).slice(0, 90);
  const headers = tab.headers;
  const width = headers.length;
  const dateCols = tab.dateCols || [];
  const rows = (tab.rows || []).map(function (row) {
    return headers.map(function (_, i) { return cell(row[i], dateCols.indexOf(i) !== -1); });
  });

  const sheet = book.getSheetByName(name) || book.insertSheet(name);
  const lastRow = Math.max(sheet.getLastRow(), 1);
  sheet.getRange(1, 1, lastRow, width).clearContent();
  sheet.getRange(1, 1, 1, width).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, width).setValues(rows);
    dateCols.forEach(function (i) {
      sheet.getRange(2, i + 1, rows.length, 1).setNumberFormat('d mmm yyyy');
    });
  }
}

/** Dates become real dates; text that looks like a formula is stored as plain text. */
function cell(value, isDate) {
  if (value === null || value === undefined) return '';
  if (isDate) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  if (typeof value === 'string' && /^[=+\-@]/.test(value)) return "'" + value;
  return value;
}
