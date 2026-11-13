/**
 * Google Tag Manager – dataLayer helper utilities
 *
 * All custom events pushed here can be captured inside your
 * GTM container (GTM-P2M8X7B8) via triggers → Custom Event.
 *
 * The "event" field is the trigger name in GTM.
 * Additional fields become Data Layer Variables.
 */

// ── Type augmentation for the global dataLayer ─────────────────────────────
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. VIRTUAL PAGEVIEW — fires on every React Router navigation
// ═══════════════════════════════════════════════════════════════════════════════
export function trackPageView(path: string, title?: string) {
  push({
    event: 'virtual_page_view',
    page_path: path,
    page_title: title ?? document.title,
  });
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
export function trackViewItem(
  productId: string,
  productName: string,
  price: string | number,
  category = 'Instant Printing'
) {
  const numericPrice = parsePrice(price);
  pushEcommerce('view_item', {
    currency: 'INR',
    value: numericPrice,
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: numericPrice,
        quantity: 1,
      },
    ],
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

/** Product detail — "Place Order · ₹X" CTA click → navigates to checkout (Standard GA4 add_to_cart) */
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
  pushEcommerce('add_to_cart', {
    currency: 'INR',
    value: totalValue,
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
        ...(variant ? { item_variant: variant } : {}),
        price: unitPrice,
        quantity,
      },
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CHECKOUT EVENTS (Standard GA4 begin_checkout & purchase)
// ═══════════════════════════════════════════════════════════════════════════════

/** Standard GA4 begin_checkout */
export function trackBeginCheckout(
  productId: string,
  productName: string,
  totalAmount: number,
  unitPrice?: number,
  quantity = 1,
  variant?: string,
  category = 'Instant Printing'
) {
  const itemPrice = unitPrice ?? (quantity > 0 ? Math.round(totalAmount / quantity) : totalAmount);
  pushEcommerce('begin_checkout', {
    currency: 'INR',
    value: totalAmount,
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
        ...(variant ? { item_variant: variant } : {}),
        price: itemPrice,
        quantity,
      },
    ],
  });
}

/** Checkout step transitions (triggers begin_checkout on step 0 and custom step tracking) */
export function trackCheckoutStep(
  stepName: string,
  stepIndex: number,
  context?: {
    productId?: string;
    productName?: string;
    totalAmount?: number;
    unitPrice?: number;
    quantity?: number;
    variant?: string;
  }
) {
  if (stepIndex === 0 && context?.productId && context?.productName && context?.totalAmount !== undefined) {
    trackBeginCheckout(
      context.productId,
      context.productName,
      context.totalAmount,
      context.unitPrice,
      context.quantity ?? 1,
      context.variant
    );
  }

  push({
    event: 'checkout_step',
    checkout_step_name: stepName,
    checkout_step_index: stepIndex,
    currency: 'INR',
    ...(context?.totalAmount !== undefined ? { value: context.totalAmount } : {}),
  });
}

/** "Place Order" button clicked */
export function trackPlaceOrder(
  orderId: string,
  productName: string,
  totalAmount: number,
  productId?: string,
  quantity = 1,
  variant?: string
) {
  push({
    event: 'place_order',
    order_id: orderId,
    product_name: productName,
    order_total: totalAmount,
    value: totalAmount,
    currency: 'INR',
    ...(productId ? { product_id: productId } : {}),
    quantity,
    ...(variant ? { variant } : {}),
  });
}

/** Order confirmed — Standard GA4 purchase schema */
export function trackOrderConfirmation(
  orderId: string,
  productName: string,
  totalAmount: number,
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
  const shipping = options?.shippingFee ?? (totalAmount >= 999 ? 0 : 49);
  const unitPrice =
    options?.unitPrice ?? (quantity > 0 ? Math.round((totalAmount - shipping) / quantity) : totalAmount);
  const category = options?.category ?? 'Instant Printing';

  pushEcommerce('purchase', {
    transaction_id: orderId,
    value: totalAmount,
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
