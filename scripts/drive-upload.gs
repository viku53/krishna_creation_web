/**
 * Krishna Creation – Google Apps Script
 * ======================================
 * Deploy as a Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * After deploying, copy the Web App URL into your .env:
 *   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
 *
 * SETUP STEPS:
 * 1. Open https://script.google.com → New project
 * 2. Paste this entire file
 * 3. Run `setupSheet()` once to create the Orders sheet headers
 * 4. Set Script Properties (Project Settings → Script Properties):
 *    - SPREADSHEET_ID  → your Google Sheet ID (from the sheet URL)
 *    - PARENT_FOLDER_ID → your Google Drive folder ID from .env (VITE_GOOGLE_DRIVE_CLIENT_FOLDER_ID)
 * 5. Deploy → New deployment → Web App → Execute as Me → Anyone
 * 6. Copy deployment URL to .env as VITE_GOOGLE_APPS_SCRIPT_URL
 */

// ── Config ───────────────────────────────────────────────────────────────────
const SHEET_NAME = 'Sheet1';

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty('SPREADSHEET_ID'),
    parentFolderId: props.getProperty('PARENT_FOLDER_ID'),
  };
}

// ── Headers (allow CORS) ──────────────────────────────────────────────────────
function setCorsHeaders(output) {
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── POST handler ──────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : '';
    const data = JSON.parse(raw);
    let result;

    if (data.action === 'createOrder') {
      result = createOrder(data);
    } else if (data.action === 'updateStatus') {
      result = updateOrderStatus(data);
    } else {
      result = { error: 'Unknown action: ' + data.action };
    }

    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
    );
  } catch (err) {
    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON)
    );
  }
}

// ── GET handler ───────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;

    if (action === 'getOrder') {
      result = getOrder(e.parameter.orderId);
    } else if (action === 'getAllOrders') {
      result = getAllOrders();
    } else {
      result = { error: 'Unknown action' };
    }

    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
    );
  } catch (err) {
    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON)
    );
  }
}

// ── Create Order ──────────────────────────────────────────────────────────────
function createOrder(data) {
  const config = getConfig();

  // 1. Create client folder in Drive
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy');
  const safeName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const folderName = safeName + '_' + dateStr + '_' + data.orderId;

  const parentFolder = DriveApp.getFolderById(config.parentFolderId);
  const clientFolder = parentFolder.createFolder(folderName);
  const folderUrl = clientFolder.getUrl();

  // 2. Save images to folder
  const images = data.images || [];
  images.forEach(function(base64Str, idx) {
    try {
      // base64Str is like "data:image/jpeg;base64,/9j/..."
      const parts = base64Str.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = mimeType.split('/')[1] || 'jpg';
      const decoded = Utilities.base64Decode(parts[1]);
      const blob = Utilities.newBlob(decoded, mimeType, 'photo_' + (idx + 1) + '.' + ext);
      clientFolder.createFile(blob);
    } catch (imgErr) {
      Logger.log('Image ' + idx + ' error: ' + imgErr);
    }
  });

  // 3. Write row to Google Sheet
  const config2 = getConfig();
  const ss = SpreadsheetApp.openById(config2.spreadsheetId);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm:ss');

  sheet.appendRow([
    data.orderId,
    data.clientName || '',
    data.phone || '',
    data.email || '',
    data.product || '',
    data.theme || '-',
    (data.images || []).length,
    data.address || '',
    data.notes || '-',
    data.amount || '',
    'Accepted',
    now,
    now,
    folderUrl,
  ]);

  return {
    success: true,
    orderId: data.orderId,
    folderUrl: folderUrl,
  };
}

// ── Get Single Order ──────────────────────────────────────────────────────────
function getOrder(orderId) {
  if (!orderId) return { error: 'No orderId provided' };
  const config = getConfig();
  const sheet = SpreadsheetApp.openById(config.spreadsheetId).getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(orderId).toUpperCase()) {
      return {
        orderId:    rows[i][0],
        clientName: rows[i][1],
        phone:      rows[i][2],
        product:    rows[i][4],
        theme:      rows[i][5],
        imageCount: rows[i][6],
        amount:     rows[i][9],
        status:     rows[i][10],
        createdAt:  rows[i][11],
        updatedAt:  rows[i][12],
        folderUrl:  rows[i][13],
      };
    }
  }
  return { error: 'Order not found' };
}

// ── Get All Orders (admin) ────────────────────────────────────────────────────
function getAllOrders() {
  const config = getConfig();
  const sheet = SpreadsheetApp.openById(config.spreadsheetId).getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();

  const orders = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) {
      orders.push({
        orderId:    rows[i][0],
        clientName: rows[i][1],
        product:    rows[i][4],
        status:     rows[i][10],
        amount:     rows[i][9],
        createdAt:  rows[i][11],
        updatedAt:  rows[i][12],
      });
    }
  }
  return { orders: orders };
}

// ── Update Order Status ───────────────────────────────────────────────────────
function updateOrderStatus(data) {
  if (!data.orderId || !data.status) return { error: 'orderId and status required' };
  const config = getConfig();
  const sheet = SpreadsheetApp.openById(config.spreadsheetId).getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(data.orderId).toUpperCase()) {
      sheet.getRange(i + 1, 11).setValue(data.status);
      const now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm:ss');
      sheet.getRange(i + 1, 13).setValue(now);
      return { success: true };
    }
  }
  return { error: 'Order not found' };
}

// ── One-time Setup ────────────────────────────────────────────────────────────
// Run this function manually once after deploying to create the sheet headers.
function setupSheet() {
  const config = getConfig();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'Order ID', 'Client Name', 'Phone', 'Email', 'Product',
    'Theme', 'Image Count', 'Address', 'Notes', 'Amount',
    'Status', 'Created At', 'Updated At', 'Drive Folder URL',
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1a1a2e')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, headers.length, 160);

  // Status column dropdown
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Accepted', 'Payment Received', 'In Process', 'In Transit', 'Completed'], true)
    .build();
  sheet.getRange(2, 11, 1000, 1).setDataValidation(statusRule);

  Logger.log('✅ Sheet setup complete!');
  return { success: true };
}
