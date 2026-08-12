import { useState, useEffect, useRef, type FormEvent } from 'react'
import type { Article } from './types/article'
import { FALLBACK_ARTICLES } from './data/fallbackArticles'
import { fetchArticles, isApiConfigured } from './lib/api'
import PublishPage from './pages/PublishPage'

type Page = 'home' | 'article' | 'about' | 'explore' | 'publish'
type NavFn = (page: Page, article?: Article) => void
const TOPICS = [
  { name: 'Life', count: 12 },
  { name: 'Technology', count: 8 },
  { name: 'Business', count: 5 },
  { name: 'Society', count: 7 },
  { name: 'Youth', count: 6 },
  { name: 'Leadership', count: 4 },
  { name: 'Creativity', count: 9 },
  { name: 'Human Behavior', count: 11 },
  { name: 'Personal Reflections', count: 14 },
  { name: 'Ideas', count: 3 },
]

// ─── Shared Atoms ─────────────────────────────────────────────────────────────

const WRAP = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' } as const

function CategoryLabel({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
      color: 'var(--accent)', display: 'block',
    }}>
      {label}
    </span>
  )
}

function ArticleCard({ article, navigate, large = false }: { article: Article; navigate: NavFn; large?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
      onClick={() => navigate('article', article)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ overflow: 'hidden', aspectRatio: large ? '16/10' : '3/2', background: 'var(--muted)', marginBottom: 20 }}>
        <img
          src={article.image}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.6s ease' }}
        />
      </div>
      <CategoryLabel label={article.category} />
      <h3 style={{
        fontFamily: 'var(--font-serif)', fontWeight: 600,
        fontSize: large ? 24 : 18, lineHeight: 1.3, margin: '10px 0 8px',
        color: 'var(--ink)', transition: 'color 0.2s',
        ...(hovered ? { color: 'var(--accent)' } : {}),
      }}>
        {article.title}
      </h3>
      {large && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', margin: '0 0 14px' }}>
          {article.excerpt}
        </p>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.02em', marginTop: 'auto', paddingTop: 6 }}>
        {article.date} · {article.readTime}
      </div>
    </article>
  )
}

function CompactCard({ article, navigate }: { article: Article; navigate: NavFn }) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      style={{ cursor: 'pointer', display: 'flex', gap: 16, padding: '20px 0', borderTop: '1px solid var(--border)' }}
      onClick={() => navigate('article', article)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1 }}>
        <CategoryLabel label={article.category} />
        <h4 style={{
          fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, lineHeight: 1.35,
          margin: '8px 0 6px', color: hovered ? 'var(--accent)' : 'var(--ink)', transition: 'color 0.2s',
        }}>
          {article.title}
        </h4>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>{article.readTime}</span>
      </div>
      <div style={{ width: 72, height: 72, flexShrink: 0, overflow: 'hidden', background: 'var(--muted)' }}>
        <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </article>
  )
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function Nav({ page, navigate, dark, setDark }: { page: Page; navigate: NavFn; dark: boolean; setDark: (v: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links: { label: string; p: Page }[] = [
    { label: 'Home', p: 'home' },
    { label: 'Explore', p: 'explore' },
    { label: 'About', p: 'about' },
    { label: 'Publish', p: 'publish' },
  ]

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--paper)',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.05)' : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>
        <div style={{ ...WRAP, display: 'flex', alignItems: 'center', height: 64, gap: 40 }}>
          {/* Logo */}
          <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--ink)', lineHeight: 1 }}>
              TAFAKURI
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.1em', marginTop: 3 }}>
              by Ndomi
            </span>
          </button>

          {/* Center nav */}
          <nav className="hidden md:flex" style={{ gap: 28, flex: 1, justifyContent: 'center' }}>
            {links.map(l => (
              <button key={l.p} onClick={() => navigate(l.p)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                color: page === l.p ? 'var(--accent)' : 'var(--ink-2)',
                padding: '4px 0',
                borderBottom: `1px solid ${page === l.p ? 'var(--accent)' : 'transparent'}`,
                transition: 'color 0.2s',
              }}>
                {l.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4, display: 'flex' }}>
              {dark ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            <button className="hidden md:block" style={{
              background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              padding: '9px 18px',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-h)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              SUBSCRIBE
            </button>

            <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: 4, display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setMenuOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(24,22,26,0.5)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 280, background: 'var(--paper)', padding: '28px 32px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--ink)' }}>TAFAKURI</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              {links.map(l => (
                <button key={l.p} onClick={() => { navigate(l.p); setMenuOpen(false) }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 500, color: 'var(--ink)',
                  padding: '14px 0', borderBottom: '1px solid var(--border)',
                }}>
                  {l.label}
                </button>
              ))}
            </nav>
            <button style={{
              marginTop: 36, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
              padding: '13px 20px',
            }}>
              SUBSCRIBE
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ navigate }: { navigate: NavFn }) {
  return (
    <section style={{ position: 'relative', paddingTop: 128, paddingBottom: 112, overflow: 'hidden' }}>
      {/* Ghost watermark */}
      <div aria-hidden style={{
        position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'var(--font-serif)', fontSize: 'clamp(140px, 22vw, 300px)', fontWeight: 700,
        letterSpacing: '0.12em', color: 'var(--ink)', opacity: 0.028, userSelect: 'none',
        lineHeight: 1, pointerEvents: 'none',
      }}>
        TAFAKURI
      </div>

      <div style={WRAP}>
        <div style={{ maxWidth: 720, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ width: 28, height: 1, background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)' }}>
              VOLUME I · EST. 2026
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 700,
            fontSize: 'clamp(48px, 7vw, 88px)',
            lineHeight: 1.08, margin: 0, color: 'var(--ink)', letterSpacing: '-0.01em',
          }}>
            Think deeper.
          </h1>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(44px, 6.4vw, 80px)',
            lineHeight: 1.08, margin: '8px 0 0', color: 'var(--ink)', letterSpacing: '-0.01em',
          }}>
            See differently.
          </h1>

          <div style={{ width: 48, height: 2, background: 'var(--accent)', margin: '40px 0' }} />

          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.75, color: 'var(--ink-2)',
            maxWidth: 520, margin: '0 0 48px',
          }}>
            Ideas, stories and perspectives about the things that shape how we understand ourselves and the world around us.
          </p>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => navigate('explore')}
              style={{
                background: 'var(--ink)', color: 'var(--paper)', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
                padding: '14px 32px', transition: 'background 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)' }}
            >
              EXPLORE TAFAKURI
            </button>
            <button
              onClick={() => navigate('about')}
              style={{
                background: 'none', color: 'var(--ink-2)', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                padding: '14px 0', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-2)' }}
            >
              About the Writer
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Featured ─────────────────────────────────────────────────────────────────

function FeaturedSection({ article, navigate }: { article: Article; navigate: NavFn }) {
  const [hovered, setHovered] = useState(false)
  return (
    <section style={{ background: 'var(--surface)', padding: '72px 0' }}>
      <div style={WRAP}>
        <div className="r-grid-featured" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Text side */}
          <div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--paper)', background: 'var(--accent)', padding: '4px 10px' }}>
                FEATURED
              </span>
              <CategoryLabel label={article.category} />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 700,
                lineHeight: 1.2, margin: '0 0 20px', color: 'var(--ink)', letterSpacing: '-0.01em',
                cursor: 'pointer', transition: 'color 0.2s',
                ...(hovered ? { color: 'var(--accent)' } : {}),
              }}
              onClick={() => navigate('article', article)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {article.title}
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.75, color: 'var(--ink-2)', margin: '0 0 32px' }}>
              {article.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'var(--muted)', flexShrink: 0 }}>
                <img src="https://images.unsplash.com/photo-1618946461168-71b8412e63cf?w=80&h=80&fit=crop&auto=format" alt="Ndomi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{article.author}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>{article.date} · {article.readTime}</div>
              </div>
            </div>
            <button
              onClick={() => navigate('article', article)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
                color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Read this piece
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Image side */}
          <div style={{ overflow: 'hidden', aspectRatio: '4/3', background: 'var(--muted)' }}>
            <img
              src={article.image}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
              onClick={() => navigate('article', article)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Latest Grid ──────────────────────────────────────────────────────────────

function LatestSection({ articles, navigate }: { articles: Article[]; navigate: NavFn }) {
  const grid = articles.slice(1, 8)
  return (
    <section style={{ padding: '96px 0' }}>
      <div style={WRAP}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}>
              Latest Tafakuri
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
              Recent thoughts, observations and stories.
            </p>
          </div>
          <button onClick={() => navigate('explore')} style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--ink-2)', padding: '9px 18px', letterSpacing: '0.04em', transition: 'border-color 0.2s, color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-2)' }}
          >
            View all →
          </button>
        </div>

        {/* Main two-column row */}
        <div className="r-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 56 }}>
          <ArticleCard article={grid[0]} navigate={navigate} large />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {grid.slice(1, 4).map(a => <CompactCard key={a.id} article={a} navigate={navigate} />)}
          </div>
        </div>

        {/* Three-column row */}
        <div className="r-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, paddingTop: 48, borderTop: '1px solid var(--border)' }}>
          {grid.slice(4, 7).map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Thinking Section ─────────────────────────────────────────────────────────

function ThinkingSection() {
  return (
    <section style={{ background: 'var(--ink)', padding: '112px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Ghost letter */}
      <div aria-hidden style={{
        position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'var(--font-serif)', fontSize: 320, fontWeight: 700, fontStyle: 'italic',
        color: 'var(--paper)', opacity: 0.03, userSelect: 'none', lineHeight: 1, pointerEvents: 'none',
      }}>
        T
      </div>
      <div style={{ ...WRAP, position: 'relative' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--accent)', opacity: 0.4 }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--accent)' }}>
              SOME THINGS DESERVE A SECOND THOUGHT
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--accent)', opacity: 0.4 }} />
          </div>

          <blockquote style={{ margin: 0 }}>
            <p style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(24px, 4vw, 42px)', lineHeight: 1.45,
              color: 'var(--paper)', margin: '0 0 48px', letterSpacing: '-0.01em',
            }}>
              "Ordinary things, examined deeply,<br />reveal extraordinary truths."
            </p>
            <footer style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--accent)' }}>
              — THE PHILOSOPHY OF TAFAKURI
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

// ─── Topics ───────────────────────────────────────────────────────────────────

function TopicsSection({ navigate }: { navigate: NavFn }) {
  const [active, setActive] = useState<string | null>(null)
  return (
    <section style={{ padding: '96px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={WRAP}>
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}>
            Explore by Topic
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
            Follow a thought. Find something worth thinking about.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          {TOPICS.map(t => (
            <button
              key={t.name}
              onClick={() => { setActive(active === t.name ? null : t.name); navigate('explore') }}
              onMouseEnter={e => { if (active !== t.name) e.currentTarget.style.background = 'var(--surface)' }}
              onMouseLeave={e => { if (active !== t.name) e.currentTarget.style.background = 'transparent' }}
              style={{
                background: active === t.name ? 'var(--ink)' : 'transparent',
                border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left',
                padding: '24px 28px', transition: 'background 0.2s',
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: active === t.name ? 'var(--paper)' : 'var(--ink)', marginBottom: 8 }}>
                {t.name}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: active === t.name ? 'var(--accent)' : 'var(--ink-3)', letterSpacing: '0.04em' }}>
                {t.count} articles
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Most Read ────────────────────────────────────────────────────────────────

function MostReadSection({ articles, navigate }: { articles: Article[]; navigate: NavFn }) {
  const ranked = articles.filter(a => a.mostRead).sort((a, b) => (a.mostRead ?? 9) - (b.mostRead ?? 9))
  return (
    <section style={{ padding: '96px 0' }}>
      <div style={WRAP}>
        <div className="r-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, margin: '0 0 48px', color: 'var(--ink)' }}>
              Most Read
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ranked.map((a, i) => (
                <MostReadItem key={a.id} article={a} rank={i + 1} navigate={navigate} />
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--surface)', padding: 48 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)' }}>
              FROM THE WRITER
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, lineHeight: 1.4, margin: '16px 0 20px', color: 'var(--ink)' }}>
              "Tafakuri exists because ordinary things deserve extraordinary attention."
            </h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)', margin: '0 0 32px' }}>
              This publication began as a personal need — a space to think slowly in a world that rewards thinking fast. Every piece here is an attempt to go a little deeper, see a little further, and question what we think we already understand.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: 'var(--muted)', flexShrink: 0 }}>
                <img src="https://images.unsplash.com/photo-1618946461168-71b8412e63cf?w=96&h=96&fit=crop&auto=format" alt="Ndomi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Ndomi</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>Founder, Tafakuri</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MostReadItem({ article, rank, navigate }: { article: Article; rank: number; navigate: NavFn }) {
  const [hovered, setHovered] = useState(false)
  const num = String(rank).padStart(2, '0')
  return (
    <div
      style={{ display: 'flex', gap: 24, padding: '24px 0', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={() => navigate('article', article)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, color: hovered ? 'var(--accent)' : 'var(--muted)', lineHeight: 1, flexShrink: 0, transition: 'color 0.2s', width: 48 }}>
        {num}
      </span>
      <div style={{ flex: 1 }}>
        <CategoryLabel label={article.category} />
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: '8px 0 6px', color: hovered ? 'var(--accent)' : 'var(--ink)', transition: 'color 0.2s' }}>
          {article.title}
        </h4>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>{article.readTime}</span>
      </div>
    </div>
  )
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section style={{ background: 'var(--surface)', padding: '96px 0' }}>
      <div style={{ ...WRAP, textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ width: 40, height: 1, background: 'var(--accent)', margin: '0 auto 32px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, margin: '0 0 16px', color: 'var(--ink)', lineHeight: 1.25 }}>
            Give your mind something to think about.
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-2)', margin: '0 0 40px' }}>
            Receive new ideas and articles from Tafakuri directly in your inbox.
          </p>

          {submitted ? (
            <div style={{ background: 'var(--paper)', padding: '24px 32px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 6 }}>
                YOU'RE IN
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--ink)' }}>
                Thank you. Something worth reading will arrive soon.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{
                  flex: 1, border: '1px solid var(--border)', borderRight: 'none', padding: '13px 18px',
                  fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--paper)', color: 'var(--ink)',
                  outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                padding: '13px 24px', flexShrink: 0, transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-h)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                SUBSCRIBE
              </button>
            </form>
          )}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)', margin: '16px 0 0' }}>
            No spam. Only ideas worth thinking about. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ navigate }: { navigate: NavFn }) {
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '72px 0 40px' }}>
      <div style={WRAP}>
        <div className="r-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Brand */}
          <div>
            <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--paper)', lineHeight: 1 }}>TAFAKURI</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', marginTop: 4 }}>by Ndomi</div>
            </button>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.75, color: 'rgba(237,233,225,0.5)', margin: '0 0 28px', maxWidth: 280 }}>
              A premium editorial publication for deep reflection, ideas and perspectives worth thinking about.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Twitter / X', 'Instagram', 'LinkedIn'].map(s => (
                <button key={s} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, color: 'rgba(237,233,225,0.4)', letterSpacing: '0.04em', padding: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(237,233,225,0.4)'}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: 20 }}>NAVIGATE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Home', 'home'], ['Explore', 'explore'], ['About', 'about'], ['Publish', 'publish']].map(([l, p]) => (
                <button key={p} onClick={() => navigate(p as Page)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(237,233,225,0.6)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--paper)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(237,233,225,0.6)'}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: 20 }}>TOPICS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TOPICS.slice(0, 6).map(t => (
                <button key={t.name} onClick={() => navigate('explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(237,233,225,0.6)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--paper)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(237,233,225,0.6)'}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Subscribe */}
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: 20 }}>NEWSLETTER</div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.65, color: 'rgba(237,233,225,0.5)', margin: '0 0 20px' }}>
              Ideas worth thinking about, in your inbox.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="email" placeholder="Your email" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--paper)', outline: 'none' }} />
              <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '11px 0', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-h)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'rgba(237,233,225,0.35)' }}>
            Think deeper. See differently.
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(237,233,225,0.3)', letterSpacing: '0.04em' }}>
            © 2026 Tafakuri · An Ndomi Publication
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ articles, navigate }: { articles: Article[]; navigate: NavFn }) {
  if (articles.length === 0) return null
  return (
    <main style={{ paddingTop: 64 }}>
      <HeroSection navigate={navigate} />
      <FeaturedSection article={articles[0]} navigate={navigate} />
      <LatestSection articles={articles} navigate={navigate} />
      <ThinkingSection />
      <TopicsSection navigate={navigate} />
      <MostReadSection articles={articles} navigate={navigate} />
      <NewsletterSection />
    </main>
  )
}

// ─── Article Page ─────────────────────────────────────────────────────────────

function ArticlePage({ article, articles, navigate }: { article: Article; articles: Article[]; navigate: NavFn }) {
  const [progress, setProgress] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => {
      const el = bodyRef.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const scrolled = Math.max(0, -top)
      const pct = Math.min(1, scrolled / (height - window.innerHeight + 200))
      setProgress(pct)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const related = articles.filter(a => a.id !== article.id).slice(0, 3)

  return (
    <main style={{ paddingTop: 64 }}>
      {/* Reading progress */}
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 40, height: 2, background: 'var(--border)' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${progress * 100}%`, transition: 'width 0.1s' }} />
      </div>

      {/* Article header */}
      <div style={{ ...WRAP, paddingTop: 64 }}>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', padding: 0, marginBottom: 48, letterSpacing: '0.04em', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Tafakuri
        </button>

        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <CategoryLabel label={article.category} />

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700,
            lineHeight: 1.15, margin: '16px 0 20px', color: 'var(--ink)', letterSpacing: '-0.01em',
          }}>
            {article.title}
          </h1>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.65, color: 'var(--ink-2)', margin: '0 0 36px', fontWeight: 300 }}>
            {article.subtitle}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 36, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--muted)', flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1618946461168-71b8412e63cf?w=88&h=88&fit=crop&auto=format" alt="Ndomi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{article.author}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>{article.date} · {article.readTime}</div>
            </div>
            {/* Share */}
            <div style={{ display: 'flex', gap: 8 }}>
              {['Share', 'Copy link'].map(label => (
                <button key={label} style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', padding: '7px 12px', letterSpacing: '0.04em', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-3)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ maxWidth: 1000, margin: '56px auto', padding: '0 24px' }}>
        <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'var(--muted)' }}>
          <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Body + Sidebar */}
      <div ref={bodyRef} style={{ ...WRAP, paddingBottom: 96 }}>
        <div className="r-grid-article" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 72, alignItems: 'start' }}>
          {/* Article body */}
          <div style={{ maxWidth: 680 }}>
            {article.body.map((para, i) => {
              if (para.startsWith('PULLQUOTE:')) {
                const quote = para.replace('PULLQUOTE:', '')
                return (
                  <blockquote key={i} style={{
                    margin: '48px 0', padding: '0 0 0 28px',
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22,
                      lineHeight: 1.55, color: 'var(--ink)', margin: 0, fontWeight: 500,
                    }}>
                      "{quote}"
                    </p>
                  </blockquote>
                )
              }
              return (
                <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.85, color: 'var(--ink-2)', margin: '0 0 28px' }}>
                  {para}
                </p>
              )
            })}

            {/* Article end divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '56px 0 48px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--accent)' }}>∗</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Author card */}
            <div style={{ background: 'var(--surface)', padding: '32px 36px' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'var(--muted)', flexShrink: 0 }}>
                  <img src="https://images.unsplash.com/photo-1618946461168-71b8412e63cf?w=112&h=112&fit=crop&auto=format" alt="Ndomi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 4 }}>WRITTEN BY</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Ndomi</div>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)', margin: 0 }}>
                Ndomi is a writer and thinker fascinated by the questions that matter but rarely get asked. Through Tafakuri, they explore ideas about life, technology, creativity and the human experience.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden md:block" style={{ position: 'sticky', top: 88 }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--ink-3)', marginBottom: 16 }}>ON THIS PAGE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Introduction', 'The gap between dreams and arrival', 'Why we keep moving', 'Learning to stay'].map((heading, i) => (
                  <div key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: i === 0 ? 'var(--accent)' : 'var(--ink-3)', paddingLeft: 12, borderLeft: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`, lineHeight: 1.5, transition: 'color 0.2s, border-color 0.2s', cursor: 'pointer' }}>
                    {heading}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--ink-3)', marginBottom: 12 }}>READING TIME</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{article.readTime}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--ink-3)', marginBottom: 16 }}>TOPIC</div>
              <div style={{ display: 'inline-block', background: 'var(--surface)', padding: '6px 14px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em' }}>{article.category}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--ink-3)', marginBottom: 16 }}>NEWSLETTER</div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1.65, color: 'var(--ink-3)', margin: '0 0 14px' }}>
                Ideas like this, directly in your inbox.
              </p>
              <input type="email" placeholder="Email address" style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink)', outline: 'none', marginBottom: 8 }} />
              <button style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', padding: '10px' }}>SUBSCRIBE</button>
            </div>
          </aside>
        </div>
      </div>

      {/* Related articles */}
      <div style={{ background: 'var(--surface)', padding: '72px 0' }}>
        <div style={WRAP}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Continue Thinking</h2>
            <button onClick={() => navigate('explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>View all →</button>
          </div>
          <div className="r-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
            {related.map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── About Page ───────────────────────────────────────────────────────────────

function AboutPage({ articles, navigate }: { articles: Article[]; navigate: NavFn }) {
  return (
    <main style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{ padding: '96px 0 80px', borderBottom: '1px solid var(--border)' }}>
        <div style={WRAP}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 28, height: 1, background: 'var(--accent)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)' }}>THE STORY</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 28px', color: 'var(--ink)' }}>
              Why Tafakuri Exists
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.8, color: 'var(--ink-2)', margin: 0, fontWeight: 300 }}>
              Because some ideas deserve more than a thread. Because ordinary things — examined closely — reveal extraordinary truths. Because deep thinking is becoming rare, and rarity makes it valuable.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy sections */}
      <section style={{ padding: '80px 0' }}>
        <div style={WRAP}>
          <div className="r-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
                {[
                  {
                    title: 'The Idea',
                    body: 'Tafakuri — the word itself means deep reflection, contemplation, and the act of looking beyond the obvious. It is a Swahili concept that captures something universally human: the practice of thinking slowly about things that deserve to be thought about slowly.',
                  },
                  {
                    title: 'Why We Write',
                    body: "Writing is thinking made visible. Every piece published here is an attempt to follow a question to its honest conclusion — not to a clean resolution, but to a more accurate understanding. We write because the surface is never where the truth lives.",
                  },
                  {
                    title: 'What We Explore',
                    body: 'Life. Technology. Society. Youth. Leadership. Creativity. Human behavior. Business. Ideas. The things that shape how we understand ourselves and each other — examined from angles that most conversations skip past.',
                  },
                  {
                    title: 'What We Believe',
                    body: 'That most things deserve a second thought. That depth is a form of respect. That a well-asked question is more valuable than a confident answer. That reading slowly is still an act of radical attention in a world built for speed.',
                  },
                ].map(s => (
                  <div key={s.title}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, margin: '0 0 16px', color: 'var(--ink)' }}>{s.title}</h2>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8, color: 'var(--ink-2)', margin: 0 }}>{s.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Author */}
            <div style={{ position: 'sticky', top: 96 }}>
              <div style={{ background: 'var(--surface)', padding: 0, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '4/5', overflow: 'hidden', background: 'var(--muted)' }}>
                  <img src="https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?w=600&h=750&fit=crop&auto=format" alt="Ndomi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 36 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: 12 }}>THE WRITER</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, margin: '0 0 16px', color: 'var(--ink)' }}>Ndomi</h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)', margin: '0 0 24px' }}>
                    Writer. Thinker. Founder of Tafakuri. Fascinated by the questions that matter but rarely get asked — and committed to asking them, slowly, in public.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {['Life', 'Technology', 'Creativity', 'Human Behavior'].map(t => (
                      <span key={t} style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', background: 'var(--muted)', padding: '5px 12px' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 32, padding: '28px 36px', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: 12 }}>ABOUT NDOMI</div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)', margin: '0 0 16px' }}>
                  Tafakuri is an editorial publication by Ndomi — a creative and technology organization committed to building things that make people think.
                </p>
                <button onClick={() => navigate('explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--accent)', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Read the writing <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest from the writer */}
      <section style={{ background: 'var(--surface)', padding: '72px 0' }}>
        <div style={WRAP}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, margin: '0 0 48px', color: 'var(--ink)' }}>Latest Writing</h2>
          <div className="r-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
            {articles.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
          </div>
        </div>
      </section>

      <NewsletterSection />
    </main>
  )
}

// ─── Explore Page ─────────────────────────────────────────────────────────────

function ExplorePage({ articles, navigate }: { articles: Article[]; navigate: NavFn }) {
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  const filtered = articles.filter(a => {
    const matchesTopic = !activeTopic || a.category.toLowerCase().includes(activeTopic.toLowerCase())
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchesTopic && matchesSearch
  })

  return (
    <main style={{ paddingTop: 64 }}>
      {/* Header */}
      <section style={{ padding: '80px 0 56px', borderBottom: '1px solid var(--border)' }}>
        <div style={WRAP}>
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 16px', color: 'var(--ink)' }}>
              Explore Tafakuri
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.75, color: 'var(--ink-2)', margin: '0 0 36px', fontWeight: 300 }}>
              Follow a thought. Discover a perspective. Find something worth thinking about.
            </p>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="What are you looking for?"
                style={{
                  width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                  padding: '14px 18px 14px 44px', fontFamily: 'var(--font-sans)', fontSize: 15,
                  color: 'var(--ink)', outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Topic filters */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ ...WRAP, overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, padding: '0 0 0', minWidth: 'max-content' }}>
            <button
              onClick={() => setActiveTopic(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '18px 20px',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                color: !activeTopic ? 'var(--ink)' : 'var(--ink-3)',
                borderBottom: `2px solid ${!activeTopic ? 'var(--accent)' : 'transparent'}`,
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              All
            </button>
            {TOPICS.map(t => (
              <button key={t.name} onClick={() => setActiveTopic(activeTopic === t.name ? null : t.name)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '18px 20px',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                color: activeTopic === t.name ? 'var(--ink)' : 'var(--ink-3)',
                borderBottom: `2px solid ${activeTopic === t.name ? 'var(--accent)' : 'transparent'}`,
                transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap',
              }}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section style={{ padding: '64px 0 96px' }}>
        <div style={WRAP}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)', marginBottom: 40, letterSpacing: '0.04em' }}>
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
            {activeTopic ? ` in ${activeTopic}` : ''}
            {search ? ` matching "${search}"` : ''}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-3)', marginBottom: 16 }}>
                No articles found.
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-3)' }}>
                Try a different search or browse all topics.
              </p>
              <button onClick={() => { setSearch(''); setActiveTopic(null) }} style={{ marginTop: 24, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', padding: '10px 20px' }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 48 }}>
              {filtered.map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
            </div>
          )}
        </div>
      </section>

      <NewsletterSection />
    </main>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES)
  const [article, setArticle] = useState<Article>(FALLBACK_ARTICLES[0])
  const [dark, setDark] = useState(false)
  const [loadingArticles, setLoadingArticles] = useState(isApiConfigured())

  function navigate(p: Page, a?: Article) {
    if (a) setArticle(a)
    setPage(p)
    window.scrollTo({ top: 0 })
  }

  function handlePublished(newArticle: Article) {
    setArticles((current) => [newArticle, ...current.filter((item) => item.id !== newArticle.id)])
    setArticle(newArticle)
  }

  useEffect(() => {
    if (!isApiConfigured()) return

    let cancelled = false
    fetchArticles()
      .then((loaded) => {
        if (cancelled) return
        if (loaded.length > 0) {
          setArticles(loaded)
          setArticle(loaded[0])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticles(FALLBACK_ARTICLES)
          setArticle(FALLBACK_ARTICLES[0])
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingArticles(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <Nav page={page} navigate={navigate} dark={dark} setDark={setDark} />
      {loadingArticles && page === 'home' ? (
        <main style={{ paddingTop: 120, textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)' }}>
          Loading articles…
        </main>
      ) : (
        <>
          {page === 'home' && <HomePage articles={articles} navigate={navigate} />}
          {page === 'article' && <ArticlePage article={article} articles={articles} navigate={navigate} />}
          {page === 'about' && <AboutPage articles={articles} navigate={navigate} />}
          {page === 'explore' && <ExplorePage articles={articles} navigate={navigate} />}
          {page === 'publish' && <PublishPage navigate={navigate} onPublished={handlePublished} />}
        </>
      )}
      {page !== 'article' && <Footer navigate={navigate} />}
      {page === 'article' && (
        <div style={{ background: 'var(--ink)', padding: '40px 0' }}>
          <div style={{ ...WRAP, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--paper)' }}>TAFAKURI</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.1em', marginTop: 3 }}>by Ndomi</div>
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'rgba(237,233,225,0.3)' }}>Think deeper. See differently.</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(237,233,225,0.3)' }}>© 2026 Ndomi</span>
          </div>
        </div>
      )}
    </div>
  )
}
