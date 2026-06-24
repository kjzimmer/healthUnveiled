import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiFetch';
import type { Person, PersonDetail } from '../types';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [filtered, setFiltered] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PersonDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  const loadPeople = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await apiFetch<{ success: boolean; people: Person[] }>('/api/people');
      setPeople(data.people);
      setFiltered(data.people);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadPeople(); }, [loadPeople]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(people.filter(p =>
      p.email.toLowerCase().includes(q) || (p.name ?? '').toLowerCase().includes(q)
    ));
  }, [search, people]);

  async function selectPerson(id: string) {
    setLoadingDetail(true);
    try {
      const data = await apiFetch<{ success: boolean; person: PersonDetail }>(`/api/people/${id}`);
      setSelected(data.person);
      setEditName(data.person.name ?? '');
      setEditPhone(data.person.phone ?? '');
      setEditNotes(data.person.notes ?? '');
      setEditTags(data.person.tags.join(', '));
    } finally {
      setLoadingDetail(false);
    }
  }

  async function savePerson() {
    if (!selected) return;
    setSaving(true);
    try {
      await apiFetch(`/api/people/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName || undefined,
          phone: editPhone || undefined,
          notes: editNotes || undefined,
          tags: editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      });
      await loadPeople();
      await selectPerson(selected.id);
    } finally {
      setSaving(false);
    }
  }

  async function deletePerson() {
    if (!selected || !confirm(`Delete ${selected.email}? This cannot be undone.`)) return;
    await apiFetch(`/api/people/${selected.id}`, { method: 'DELETE' });
    setSelected(null);
    await loadPeople();
  }

  function copySubscriberEmails() {
    const emails = people.filter(p => p.newsletter?.active).map(p => p.email).join(', ');
    navigator.clipboard.writeText(emails).then(() => {
      setCopyMsg(`Copied ${people.filter(p => p.newsletter?.active).length} emails`);
      setTimeout(() => setCopyMsg(''), 2500);
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="people-layout" style={{ height: '100vh' }}>
      {/* List panel */}
      <div className="people-list">
        <div className="people-toolbar">
          <input
            className="form-input people-search"
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-1 items-center justify-between" style={{ marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)' }}>{filtered.length} people</span>
            <button className="btn btn-sm btn-ghost" onClick={copySubscriberEmails}>
              {copyMsg || 'Copy subscriber emails'}
            </button>
          </div>
        </div>
        {loadingList ? (
          <div className="loading">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No people found.</div>
        ) : (
          filtered.map(p => (
            <div
              key={p.id}
              className={`person-card${selected?.id === p.id ? ' selected' : ''}`}
              onClick={() => selectPerson(p.id)}
            >
              <div className="person-email">{p.email}</div>
              {p.name && <div className="person-name">{p.name}</div>}
              <div className="person-badges">
                {p.newsletter?.active && <span className="badge badge-subscriber">Subscriber</span>}
                {p.isAdmin && <span className="badge badge-admin">Admin</span>}
                {p._count.contacts > 0 && (
                  <span className="badge badge-contact">{p._count.contacts} msg</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail panel */}
      <div className="people-detail">
        {!selected ? (
          <div className="empty-state" style={{ paddingTop: '5rem' }}>
            Select a person to view details
          </div>
        ) : loadingDetail ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            <div className="detail-section">
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selected.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '0.15rem' }}>
                    Added {formatDate(selected.createdAt)}
                    {selected.newsletter && ` · Subscribed ${formatDate(selected.newsletter.subscribedAt)}`}
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={deletePerson}>Delete</button>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Edit</div>
              <div className="detail-grid">
                <div className="detail-field">
                  <label>Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="detail-field">
                  <label>Phone</label>
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone number" />
                </div>
                <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Notes</label>
                  <textarea rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Internal notes" />
                </div>
                <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Tags (comma-separated)</label>
                  <input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="tag1, tag2" />
                </div>
              </div>
              <div className="detail-actions">
                <button className="btn btn-primary btn-sm" onClick={savePerson} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {selected.contacts.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Messages ({selected.contacts.length})</div>
                {selected.contacts.map(c => (
                  <div key={c.id} className="contact-mini">
                    <div className="contact-mini-subject">{c.subject}</div>
                    <div className="contact-mini-meta">{formatDate(c.createdAt)} · {c.read ? 'Read' : 'Unread'}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
