// ── Google Drive + Google Sheet order service ────────────────────────────────
// Uses Google Apps Script (POST, no-cors) for writes
// Uses Google Sheets API v4 (GET with API key) for reads

const SCRIPT_URL   = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string;
const SHEETS_KEY   = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY   as string;
const SHEET_ID     = import.meta.env.VITE_GOOGLE_ORDERS_SHEET_ID as string;

// ── Types ────────────────────────────────────────────────────────────────────
export interface DriveOrderPayload {
  orderId:    string;
  clientName: string;
  phone:      string;
  email:      string;
  product:    string;
  theme?:     string;
  address:    string;
  notes?:     string;
  amount:     string;
  images:     File[];
}

export interface OrderStatus {
  orderId:    string;
  clientName: string;
  product:    string;
  theme:      string;
  status:     string;
  amount:     string;
  createdAt:  string;
  updatedAt:  string;
}

// ── Convert File → base64 data URL ───────────────────────────────────────────
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Upload order to Drive + write to Sheet ────────────────────────────────────
// Uses no-cors mode → we cannot read the response, but the POST reaches Apps Script.
export async function uploadOrderToDrive(payload: DriveOrderPayload): Promise<void> {
  if (!SCRIPT_URL) {
    console.info('VITE_GOOGLE_APPS_SCRIPT_URL not set – skipping Drive upload');
    return;
  }

  try {
    const base64Images = await Promise.all(payload.images.map(fileToBase64));

    const body = JSON.stringify({
      action:     'createOrder',
      orderId:    payload.orderId,
      clientName: payload.clientName,
      phone:      payload.phone,
      email:      payload.email,
      product:    payload.product,
      theme:      payload.theme || '',
      address:    payload.address,
      notes:      payload.notes || '',
      amount:     payload.amount,
      images:     base64Images,
    });

    // text/plain avoids CORS preflight; Apps Script reads via e.postData.contents
    await fetch(SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });
  } catch (err) {
    console.error('Drive upload error (non-fatal):', err);
  }
}

// ── Get order status from Google Sheet (Sheets API v4 read-only) ──────────────
export async function getOrderStatus(orderId: string): Promise<OrderStatus | null> {
  if (!SHEETS_KEY || !SHEET_ID) {
    console.info('Sheet credentials not set');
    return null;
  }

  try {
    const range = encodeURIComponent('Sheet1!A1:N');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${SHEETS_KEY}`;
    const res  = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const rows: string[][] = data.values || [];

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i][0] || rows[i][0] === 'Order ID') continue;
      if (rows[i][0].toUpperCase() === orderId.toUpperCase()) {
        return {
          orderId:    rows[i][0]  || '',
          clientName: rows[i][1]  || '',
          product:    rows[i][4]  || '',
          theme:      rows[i][5]  || '-',
          amount:     rows[i][9]  || '',
          status:     rows[i][10] || 'Accepted',
          createdAt:  rows[i][11] || '',
          updatedAt:  rows[i][12] || '',
        };
      }
    }
    return null; // not found
  } catch (err) {
    console.error('Sheet read error:', err);
    return null;
  }
}

// ── Update order status (admin) ───────────────────────────────────────────────
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  if (!SCRIPT_URL) return false;

  try {
    await fetch(SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'updateStatus', orderId, status }),
    });
    return true; // assume success – can't read response in no-cors
  } catch {
    return false;
  }
}
