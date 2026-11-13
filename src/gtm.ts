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
// 6. INSTANT PRINTING – PRODUCT EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Product detail page viewed (Standard GA4 view_item event) */
export function trackViewItem(productId: string, productName: string, price: string) {
  push({ event: 'view_item', product_id: productId, product_name: productName, product_price: price });
}

/** Product card clicked on the listing page */
export function trackProductClick(productId: string, productName: string) {
  push({ event: 'product_click', product_id: productId, product_name: productName });
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

/** Product detail — "Place Order · ₹X" CTA click → navigates to checkout */
export function trackAddToCart(productId: string, productName: string, price: string) {
  push({ event: 'add_to_cart', product_id: productId, product_name: productName, product_price: price });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CHECKOUT EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Checkout step transitions */
export function trackCheckoutStep(stepName: string, stepIndex: number) {
  push({ event: 'checkout_step', checkout_step_name: stepName, checkout_step_index: stepIndex });
}

/** "Place Order" button clicked */
export function trackPlaceOrder(orderId: string, productName: string, totalAmount: number) {
  push({
    event: 'place_order',
    order_id: orderId,
    product_name: productName,
    order_total: totalAmount,
  });
}

/** Order confirmed (step 2 — success screen) */
export function trackOrderConfirmation(orderId: string, productName: string, totalAmount: number) {
  push({
    event: 'purchase',
    order_id: orderId,
    product_name: productName,
    order_total: totalAmount,
    currency: 'INR',
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
