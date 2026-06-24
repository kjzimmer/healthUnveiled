import { useState, FormEvent } from 'react';

const STORAGE_KEY = 'hu_subscribed';

export default function TeaserApp() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'already'>(
    () => localStorage.getItem(STORAGE_KEY) ? 'already' : 'idle'
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) {
        localStorage.setItem(STORAGE_KEY, '1');
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <header className="masthead">
        <span className="masthead-title">Health Unveiled</span>
        <nav className="masthead-links">
          <a href="https://abundancearchitecture.world">AbundanceArchitecture.world</a>
          <a href="https://freemarketwatch.world">FreeMarketWatch.world</a>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">A site in development</p>
        <h1 className="hero-title">Health Unveiled</h1>
        <p className="hero-thesis">
          The system isn't broken. It's working exactly as designed.<br />
          The design is the problem.
        </p>
      </section>

      <main className="content">
        <section className="section">
          <p className="section-label">The Argument</p>
          <p className="body-text">Modern medicine has delivered extraordinary things. The knowledge base is real. The technology is remarkable. The people inside it — the clinicians, the researchers, the practitioners — are largely doing their best within the system they inherited.</p>
          <p className="emphasis">The system itself is a different matter.</p>
          <p className="body-text">The standard of care is not primarily organized around creating health. It is organized around a business model. And a business model built on treating illness has a structural relationship with illness worth examining carefully: it does not benefit from resolving the conditions that generate its customers.</p>
          <p className="body-text">This is not a claim about malice. It is a claim about incentives — the same analytical lens that reveals the distortions in monetary systems, in information ecosystems, in governance structures. When the incentive structure of a system is misaligned with its stated purpose, the system reliably produces outcomes that serve the incentive rather than the purpose. Modern medicine's incentive structure is misaligned with health in specific, documentable, structural ways.</p>
          <p className="body-text">Health Unveiled applies that framework here: not attacking the people inside the system but examining the architecture of the system itself. What structural properties would a health system actually organized around creating health require? What exists already? What needs to be built?</p>
        </section>

        <section className="section">
          <p className="section-label">What This Site Explores</p>
          <ul className="questions-list">
            <li>The relationship between the standard of care and the conditions it treats.</li>
            <li>Why chronic disease has expanded alongside the growth of the medical system designed to address it.</li>
            <li>What the research shows when it is not filtered through the interests of those who funded it.</li>
            <li>What health sovereignty looks like as a structural alternative — not rejection of medicine but reclamation of the individual's role as the primary agent of their own health.</li>
          </ul>
        </section>

        <section className="section">
          <p className="section-label">Part of a Larger Project</p>
          <div className="connection-block">
            <p>Health Unveiled is one expression of the framework developed in <em>Abundance Architecture</em> — a book examining why human flourishing requires deliberate choices about the architecture of the systems governing daily life.</p>
            <p>The monetary argument is developed at FreeMarketWatch.world. The health argument lives here. The same structural diagnosis, applied to the system most people interact with most personally.</p>
            <div className="connection-links">
              <a href="https://abundancearchitecture.world">Abundance Architecture</a>
              <a href="https://freemarketwatch.world">Free Market Watch</a>
            </div>
          </div>
        </section>

        <section className="follow-section">
          <p className="section-label">Stay Connected</p>
          <p className="follow-text">This site is in development. Follow to be notified when content launches.</p>
          {status === 'success' || status === 'already' ? (
            <p className="follow-text" style={{ color: 'var(--accent-warm)', fontStyle: 'italic' }}>
              {status === 'success' ? 'You\'re on the list. We\'ll be in touch when content launches.' : 'You\'re already on the list.'}
            </p>
          ) : (
            <form className="email-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Follow this project'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p style={{ fontSize: '0.85rem', color: '#c0392b', marginTop: '0.5rem' }}>
              Something went wrong. Please try again.
            </p>
          )}
        </section>
      </main>

      <footer className="footer">
        <span className="footer-brand">HealthUnveiled.world</span>
        <nav className="footer-links">
          <a href="https://abundancearchitecture.world">AbundanceArchitecture.world</a>
          <a href="https://freemarketwatch.world">FreeMarketWatch.world</a>
        </nav>
      </footer>
    </>
  );
}
