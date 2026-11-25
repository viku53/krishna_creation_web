export interface PrintProduct {
  id: string;
  /** Legacy route aliases kept for backward compatibility */
  aliases?: string[];
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  price: string;
  /**
   * Numeric price in INR used for GA4 and Product JSON-LD offers.
   * TODO: Replace placeholder prices marked `isPlaceholderPrice: true` with final catalog pricing.
   */
  numericPrice: number;
  isPlaceholderPrice?: boolean;
  rating: number;
  reviews: number;
  tags: string[];
  deliveryBadge: string;
  /** Local WebP path for card UI (TODO: replace generated mockup WebPs with real product photos) */
  image: string;
  imageAlt: string;
  /** TODO placeholder URL for Product JSON-LD schema until final CDN/studio product photos are set */
  schemaImage: string;
  gradient: string;
  accentColor: string;
}

export interface GiftCombo {
  id: string;
  title: string;
  contents: string;
  badge: string;
  /** TODO: Confirm final combo pricing */
  price: number;
  compareAtPrice: number;
  deliveryBadge: string;
  image: string;
  imageAlt: string;
  /** TODO placeholder URL for Product JSON-LD schema */
  schemaImage: string;
}

export const products: PrintProduct[] = [
  {
    id: 'custom-photo-mugs',
    aliases: ['photo-mug'],
    title: 'Custom Photo Mugs',
    subtitle: 'Your favorite memories printed on 330ml premium ceramic',
    description:
      'Personalized 330ml white ceramic photo mug with panoramic wrap printing, dishwasher-safe finish, and same-day Mumbai delivery.',
    emoji: '☕',
    price: '₹399',
    numericPrice: 399,
    rating: 4.8,
    reviews: 124,
    tags: ['Ceramic 330ml', 'Dishwasher Safe', '3D Preview'],
    deliveryBadge: 'Same-Day Mumbai Delivery',
    // TODO: Replace generated WebP mockup with real studio mug photography
    image: '/products/custom-photo-mugs.webp',
    imageAlt: 'Custom printed 330ml ceramic photo mug with personalized photo wrap by Krishna Creation Mumbai',
    schemaImage: 'https://krishnacreationphotography.com/TODO-product-custom-photo-mugs.webp',
    gradient: 'linear-gradient(135deg, #f97316, #f59e0b)',
    accentColor: '#f97316',
  },
  {
    id: 'magic-mugs',
    title: 'Magic Mugs',
    subtitle: 'Matte black ceramic mug that reveals your photo with hot drinks',
    description:
      'Heat-sensitive color-changing magic mug that stays sleek matte black when cool and reveals your custom photo when hot tea or coffee is poured.',
    emoji: '✨',
    // TODO: Confirm final selling price for Magic Mugs
    price: '₹499',
    numericPrice: 499,
    isPlaceholderPrice: true,
    rating: 4.9,
    reviews: 86,
    tags: ['Heat Reveal', 'Surprise Gift', '330ml'],
    deliveryBadge: 'Same-Day Mumbai Delivery',
    // TODO: Replace generated WebP mockup with real studio magic mug photography
    image: '/products/magic-mugs.webp',
    imageAlt: 'Heat-sensitive black color-changing magic mug revealing hidden custom photo by Krishna Creation',
    schemaImage: 'https://krishnacreationphotography.com/TODO-product-magic-mugs.webp',
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    accentColor: '#ec4899',
  },
  {
    id: 'photo-frames',
    aliases: ['photo-frame'],
    title: 'Photo Frames',
    subtitle: 'Gallery-grade wood, gold & matte frames with archival print',
    description:
      'Hand-finished custom photo frames in Classic Black, White Minimal, Antique Gold, Silver Steel, and Rustic Oak with high-definition print mounting.',
    emoji: '🖼️',
    // TODO: Confirm final selling price for Photo Frames
    price: '₹599',
    numericPrice: 599,
    isPlaceholderPrice: true,
    rating: 4.9,
    reviews: 94,
    tags: ['5 Frame Styles', 'Archival Print', 'Wall & Table'],
    deliveryBadge: 'Same-Day Mumbai Delivery',
    // TODO: Replace generated WebP mockup with real studio framed photo
    image: '/products/photo-frames.webp',
    imageAlt: 'Custom framed wedding and family portrait in wood and antique gold finish by Krishna Creation Mumbai',
    schemaImage: 'https://krishnacreationphotography.com/TODO-product-photo-frames.webp',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    accentColor: '#f59e0b',
  },
  {
    id: 'custom-keychains',
    title: 'Custom Keychains',
    subtitle: 'Compact personalized metal & acrylic photo keychains for daily carry',
    description:
      'Scratch-resistant double-sided personalized photo keychains available in rectangle, heart, and square shapes — ideal for return favors and gifts.',
    emoji: '🔑',
    // TODO: Confirm final selling price for Custom Keychains
    price: '₹199',
    numericPrice: 199,
    isPlaceholderPrice: true,
    rating: 4.7,
    reviews: 112,
    tags: ['Double-Sided', 'Metal Finish', 'Gift Favorite'],
    deliveryBadge: 'Same-Day Mumbai Delivery',
    // TODO: Replace generated WebP mockup with real studio keychain photo
    image: '/products/custom-keychains.webp',
    imageAlt: 'Personalized stainless metal photo keychain printed with custom picture by Krishna Creation',
    schemaImage: 'https://krishnacreationphotography.com/TODO-product-custom-keychains.webp',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    accentColor: '#10b981',
  },
  {
    id: 'photo-print-packs',
    aliases: ['photo-print'],
    title: 'Photo Print Packs',
    subtitle: 'Gallery-quality prints on archival paper in 4×6 to A4 sizes',
    description:
      'Vibrant fade-resistant archival photo prints available in 4×6, 5×7, 6×8, 8×10, and A4 sizes with glossy or matte finish.',
    emoji: '🖨️',
    price: 'From ₹15/print',
    numericPrice: 15,
    rating: 4.9,
    reviews: 238,
    tags: ['Glossy/Matte', 'Archival Paper', '4×6 to A4'],
    deliveryBadge: 'Same-Day Mumbai Delivery',
    // TODO: Replace generated WebP mockup with real archival photo prints photo
    image: '/products/photo-print-packs.webp',
    imageAlt: 'Archival glossy and matte photo print packs in 4x6, 5x7, 8x10 and A4 sizes from Krishna Creation',
    schemaImage: 'https://krishnacreationphotography.com/TODO-product-photo-print-packs.webp',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    accentColor: '#3b82f6',
  },
  {
    id: 'gift-combos',
    title: 'Gift Combos',
    subtitle: 'Curated Mug + Frame + Keychain keepsake gift boxes that save more',
    description:
      'All-in-one personalized gift boxes combining custom ceramic or magic mugs, gallery photo frames, archival prints, and photo keychains.',
    emoji: '🎁',
    // TODO: Confirm final base price for Gift Combos
    price: '₹999',
    numericPrice: 999,
    isPlaceholderPrice: true,
    rating: 5.0,
    reviews: 67,
    tags: ['Value Bundle', 'Gift Wrapped', 'Free Delivery'],
    deliveryBadge: 'Same-Day Mumbai Delivery',
    // TODO: Replace generated WebP mockup with real curated gift box photography
    image: '/products/gift-combos.webp',
    imageAlt: 'Curated personalized photo gift box containing custom mug, photo frame and keychain by Krishna Creation',
    schemaImage: 'https://krishnacreationphotography.com/TODO-product-gift-combos.webp',
    gradient: 'linear-gradient(135deg, #f43f5e, #fb923c)',
    accentColor: '#f43f5e',
  },
];

export const giftCombos: GiftCombo[] = [
  {
    id: 'memory-maker-trio',
    title: 'Memory Maker Trio Box',
    contents: 'Custom Photo Mug + Wood Photo Frame + Metal Keychain',
    badge: 'Bestseller · Save ₹198',
    // TODO: Confirm final combo price
    price: 999,
    compareAtPrice: 1197,
    deliveryBadge: 'Free Same-Day Mumbai Delivery',
    image: '/products/gift-combos.webp',
    imageAlt: 'Memory Maker Trio Gift Box containing custom mug, photo frame, and photo keychain',
    schemaImage: 'https://krishnacreationphotography.com/TODO-combo-memory-maker-trio.webp',
  },
  {
    id: 'couple-magic-hamper',
    title: 'Couple Magic Hamper',
    contents: '2 Heat-Reveal Magic Mugs + Gallery Frame + 2 Keychains',
    badge: 'Couple Special · Save ₹396',
    // TODO: Confirm final combo price
    price: 1599,
    compareAtPrice: 1995,
    deliveryBadge: 'Free Express Mumbai Delivery',
    image: '/products/magic-mugs.webp',
    imageAlt: 'Couple Magic Gift Hamper with 2 magic mugs, photo frame, and 2 custom keychains',
    schemaImage: 'https://krishnacreationphotography.com/TODO-combo-couple-magic-hamper.webp',
  },
  {
    id: 'celebration-keepsake',
    title: 'Celebration Keepsake Pack',
    contents: 'Custom Photo Mug + 10 Archival 4×6 Prints + Keychain',
    badge: 'Value Pick · Save ₹148',
    // TODO: Confirm final combo price
    price: 749,
    compareAtPrice: 897,
    deliveryBadge: 'Same-Day Mumbai Delivery',
    image: '/products/photo-print-packs.webp',
    imageAlt: 'Celebration Keepsake Pack with custom photo mug, 10 photo prints, and keychain',
    schemaImage: 'https://krishnacreationphotography.com/TODO-combo-celebration-keepsake.webp',
  },
];

/** Resolve a product by canonical id or legacy route alias */
export function findProductBySlug(slug?: string): PrintProduct | undefined {
  if (!slug) return undefined;
  return products.find(p => p.id === slug || p.aliases?.includes(slug));
}

const DEFAULT_WHATSAPP_NUMBER = '919769989807';

/** Return sanitized studio WhatsApp phone digits, defaulting to 919769989807. */
export function getWhatsAppNumber(): string {
  const configured = import.meta.env.VITE_CONTACT_NUMBER;
  const digits = configured ? configured.replace(/\D/g, '') : '';
  return digits || DEFAULT_WHATSAPP_NUMBER;
}

/** Build a URL-encoded 1-tap WhatsApp pre-filled order link with exact product name and price. */
export function buildWhatsAppOrderUrl(productName: string, price?: string | number): string {
  const priceText =
    price !== undefined && price !== ''
      ? ` (${typeof price === 'number' ? `₹${price}` : price})`
      : '';
  const message = `Hi Krishna Creation, I want to order ${productName}${priceText} from krishnacreationphotography.com`;
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}
