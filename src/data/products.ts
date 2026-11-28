import { Product, ShirtSize } from '../types/store';

export const BRAND_LOGO_URL = '/assets/aistudio/logo_ed4aedbf.png';
export const SERVICES_BANNER_URL = '/assets/aistudio/services_d15aad8e.jpg';

export const BUSINESS_INFO = {
  name: 'Checklitz Printing & Party Needs',
  facebook: 'Checklits Printing PartyNeeds',
  email: 'checklitzprintingservices@gmail.com',
  phone: '+63 994 2827 053',
  landmark: 'In front of Tangos National High School',
  address: '38 B Cruz Street, Tangos North, Navotas City, Metro Manila',
  hours: 'Monday – Saturday, 8:00 AM – 7:00 PM PHT',
};

export const SERVICE_CATEGORIES = [
  {
    title: 'Documents & ID Processing',
    items: ['Xerox', 'Print', 'Rush-ID', 'Laminate', 'Scan', 'PVC-ID'],
  },
  {
    title: 'Events, Apparel & Giveaways',
    items: ['Party Needs', 'Invitation', 'Tarpaulin', 'Souvenir', 'T-Shirt', 'Mugs'],
  },
  {
    title: 'Custom Prints, School & Media',
    items: [
      'School Supplies',
      'Calling Card',
      'DTF Printing',
      'Vinyl Sticker',
      'Resume',
      'Photo & Video Editing',
    ],
  },
] as const;

export const ALL_SIZES: ShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export const FREE_SHIPPING_THRESHOLD = 1500;
export const STANDARD_SHIPPING_FEE = 50;

export const PRODUCTS: Product[] = [
  {
    id: 'chk-2027-001',
    slug: 'hello-2027-make-it-count',
    name: 'Hello 2027 — Make It Count Tee',
    subtitle: 'Fireworks & Rainbow 2027 Script',
    price: 350,
    categories: ['2027 New Year', 'New Arrivals', 'Best Sellers'],
    collectionTheme: 'Hello 2027 & Party',
    tag: 'Best Seller',
    featured: true,
    colorName: 'Royal Cobalt Blue',
    colorHex: '#0D3BFF',
    sizes: ALL_SIZES,
    images: [
      {
        src: '/assets/aistudio/tshirtMockUp-2027-001_9370d2aa.png',
        label: 'Front View',
      },
    ],
    description:
      'Ring in the new year with high-impact color. Featuring radiant fireworks, bold "Hello" script, glossy rainbow 2027 numerals, and the signature "Make It Count" gold ribbon banner printed cleanly on rich Royal Cobalt.',
    designHighlights: [
      'Full-color front chest print with fireworks, ribbons, and star accents',
      'Crisp white border outline keeps every color vibrant against cobalt blue',
      'Smooth, breathable feel built for New Year reunions and everyday street wear',
    ],
    fabricSpecs: {
      material: 'Combed Cotton-Polyester Performance Blend',
      weight: '210 GSM Midweight',
      fit: 'Regular Unisex Asian/PH Fit',
      printMethod: 'High-Definition Full-Color DTF Press',
      care: 'Machine wash cold inside-out; do not iron directly on print',
    },
  },
  {
    id: 'chk-2027-002',
    slug: '2027-new-year-new-vibes',
    name: '2027 — New Year, New Vibes Tee',
    subtitle: 'Disco Ball & Retro Party Graphic',
    price: 350,
    categories: ['2027 New Year', 'New Arrivals'],
    collectionTheme: 'Hello 2027 & Party',
    tag: 'New Drop',
    featured: true,
    colorName: 'Royal Cobalt Blue',
    colorHex: '#0D3BFF',
    sizes: ALL_SIZES,
    images: [
      {
        src: '/assets/aistudio/tshirtMockUp-2027-002_1c7fd57e.png',
        label: 'Front View',
      },
    ],
    description:
      'Made for midnight countdowns and weekend celebrations. Illustrated with a shimmering disco ball, party hat, sparkling toast, vinyl record, and retro shades wrapped around bold 2027 block typography.',
    designHighlights: [
      'Playful celebration centerpiece with "New Year, New Vibes" banner',
      'High-saturation ink layers resistant to cracking and fading',
      'Double-needle collar and hem stitching for lasting shape',
    ],
    fabricSpecs: {
      material: 'Combed Cotton-Polyester Performance Blend',
      weight: '210 GSM Midweight',
      fit: 'Regular Unisex Asian/PH Fit',
      printMethod: 'High-Definition Full-Color DTF Press',
      care: 'Machine wash cold inside-out; hang dry recommended',
    },
  },
  {
    id: 'chk-2027-003',
    slug: '2027-year-of-the-fire-goat',
    name: '2027 — Year of the Fire Goat Tee',
    subtitle: 'Auspicious Zodiac Emblem & Lanterns',
    price: 350,
    categories: ['2027 New Year', 'Fire Goat Series', 'Best Sellers'],
    collectionTheme: 'Fire Goat Zodiac',
    tag: 'Zodiac Edition',
    featured: true,
    colorName: 'Royal Cobalt Blue',
    colorHex: '#0D3BFF',
    sizes: ALL_SIZES,
    images: [
      {
        src: '/assets/aistudio/tshirtMockUp-2027-003_13fbd103.png',
        label: 'Front View',
      },
    ],
    description:
      'Celebrate the 2027 Zodiac in unmistakable style. A dynamic illustrated Fire Goat rises above flame-textured 2027 lettering, framed by red lanterns, lucky gold ingots, coins, clouds, and festive fireworks.',
    designHighlights: [
      'Detailed Fire Goat zodiac artwork with flame mane and golden horns',
      'Traditional prosperity motifs including red lanterns and gold ingots',
      'Rich gradient print calibrated for sharp contrast on Royal Cobalt',
    ],
    fabricSpecs: {
      material: 'Premium Soft-Touch Cotton Blend',
      weight: '220 GSM Heavy-Feel Knit',
      fit: 'Regular Unisex Asian/PH Fit',
      printMethod: 'Precision Multi-Layer DTF Transfer',
      care: 'Wash cold with similar colors; do not bleach or dry-clean',
    },
  },
  {
    id: 'chk-2027-004',
    slug: 'hello-2027-geometric-goat',
    name: 'Hello 2027 — Stacked Geometric Tee',
    subtitle: 'Modern Color-Block Typography & Goat Crest',
    price: 350,
    categories: ['2027 New Year', 'Fire Goat Series', 'New Arrivals'],
    collectionTheme: 'Hello 2027 & Party',
    featured: true,
    colorName: 'Royal Cobalt Blue',
    colorHex: '#0D3BFF',
    sizes: ALL_SIZES,
    images: [
      {
        src: '/assets/aistudio/tshirtMockUp-2027-004_2ca98a9f.png',
        label: 'Front View',
      },
    ],
    description:
      'Clean graphic geometry meets festive energy. Stacked "20 / 27" color-block numerals are crowned by a friendly zodiac goat crest, clouds, rainbows, and a bold "HELLO 2027" ribbon banner.',
    designHighlights: [
      'Modern stacked 2x2 numeral composition with crisp vector lines',
      'Balanced pastel-and-primary palette with rainbow and firework accents',
      'Lightweight, breathable drape suited for warm Philippine weather',
    ],
    fabricSpecs: {
      material: 'Combed Cotton-Polyester Performance Blend',
      weight: '210 GSM Midweight',
      fit: 'Regular Unisex Asian/PH Fit',
      printMethod: 'High-Definition Full-Color DTF Press',
      care: 'Machine wash cold inside-out; tumble dry low',
    },
  },
  {
    id: 'chk-2027-005',
    slug: '2027-club-new-era-flame',
    name: '2027 Club — New Year, New Era (Flame)',
    subtitle: 'Chrome Streetwear Front & Back Neck Crest',
    price: 350,
    categories: ['2027 New Year', 'Fire Goat Series', 'Club Edition', 'Best Sellers'],
    collectionTheme: '2027 Club Street',
    tag: 'Front + Back Print',
    featured: true,
    colorName: 'Royal Cobalt Blue',
    colorHex: '#0D3BFF',
    sizes: ALL_SIZES,
    images: [
      {
        src: '/assets/aistudio/tshirtMockUp-2027-005f_0492193b.png',
        label: 'Front Print',
      },
      {
        src: '/assets/aistudio/tshirtMockUp-2027-005b_5f219dbc.png',
        label: 'Back Neck Crest',
      },
    ],
    description:
      'Streetwear energy for the new era. Liquid-chrome 2027 lettering collides with barbed wire, flame-eyed smileys, a fierce Fire Goat, and a vertical "LIMITED DROP / EST. 2027" badge—finished with a signature "2027 CLUB" back neck crest.',
    designHighlights: [
      'Dual-sided printing: full chest graphic plus upper-back 2027 Club emblem',
      'Metallic-look chrome 2027 typography with neon fire gradients',
      'Constructed on heavyweight 230 GSM tee for structured streetwear drape',
    ],
    fabricSpecs: {
      material: 'Heavyweight Combed Cotton-Poly Blend',
      weight: '230 GSM Structured Knit',
      fit: 'Relaxed Streetwear Fit',
      printMethod: 'Dual-Placement High-Definition DTF',
      care: 'Wash cold inside-out; do not iron directly over chrome graphic',
    },
  },
  {
    id: 'chk-2027-006',
    slug: '2027-club-chrome-lightning',
    name: '2027 Club — Chrome Era (Lightning)',
    subtitle: 'Y2K Chrome Typography & Back Neck Crest',
    price: 350,
    categories: ['2027 New Year', 'Fire Goat Series', 'Club Edition', 'New Arrivals'],
    collectionTheme: '2027 Club Street',
    tag: 'Front + Back Print',
    featured: false,
    colorName: 'Royal Cobalt Blue',
    colorHex: '#0D3BFF',
    sizes: ALL_SIZES,
    images: [
      {
        src: '/assets/aistudio/tshirtMockUp-2027-006f_a0b166fa.png',
        label: 'Front Print',
      },
      {
        src: '/assets/aistudio/tshirtMockUp-2027-006b_ef75258a.png',
        label: 'Back Neck Crest',
      },
    ],
    description:
      'An alternate Y2K chrome colorway from the 2027 Club series. Features a side-profile Fire Goat over blazing flames, lightning bolts, barbed-wire halo, and glossy 2027 chrome type, paired with the "2027 CLUB" rear collar crest.',
    designHighlights: [
      'Front & back dual-placement print from the 2027 Club drop',
      'Electric lightning and heart-bolt accents with "NEW YEAR. NEW ERA." ribbon',
      'Soft-hand ink finish that moves effortlessly with the fabric',
    ],
    fabricSpecs: {
      material: 'Heavyweight Combed Cotton-Poly Blend',
      weight: '230 GSM Structured Knit',
      fit: 'Relaxed Streetwear Fit',
      printMethod: 'Dual-Placement High-Definition DTF',
      care: 'Wash cold inside-out; hang dry to preserve print sheen',
    },
  },
  {
    id: 'chk-2027-007',
    slug: 'fire-goat-social-club-2027',
    name: 'Fire Goat Social Club — 2027 Varsity',
    subtitle: 'Circular Club Seal & Sparkler Mascot',
    price: 350,
    categories: ['2027 New Year', 'Fire Goat Series', 'Club Edition', 'Best Sellers'],
    collectionTheme: 'Fire Goat Zodiac',
    tag: 'Limited Drop',
    featured: true,
    colorName: 'Royal Cobalt Blue',
    colorHex: '#0D3BFF',
    sizes: ALL_SIZES,
    images: [
      {
        src: '/assets/aistudio/tshirtMockUp-2027-007_f1257e54.png',
        label: 'Front View',
      },
    ],
    description:
      'Welcome to the Fire Goat Social Club. Our varsity-jacket goat mascot rocks a party hat and lit sparkler inside a collegiate crest badge bordered with confetti ribbons and bold 2027 lettering.',
    designHighlights: [
      'Collegiate circular seal reading "FIRE GOAT SOCIAL CLUB · 2027 · HAPPY NEW YEAR"',
      'Vibrant red, gold, and sunburst graphic contrast on Royal Cobalt',
      'Ideal for barkada matching tees, family New Year outfits, and events',
    ],
    fabricSpecs: {
      material: 'Premium Soft-Touch Cotton Blend',
      weight: '220 GSM Heavy-Feel Knit',
      fit: 'Regular Unisex Asian/PH Fit',
      printMethod: 'High-Definition Full-Color DTF Press',
      care: 'Machine wash cold inside-out; tumble dry low',
    },
  },
];

export const SIZE_GUIDE_ROWS = [
  { size: 'XS' as ShirtSize, chestIn: '36"', lengthIn: '25.5"', shoulderIn: '16.5"', chestCm: '91 cm', lengthCm: '65 cm' },
  { size: 'S' as ShirtSize, chestIn: '38"', lengthIn: '26.5"', shoulderIn: '17.5"', chestCm: '97 cm', lengthCm: '67 cm' },
  { size: 'M' as ShirtSize, chestIn: '40"', lengthIn: '27.5"', shoulderIn: '18.5"', chestCm: '102 cm', lengthCm: '70 cm' },
  { size: 'L' as ShirtSize, chestIn: '42"', lengthIn: '28.5"', shoulderIn: '19.5"', chestCm: '107 cm', lengthCm: '72 cm' },
  { size: 'XL' as ShirtSize, chestIn: '44"', lengthIn: '29.5"', shoulderIn: '20.5"', chestCm: '112 cm', lengthCm: '75 cm' },
  { size: '2XL' as ShirtSize, chestIn: '46"', lengthIn: '30.5"', shoulderIn: '21.5"', chestCm: '117 cm', lengthCm: '77 cm' },
];

export const PH_PROVINCES = [
  'Metro Manila (NCR)',
  'Bulacan',
  'Cavite',
  'Laguna',
  'Rizal',
  'Pampanga',
  'Batangas',
  'Cebu',
  'Davao del Sur',
  'Iloilo',
  'Negros Occidental',
  'Pangasinan',
  'Benguet',
  'Zambales',
  'Other Province',
];
