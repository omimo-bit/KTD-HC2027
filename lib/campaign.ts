export const CAMPAIGN = {
  name: 'KRATINGDAENG — HOMECOMING ACTIVATION 2027',
  tagline: 'Keeping You Going All the Way',
  target: 75285,
  colors: { blue: '#003399', yellow: '#FFD700', red: '#E30613' }
};

export const REST_PACKAGES = [
  { code: 'SINGLE_BOTTLE', label: 'Single Bottle', detail: '1 Bottle', price: 7000 },
  { code: 'SINGLE_CAN', label: 'Single Can', detail: '1 Can', price: 10000 },
  { code: 'RA_P1', label: 'Package 1', detail: '3 Btl + 1 Free Btl', price: 18000 },
  { code: 'RA_P2', label: 'Package 2', detail: '3 Btl + 1 Free Can', price: 20000 }
];

export const PORT_PACKAGES = [
  { code: 'PORT_P1', label: 'Paket 1', detail: '3 Botol', price: 15000 },
  { code: 'PORT_P2', label: 'Paket 2', detail: '2 Botol + 2 Can', price: 25000 },
  { code: 'PORT_P3', label: 'Paket 3', detail: '4 Botol + 2 Can', price: 40000 }
];

export const IDM_PACKAGES = [
  { code: 'IDM_PACK3', label: 'Sell-Out Pack 3', detail: '3 Bottles', price: 0 },
  { code: 'IDM_SINGLE', label: 'Single Bottle', detail: '1 Bottle', price: 0 }
];

export const PRIZES = [
  { tier: 'TIER_1', name: 'Tier 1', items: ['Kaos', 'Topi'] },
  { tier: 'TIER_2', name: 'Tier 2', items: ['Payung Lipat', 'Jas Hujan', 'Tongkat Tol', 'Cover Tas'] },
  { tier: 'TIER_3', name: 'Tier 3', items: ['Shopping Bag'] }
];

export const DOC_CATEGORIES = [
  'Booth Exterior/Interior Setup', 'Balloon Gate & Branding POSM', 'HP Charging Station',
  'Storage Inventory', 'Night Security Handover', 'Crowd Photo', 'Unique Mirror / Photo Booth',
  'Indomaret Activation Proof', 'Final Daily Closing Report'
];

export const NAV_BY_ROLE: Record<string, { id: string; label: string }[]> = {
  ADMIN: [
    { id: 'overview', label: 'Control Tower' }, { id: 'map', label: 'Mudik Map' }, { id: 'tracking', label: 'Team Live Tracking' }, { id: 'cctv', label: 'Live CCTV Wall' },
    { id: 'clicker', label: 'Visitor Clicker' }, { id: 'sales', label: 'Sales & Sampling' }, { id: 'mobile', label: 'Mobile Selling Log' },
    { id: 'gallery', label: 'Drive Gallery' }, { id: 'field', label: 'Field Operations' }, { id: 'inventory', label: 'Merchandise & Stock' },
    { id: 'users', label: 'User & PIN Access' }, { id: 'venues', label: 'Venue & CCTV Setup' }
  ],
  CLIENT: [
    { id: 'overview', label: 'Executive Overview' }, { id: 'map', label: 'Mudik Map' }, { id: 'tracking', label: 'Team Live Tracking' }, { id: 'cctv', label: 'Live CCTV Wall' }, { id: 'gallery', label: 'Reports & Gallery' }
  ],
  TL: [
    { id: 'overview', label: 'Venue Overview' }, { id: 'tracking', label: 'Team Live Tracking' }, { id: 'clicker', label: 'Visitor Clicker' }, { id: 'field', label: 'Attendance & Closing' },
    { id: 'inventory', label: 'Stock & Replenishment' }, { id: 'cctv', label: 'Venue CCTV' }, { id: 'gallery', label: 'Documentation' }
  ],
  SPG: [
    { id: 'sales', label: 'Sales & Sampling' }, { id: 'my-results', label: 'My Sales Summary' }
  ],
  CREW: [
    { id: 'field', label: 'Stock Opname' }, { id: 'mobile', label: 'Mobile Selling Log' }, { id: 'gallery', label: 'Photo Documentation' }
  ]
};
