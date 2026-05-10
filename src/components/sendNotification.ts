import emailjs from '@emailjs/browser';

// ─── EmailJS Configuration ────────────────────────────────────────────────────
// These values come from your EmailJS dashboard:
//   1. Sign up free at https://www.emailjs.com
//   2. Create an Email Service (Gmail, Outlook, etc.)
//   3. Create Email Templates (see below)
//   4. Copy your Public Key from Account > General
//
// Set these in your .env file:
//   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
//   VITE_EMAILJS_CONTACT_TEMPLATE_ID=template_xxxxxxx
//   VITE_EMAILJS_ORDER_TEMPLATE_ID=template_xxxxxxx
//   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx

export const ENABLE_NOTIFICATIONS = import.meta.env.VITE_ENABLE_EMAIL_NOTIFICATIONS === 'true';
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const CONTACT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID || '';
const ORDER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const TO_EMAIL = import.meta.env.VITE_EMAILJS_TO_EMAIL || '';

// Initialize EmailJS only when enabled
if (ENABLE_NOTIFICATIONS && PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  locationType: string;
  guests: string;
  message: string;
}

export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  pincode: string;
  productName: string;
  productPrice: string;
  totalAmount: string;
  imageCount: number;
  paymentMethod: string;
  upiRef: string;
  notes: string;
  orderId: string;
}

// ─── Send Contact/Callback Notification ───────────────────────────────────────
export async function sendContactNotification(data: ContactFormData): Promise<boolean> {
  // Master toggle
  if (!ENABLE_NOTIFICATIONS) {
    console.info('📧 Email notifications are disabled (VITE_ENABLE_EMAIL_NOTIFICATIONS ≠ true)');
    return true;
  }

  // Check if EmailJS is configured
  if (!SERVICE_ID || !CONTACT_TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      '⚠️ EmailJS not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_CONTACT_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env'
    );
    return true;
  }

  try {
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      phone: data.phone,
      event_type: data.eventType,
      event_date: data.eventDate || 'Not specified',
      location_type: data.locationType,
      guests: data.guests || 'Not specified',
      message: data.message || 'No additional details',
      // These are used in the email template
      to_name: 'Krishna Creation',
      to_email: TO_EMAIL,
      subject: `🔔 New Callback Request from ${data.name}`,
    };

    const response = await emailjs.send(SERVICE_ID, CONTACT_TEMPLATE_ID, templateParams);
    console.log('✅ Contact notification sent:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Failed to send contact notification:', error);
    return false;
  }
}

// ─── Send Order Notification ──────────────────────────────────────────────────
export async function sendOrderNotification(data: OrderFormData): Promise<boolean> {
  // Master toggle
  if (!ENABLE_NOTIFICATIONS) {
    console.info('📧 Email notifications are disabled (VITE_ENABLE_EMAIL_NOTIFICATIONS ≠ true)');
    return true;
  }

  // Check if EmailJS is configured
  if (!SERVICE_ID || !ORDER_TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      '⚠️ EmailJS not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_ORDER_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env'
    );
    return true;
  }

  try {
    const templateParams = {
      order_id: data.orderId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      address: `${data.address}, ${data.city} - ${data.pincode}`,
      product_name: data.productName,
      product_price: data.productPrice,
      total_amount: data.totalAmount,
      image_count: data.imageCount.toString(),
      payment_method: data.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery',
      upi_ref: data.upiRef || 'N/A',
      notes: data.notes || 'None',
      // Template fields
      to_name: 'Krishna Creation',
      to_email: TO_EMAIL,
      subject: `🛒 New Order #${data.orderId} from ${data.customerName} — ₹${data.totalAmount}`,
    };

    const response = await emailjs.send(SERVICE_ID, ORDER_TEMPLATE_ID, templateParams);
    console.log('✅ Order notification sent:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order notification:', error);
    return false;
  }
}
