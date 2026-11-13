export interface PrintProduct {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  price: string;
  rating: number;
  reviews: number;
  tags: string[];
  gradient: string;
  accentColor: string;
}

export const products: PrintProduct[] = [
  {
    id: 'photo-mug',
    title: 'Custom Photo Mug',
    subtitle: 'Your favorite memories on premium ceramic',
    emoji: '☕',
    price: '₹399',
    rating: 4.8,
    reviews: 124,
    tags: ['Ceramic', 'Dishwasher Safe', '330ml'],
    gradient: 'linear-gradient(135deg, #f97316, #f59e0b)',
    accentColor: '#f97316',
  },
  {
    id: 'photo-print',
    title: 'Premium Photo Prints',
    subtitle: 'Gallery-quality prints on archival paper',
    emoji: '🖨️',
    price: '₹ Based on size',
    rating: 4.9,
    reviews: 238,
    tags: ['Glossy/Matte', 'Archival', 'Multiple Sizes'],
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    accentColor: '#3b82f6',
  },
];
