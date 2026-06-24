import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiFetch';
import type { Message } from '../types';

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; messages: Message[] }>('/api/contact');
      setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) {
      await apiFetch(`/api/contact/${id}/read`, { method: 'PATCH' });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  const unreadCount = messages.filter(m => !m.read).length;
  const visible = showUnreadOnly ? messages.filter(m => !m.read) : messages;

  return (
    <div className="inbox">
      <div className="page-header" style={{ padding: '0 0 1.5rem' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              Inbox
              {unreadCount > 0 && (
                <span className="badge badge-contact" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="page-subtitle">{messages.length} total messages</p>
          </div>
          <div className="inbox-filters">
            <button
              className={`btn btn-sm ${showUnreadOnly ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              Unread only
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">{showUnreadOnly ? 'No unread messages.' : 'No messages yet.'}</div>
      ) : (
        <div className="inbox-list">
          {visible.map(msg => (
            <div key={msg.id} className="inbox-item">
              <div className="inbox-header" onClick={() => toggleExpand(msg.id)}>
                {msg.read ? <span className="read-dot" /> : <span className="unread-dot" />}
                <div className="inbox-sender">
                  <div className={`inbox-name${msg.read ? ' read' : ''}`}>{msg.name}</div>
                  <div className="inbox-email">{msg.email}</div>
                </div>
                <div className="inbox-subject">{msg.subject}</div>
                <div className="inbox-date">{formatDate(msg.createdAt)}</div>
              </div>
              {expanded === msg.id && (
                <div className="inbox-body">
                  <div className="inbox-body-meta">
                    From: {msg.name} &lt;{msg.email}&gt;
                    {msg.phone && ` · ${msg.phone}`}
                  </div>
                  {msg.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
