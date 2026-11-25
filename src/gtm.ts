/**
 * Google Tag Manager – dataLayer helper utilities
 *
 * All custom events pushed here can be captured inside your
 * GTM container (GTM-P2M8X7B8) via triggers → Custom Event.
 *
 * The "event" field is the trigger name in GTM.
 * Additional fields become Data Layer Variables.
 */

/** Direct GA4 Measurement ID and Meta Pixel ID read from Vite / NEXT_PUBLIC env vars */
export const GA_MEASUREMENT_ID = (
  import.meta.env.VITE_GA_ID ||
  import.meta.env.NEXT_PUBLIC_GA_ID ||
  ''
).trim();

export const META_PIXEL_ID = (
  import.meta.env.VITE_META_PIXEL_ID ||
  import.meta.env.NEXT_PUBLIC_META_PIXEL_ID ||
  ''
).trim();

// ── Type augmentation for the global dataLayer, gtag, and Meta Pixel fbq ─────
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function push(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/** Fire an event directly to GA4 via gtag.js when VITE_GA_ID / NEXT_PUBLIC_GA_ID is configured */
function trackGA4Direct(eventName: string, params: Record<string, unknown>) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/** Fire standard or custom Meta Pixel events via fbq when initialized */
function trackMetaPixel(
  method: 'track' | 'trackCustom',
  eventName: string,
  params?: Record<string, unknown>
) {
  if (!META_PIXEL_ID || typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    if (params) {
      window.fbq(method, eventName, params);
    } else {
      window.fbq(method, eventName);
    }
  }
}

let skippedInitialDirectPageView = false;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. VIRTUAL PAGEVIEW — fires on every React Router navigation
// ═══════════════════════════════════════════════════════════════════════════════
export function trackPageView(path: string, title?: string) {
  const pageTitle = title ?? (typeof document !== 'undefined' ? document.title : '');
  push({
    event: 'virtual_page_view',
    page_path: path,
    page_title: pageTitle,
  });

  // Skip initial mount duplicate because <AnalyticsHead> already tracks the initial load
  if (!skippedInitialDirectPageView) {
    skippedInitialDirectPageView = true;
    return;
  }

  trackGA4Direct('page_view', {
    page_path: path,
    page_title: pageTitle,
  });
  trackMetaPixel('track', 'PageView');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CTA / LINK CLICKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Hero CTA buttons: "View Portfolio" / "Book a Session" */
export function trackHeroCTA(label: string) {
  push({ event: 'hero_cta_click', cta_label: label });
}

/** Service card click on the home page */
export function trackServiceClick(serviceName: string) {
  push({ event: 'service_click', service_name: serviceName });
}

/** Portfolio section — "See Full Gallery" */
export function trackPortfolioClick() {
  push({ event: 'portfolio_gallery_click' });
}

/** "Enquire Now" / "Book for Your Event" / "Meet Our Team" buttons */
export function trackEnquiryCTA(label: string) {
  push({ event: 'enquiry_cta_click', cta_label: label });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CONTACT FORM
// ═══════════════════════════════════════════════════════════════════════════════
export function trackContactFormSubmit(eventType: string) {
  push({ event: 'contact_form_submit', contact_event_type: eventType });
}

export function trackContactFormSuccess(eventType: string) {
  push({ event: 'contact_form_success', contact_event_type: eventType });
}

export function trackContactFormError(eventType: string) {
  push({ event: 'contact_form_error', contact_event_type: eventType });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CONTACT INFO CLICKS (Call, WhatsApp, Instagram)
// ═══════════════════════════════════════════════════════════════════════════════
export function trackContactInfoClick(method: string) {
  push({ event: 'contact_info_click', contact_method: method });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SOCIAL / FOOTER CLICKS
// ═══════════════════════════════════════════════════════════════════════════════
export function trackSocialClick(platform: string, location: string) {
  push({ event: 'social_click', social_platform: platform, click_location: location });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. INSTANT PRINTING – GA4 ECOMMERCE & PRODUCT EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Parse any price string or number (e.g., "₹399", "1234", "₹ Based on size") into a clean number */
export function parsePrice(price: string | number | undefined | null): number {
  if (price === undefined || price === null) return 0;
  if (typeof price === 'number') return isNaN(price) ? 0 : price;
  const cleaned = price.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/** Push an ecommerce event according to official GA4 / GTM specifications */
function pushEcommerce(event: string, ecommerceData: Record<string, unknown>) {
  // Clear the previous ecommerce object before pushing a new one (per GA4 best practices)
  push({ ecommerce: null });
  push({
    event,
    ecommerce: ecommerceData,
  });
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
  currency?: string;
}

/** Product detail page viewed (Standard GA4 view_item event) */
/** Product detail page viewed (GA4 view_item + Meta Pixel ViewContent) */
export function trackViewItem(
  productId: string,
  productName: string,
  price: string | number,
  category = 'Instant Printing'
) {
  const numericPrice = parsePrice(price);
  const items = [
    {
      item_id: productId,
      item_name: productName,
      item_category: category,
      price: numericPrice,
      quantity: 1,
    },
  ];
  pushEcommerce('view_item', {
    currency: 'INR',
    value: numericPrice,
    items,
  });
  trackGA4Direct('view_item', {
    currency: 'INR',
    value: numericPrice,
    items,
  });
  trackMetaPixel('track', 'ViewContent', {
    content_ids: [productId],
    content_name: productName,
    content_category: category,
    content_type: 'product',
    value: numericPrice,
    currency: 'INR',
  });
}

/** Product card clicked on the listing page (GA4 select_item) */
export function trackProductClick(
  productId: string,
  productName: string,
  price?: string | number,
  category = 'Instant Printing'
) {
  const numericPrice = price !== undefined ? parsePrice(price) : undefined;
  pushEcommerce('select_item', {
    item_list_id: 'instant_printing_products',
    item_list_name: 'Instant Printing Products',
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
        ...(numericPrice !== undefined ? { price: numericPrice } : {}),
      },
    ],
  });
}

/** Product detail page — photo upload */
export function trackPhotoUpload(productId: string, photoCount: number) {
  push({ event: 'photo_upload', product_id: productId, photo_count: photoCount });
}

/** Product detail page — photo removed */
export function trackPhotoRemove(productId: string) {
  push({ event: 'photo_remove', product_id: productId });
}

/** 3D interactive mug rotated */
export function track3DMugInteract() {
  push({ event: 'mug_3d_interact' });
}

/** Product detail — theme selection (mug) */
export function trackThemeSelect(themeName: string | null) {
  push({ event: 'theme_select', theme_name: themeName ?? 'none' });
}

/** Product detail — frame style selection */
export function trackFrameSelect(frameName: string | null) {
  push({ event: 'frame_select', frame_name: frameName ?? 'none' });
}

/** Product detail — print size selection */
export function trackPrintSizeSelect(sizeLabel: string) {
  push({ event: 'print_size_select', print_size: sizeLabel });
}

/** Product detail — quantity change */
export function trackQuantityChange(quantity: number) {
  push({ event: 'quantity_change', quantity });
}

/** Product detail — "Order Now · ₹X" CTA click → navigates to checkout (GA4 add_to_cart + Meta Pixel AddToCart) */
export function trackAddToCart(
  productId: string,
  productName: string,
  price: string | number,
  quantity = 1,
  variant?: string,
  category = 'Instant Printing'
) {
  const unitPrice = parsePrice(price);
  const totalValue = unitPrice * quantity;
  const items = [
    {
      item_id: productId,
      item_name: productName,
      item_category: category,
      ...(variant ? { item_variant: variant } : {}),
      price: unitPrice,
      quantity,
    },
  ];
  pushEcommerce('add_to_cart', {
    currency: 'INR',
    value: totalValue,
    items,
  });
  trackGA4Direct('add_to_cart', {
    currency: 'INR',
    value: totalValue,
    items,
  });
  trackMetaPixel('track', 'AddToCart', {
    content_ids: [productId],
    content_name: productName,
    content_category: category,
    content_type: 'product',
    value: totalValue,
    currency: 'INR',
    num_items: quantity,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CHECKOUT & ORDER EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standard GA4 begin_checkout + Meta Pixel InitiateCheckout
 * Uses item subtotal for 'value' and reports shipping separately to avoid double-counting revenue.
 */
export function trackBeginCheckout(
  productId: string,
  productName: string,
  subtotal: number,
  unitPrice?: number,
  quantity = 1,
  shippingFee = 0,
  variant?: string,
  category = 'Instant Printing'
) {
  const itemPrice = unitPrice ?? (quantity > 0 ? Math.round(subtotal / quantity) : subtotal);
  const items = [
    {
      item_id: productId,
      item_name: productName,
      item_category: category,
      ...(variant ? { item_variant: variant } : {}),
      price: itemPrice,
      quantity,
    },
  ];
  pushEcommerce('begin_checkout', {
    currency: 'INR',
    value: subtotal, // Item subtotal (excluding shipping)
    shipping: shippingFee,
    items,
  });
  trackGA4Direct('begin_checkout', {
    currency: 'INR',
    value: subtotal,
    shipping: shippingFee,
    items,
  });
  trackMetaPixel('track', 'InitiateCheckout', {
    content_ids: [productId],
    content_name: productName,
    content_category: category,
    content_type: 'product',
    value: subtotal,
    currency: 'INR',
    num_items: quantity,
  });
}

/** Custom WhatsApp quick-order conversion click across storefront cards and PDP */
export function trackWhatsAppOrderClick(
  productId: string,
  productName: string,
  price: string | number,
  sourceLocation: 'storefront_card' | 'combo_card' | 'product_detail' = 'product_detail',
  category = 'Instant Printing'
) {
  const numericPrice = parsePrice(price);
  push({
    event: 'WhatsAppOrderClick',
    product_id: productId,
    product_name: productName,
    item_category: category,
    currency: 'INR',
    value: numericPrice,
    source_location: sourceLocation,
  });
  trackGA4Direct('WhatsAppOrderClick', {
    item_id: productId,
    item_name: productName,
    item_category: category,
    currency: 'INR',
    value: numericPrice,
    source_location: sourceLocation,
  });
  trackMetaPixel('trackCustom', 'WhatsAppOrderClick', {
    content_ids: [productId],
    content_name: productName,
    content_category: category,
    content_type: 'product',
    value: numericPrice,
    currency: 'INR',
    source_location: sourceLocation,
  });
}

/** Checkout step transitions (triggers begin_checkout on step 0 and custom step tracking) */
export function trackCheckoutStep(
  stepName: string,
  stepIndex: number,
  context?: {
    productId?: string;
    productName?: string;
    subtotal?: number;
    unitPrice?: number;
    quantity?: number;
    shippingFee?: number;
    variant?: string;
  }
) {
  if (stepIndex === 0 && context?.productId && context?.productName && context?.subtotal !== undefined) {
    trackBeginCheckout(
      context.productId,
      context.productName,
      context.subtotal,
      context.unitPrice,
      context.quantity ?? 1,
      context.shippingFee ?? 0,
      context.variant
    );
  }

  push({
    event: 'checkout_step',
    checkout_step_name: stepName,
    checkout_step_index: stepIndex,
    currency: 'INR',
    ...(context?.subtotal !== undefined ? { value: context.subtotal } : {}),
    ...(context?.shippingFee !== undefined ? { shipping: context.shippingFee } : {}),
  });
}

/** "Place Order" button clicked */
export function trackPlaceOrder(
  orderId: string,
  productName: string,
  subtotal: number,
  shippingFee = 0,
  productId?: string,
  quantity = 1,
  variant?: string
) {
  push({
    event: 'place_order',
    order_id: orderId,
    product_name: productName,
    value: subtotal, // Item subtotal
    shipping: shippingFee,
    total_amount: subtotal + shippingFee,
    currency: 'INR',
    ...(productId ? { product_id: productId } : {}),
    quantity,
    ...(variant ? { variant } : {}),
  });
}

/**
 * Order submission event (for unpaid / cash on delivery / pending-payment orders).
 * Pushes custom 'order_submitted' event with item subtotal and separate shipping,
 * without overstating completed financial sales in GA4 purchase reports.
 */
export function trackOrderSubmission(
  orderId: string,
  productName: string,
  subtotal: number,
  options?: {
    productId?: string;
    unitPrice?: number;
    quantity?: number;
    shippingFee?: number;
    variant?: string;
    category?: string;
    paymentStatus?: string;
  }
) {
  const quantity = options?.quantity ?? 1;
  const shipping = options?.shippingFee ?? (subtotal >= 999 ? 0 : 49);
  const unitPrice = options?.unitPrice ?? (quantity > 0 ? Math.round(subtotal / quantity) : subtotal);
  const category = options?.category ?? 'Instant Printing';

  push({
    event: 'order_submitted',
    order_id: orderId,
    product_name: productName,
    product_id: options?.productId ?? 'order-item',
    value: subtotal, // Item subtotal (revenue before delivery)
    shipping,
    total_amount: subtotal + shipping,
    currency: 'INR',
    payment_status: options?.paymentStatus ?? 'pending_payment',
    items: [
      {
        item_id: options?.productId ?? 'order-item',
        item_name: productName,
        item_category: category,
        ...(options?.variant ? { item_variant: options.variant } : {}),
        price: unitPrice,
        quantity,
      },
    ],
  });
}

/**
 * Standard GA4 purchase schema.
 * Send ONLY after payment is confirmed (e.g. online payment gateway success or verified payment).
 * Uses item subtotal for 'value' and reports shipping separately to avoid double-counting revenue.
 */
export function trackPurchase(
  orderId: string,
  productName: string,
  subtotal: number,
  options?: {
    productId?: string;
    unitPrice?: number;
    quantity?: number;
    shippingFee?: number;
    variant?: string;
    category?: string;
  }
) {
  const quantity = options?.quantity ?? 1;
  const shipping = options?.shippingFee ?? (subtotal >= 999 ? 0 : 49);
  const unitPrice =
    options?.unitPrice ?? (quantity > 0 ? Math.round(subtotal / quantity) : subtotal);
  const category = options?.category ?? 'Instant Printing';

  pushEcommerce('purchase', {
    transaction_id: orderId,
    value: subtotal, // Item subtotal (excluding shipping to prevent double-counting)
    currency: 'INR',
    tax: 0,
    shipping,
    items: [
      {
        item_id: options?.productId ?? 'order-item',
        item_name: productName,
        item_category: category,
        ...(options?.variant ? { item_variant: options.variant } : {}),
        price: unitPrice,
        quantity,
      },
    ],
  });
}

/** Alias for trackPurchase for backward compatibility */
export const trackOrderConfirmation = trackPurchase;

// ═══════════════════════════════════════════════════════════════════════════════
// 8. TRACK ORDER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function trackOrderSearch(orderId: string) {
  push({ event: 'order_search', searched_order_id: orderId });
}

export function trackOrderSearchResult(orderId: string, found: boolean, status?: string) {
  push({
    event: 'order_search_result',
    searched_order_id: orderId,
    order_found: found,
    order_status: status ?? 'not_found',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8B. COMING SOON / LEAD CAPTURE
// ═══════════════════════════════════════════════════════════════════════════════
export function trackNotifySubmit(formLocation: string) {
  push({ event: 'notify_me_submit', form_location: formLocation });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MEDIA EVENTS (Photos / Reels / Videos pages)
// ═══════════════════════════════════════════════════════════════════════════════
export function trackMediaView(mediaType: 'photo' | 'reel' | 'video', category?: string) {
  push({ event: 'media_view', media_type: mediaType, media_category: category ?? '' });
}

export function trackMediaModalOpen(mediaType: 'photo' | 'reel' | 'video') {
  push({ event: 'media_modal_open', media_type: mediaType });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. SCROLL DEPTH (optional — fires at 25 / 50 / 75 / 100%)
// ═══════════════════════════════════════════════════════════════════════════════
const firedDepths = new Set<number>();

export function initScrollTracking() {
  firedDepths.clear();

  const handler = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((scrollTop / docHeight) * 100);

    for (const threshold of [25, 50, 75, 100]) {
      if (pct >= threshold && !firedDepths.has(threshold)) {
        firedDepths.add(threshold);
        push({ event: 'scroll_depth', scroll_percent: threshold, page_path: window.location.pathname });
      }
    }
  };

  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. OUTBOUND LINK CLICK (WhatsApp, Instagram, external)
// ═══════════════════════════════════════════════════════════════════════════════
export function trackOutboundClick(url: string, label?: string) {
  push({ event: 'outbound_click', outbound_url: url, link_label: label ?? '' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. BOTTOM NAVIGATION CLICK
// ═══════════════════════════════════════════════════════════════════════════════
export function trackBottomNavClick(tab: string) {
  push({ event: 'bottom_nav_click', nav_tab: tab });
}
