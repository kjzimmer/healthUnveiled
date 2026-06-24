import { prisma } from '../lib/prisma';

export type AnalyticsRange = 7 | 14 | 30;

interface DailyData {
  date: string;
  uniqueVisitors: number;
  pageViews: number;
  requests: number;
  bandwidthBytes: number;
}

interface CountryData {
  name: string;
  requests: number;
}

interface AnalyticsTotals {
  uniqueVisitors: number;
  pageViews: number;
  requests: number;
  bandwidthBytes: number;
}

export type AnalyticsResult =
  | { source: 'cloudflare' | 'local'; range: number; totals: AnalyticsTotals; daily: DailyData[]; countries: CountryData[] }
  | { source: 'unavailable'; message: string };

const cache = new Map<AnalyticsRange, { data: AnalyticsResult; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

// $zoneTag: String! — capital S required; lowercase silently rejected by Cloudflare
const CF_QUERY = `
  query($zoneTag: String!, $startDate: Date!, $endDate: Date!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequests1dGroups(
          limit: 31
          filter: { date_geq: $startDate, date_leq: $endDate }
          orderBy: [date_ASC]
        ) {
          dimensions { date }
          uniq { uniques }
          sum {
            requests
            pageViews
            bytes
            countryMap { clientCountryName requests }
          }
        }
      }
    }
  }
`;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sumTotals(daily: DailyData[]): AnalyticsTotals {
  return daily.reduce<AnalyticsTotals>(
    (acc, d) => ({
      uniqueVisitors: acc.uniqueVisitors + d.uniqueVisitors,
      pageViews: acc.pageViews + d.pageViews,
      requests: acc.requests + d.requests,
      bandwidthBytes: acc.bandwidthBytes + d.bandwidthBytes,
    }),
    { uniqueVisitors: 0, pageViews: 0, requests: 0, bandwidthBytes: 0 }
  );
}

export async function fetchAnalytics(range: AnalyticsRange): Promise<AnalyticsResult> {
  const cached = cache.get(range);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const token = process.env.CF_ANALYTICS_TOKEN;
  const zoneId = process.env.CF_ZONE_ID;

  if (!token || !zoneId) {
    return { source: 'unavailable', message: 'Cloudflare analytics not configured. Set CF_ANALYTICS_TOKEN and CF_ZONE_ID.' };
  }

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (range - 1) * 24 * 60 * 60 * 1000);

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: CF_QUERY,
        variables: { zoneTag: zoneId, startDate: toDateStr(startDate), endDate: toDateStr(endDate) },
      }),
    });

    if (!res.ok) throw new Error(`Cloudflare API ${res.status}`);

    // CF response has no TS types — any is required here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await res.json() as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups: any[] = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];

    const daily: DailyData[] = groups.map((g) => ({
      date: g.dimensions.date as string,
      uniqueVisitors: g.uniq.uniques as number,
      pageViews: g.sum.pageViews as number,
      requests: g.sum.requests as number,
      bandwidthBytes: g.sum.bytes as number,
    }));

    const countryMap = new Map<string, number>();
    for (const g of groups) {
      for (const c of (g.sum.countryMap ?? []) as Array<{ clientCountryName: string; requests: number }>) {
        countryMap.set(c.clientCountryName, (countryMap.get(c.clientCountryName) ?? 0) + c.requests);
      }
    }
    const countries: CountryData[] = [...countryMap.entries()]
      .map(([name, requests]) => ({ name, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 8);

    // Persist for retention beyond CF's 30-day window
    await Promise.all(
      daily.map((d) =>
        prisma.dailyAnalytics.upsert({
          where: { date: new Date(d.date) },
          update: { uniqueVisitors: d.uniqueVisitors, pageViews: d.pageViews, requests: d.requests, bandwidthBytes: BigInt(Math.round(d.bandwidthBytes)) },
          create: { date: new Date(d.date), site: 'health-unveiled', uniqueVisitors: d.uniqueVisitors, pageViews: d.pageViews, requests: d.requests, bandwidthBytes: BigInt(Math.round(d.bandwidthBytes)) },
        })
      )
    );

    const result: AnalyticsResult = { source: 'cloudflare', range, totals: sumTotals(daily), daily, countries };
    cache.set(range, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (err) {
    console.error('[analytics] Cloudflare fetch failed, falling back to local DB:', err);
    return fetchFromLocal(range);
  }
}

async function fetchFromLocal(range: AnalyticsRange): Promise<AnalyticsResult> {
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
  const rows = await prisma.dailyAnalytics.findMany({
    where: { date: { gte: since }, site: 'health-unveiled' },
    orderBy: { date: 'asc' },
  });

  if (rows.length === 0) {
    return { source: 'unavailable', message: 'No analytics data available.' };
  }

  const daily: DailyData[] = rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    uniqueVisitors: r.uniqueVisitors,
    pageViews: r.pageViews,
    requests: r.requests,
    bandwidthBytes: Number(r.bandwidthBytes),
  }));

  return { source: 'local', range, totals: sumTotals(daily), daily, countries: [] };
}
