export type Role = 'ADMIN' | 'CLIENT' | 'TL' | 'SPG' | 'CREW';
export type VenueType = 'REST_AREA' | 'PORT';

export interface SessionUser {
  userId: string;
  name: string;
  username: string;
  role: Role;
  venueId: string;
  shift: string;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
  expiresIn: number;
}

export interface Booth {
  venueId: string;
  name: string;
  type: VenueType;
  region: string;
  province: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  manpower: number;
  targetBooth: number;
  targetIDM: number;
  targetSelling: number;
  samplingTarget: number;
  idmCodes: string;
  lat: number;
  lng: number;
  cctvUrl: string;
  cctvType: 'HLS' | 'YOUTUBE' | 'IP_CAM' | string;
  trafficStatus: string;
  isActive: boolean | string;
  targetTotal?: number;
}

export interface VenueStats {
  venueId: string;
  name: string;
  type: VenueType;
  region: string;
  trafficStatus: string;
  visitors: number;
  uniqueMirror: number;
  photoBooth: number;
  sampling: number;
  bottles: number;
  cans: number;
  revenue: number;
  target: number;
  latestPhoto: string;
}

export interface DashboardData {
  refreshedAt: string;
  totalVisitors: number;
  uniqueMirror: number;
  photoBooth: number;
  totalSampling: number;
  totalBottles: number;
  totalCans: number;
  totalSalesUnits: number;
  totalRevenue: number;
  buyerTransactions: number;
  conversionRate: number;
  targetBottles: number;
  progress: number;
  venueCount: number;
  venues: VenueStats[];
  role: Role;
  venueId: string;
}

export interface DriveDoc {
  id: string;
  timestamp: string;
  date: string;
  venueId: string;
  userId: string;
  category: string;
  fileName: string;
  mimeType: string;
  driveFileId: string;
  url: string;
  thumbnailUrl?: string;
}

export interface InventoryItem {
  item: string;
  category: string;
  initialQty: number | '';
  bufferQty: number | '';
  availableQty: number | '';
  reservedQty: number;
  updatedAt: string;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface StaffLocation {
  id: string;
  userId: string;
  name: string;
  role: 'TL' | 'SPG' | 'CREW';
  venueId: string;
  shift: string;
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  ageMinutes: number;
  status: 'LIVE' | 'RECENT' | 'STALE';
}
