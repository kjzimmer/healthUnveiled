export interface Person {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  tags: string[];
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  newsletter: { active: boolean; subscribedAt: string } | null;
  _count: { contacts: number; sessions: number };
}

export interface PersonDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  tags: string[];
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  newsletter: { id: string; active: boolean; sourceSite: string; subscribedAt: string } | null;
  contacts: Message[];
  sessions: Array<{ id: string; createdAt: string; expiresAt: string }>;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read: boolean;
  sourceSite: string;
  createdAt: string;
  person: { id: string; name: string | null } | null;
}

export interface DailyData {
  date: string;
  uniqueVisitors: number;
  pageViews: number;
  requests: number;
  bandwidthBytes: number;
}

export interface CountryData {
  name: string;
  requests: number;
}

export interface AnalyticsTotals {
  uniqueVisitors: number;
  pageViews: number;
  requests: number;
  bandwidthBytes: number;
}

export type AnalyticsRange = 7 | 14 | 30;

export type AnalyticsResult =
  | { source: 'cloudflare' | 'local'; range: number; totals: AnalyticsTotals; daily: DailyData[]; countries: CountryData[] }
  | { source: 'unavailable'; message: string };
