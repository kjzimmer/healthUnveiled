import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { apiFetch } from '../lib/apiFetch';
import type { AnalyticsResult, AnalyticsRange } from '../types';

const RANGES: AnalyticsRange[] = [7, 14, 30];

function fmt(n: number) { return n.toLocaleString(); }
function fmtBytes(b: number) {
  if (b > 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  return `${(b / 1e3).toFixed(0)} KB`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>(30);
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (r: AnalyticsRange) => {
    setLoading(true);
    try {
      const result = await apiFetch<AnalyticsResult>(`/api/analytics?range=${r}`);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(range); }, [range, load]);

  function selectRange(r: AnalyticsRange) {
    setRange(r);
  }

  return (
    <div className="analytics-wrap">
      <div className="page-header" style={{ padding: '0 0 1.5rem' }}>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Cloudflare Zone Analytics</p>
      </div>

      <div className="range-tabs">
        {RANGES.map(r => (
          <button
            key={r}
            className={`range-tab${range === r ? ' active' : ''}`}
            onClick={() => selectRange(r)}
          >
            {r}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading analytics…</div>
      ) : !data ? null
        : data.source === 'unavailable' ? (
          <div className="unavailable-notice">
            <h3>Analytics not configured</h3>
            <p>{data.message}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.78rem' }}>
              Add CF_ANALYTICS_TOKEN and CF_ZONE_ID to your Railway environment variables.
            </p>
          </div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Unique Visitors</div>
                <div className="stat-value">{fmt(data.totals.uniqueVisitors)}</div>
                <div className="stat-source">{data.range}d · {data.source}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Page Views</div>
                <div className="stat-value">{fmt(data.totals.pageViews)}</div>
                <div className="stat-source">{data.range}d · {data.source}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Requests</div>
                <div className="stat-value">{fmt(data.totals.requests)}</div>
                <div className="stat-source">{fmtBytes(data.totals.bandwidthBytes)} transferred</div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Visitors &amp; Page Views</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.daily.map(d => ({ ...d, date: fmtDate(d.date) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.07)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6764' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b6764' }} width={45} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#7a4a20" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pageViews" name="Page Views" stroke="#3a2a1a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="two-col">
              {data.countries.length > 0 && (
                <div className="chart-card" style={{ marginBottom: 0 }}>
                  <div className="chart-title">Top Countries</div>
                  {(() => {
                    const max = data.countries[0]?.requests ?? 1;
                    return data.countries.map(c => (
                      <div key={c.name} className="country-row">
                        <span className="country-name">{c.name}</span>
                        <div className="country-bar-wrap">
                          <div className="country-bar" style={{ width: `${(c.requests / max) * 100}%` }} />
                        </div>
                        <span className="country-count">{fmt(c.requests)}</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className="pro-grid">
              {['Device Types', 'Top Pages', 'Top Referrers'].map(label => (
                <div key={label} className="pro-card">
                  <div className="pro-card-label">{label}</div>
                  <div className="pro-card-notice">
                    Requires Cloudflare Pro plan + Web Analytics setup (CF_WEB_ANALYTICS_SITE_TAG).
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      }
    </div>
  );
}
