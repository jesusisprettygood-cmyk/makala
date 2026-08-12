import { useEffect, useState, type FormEvent } from 'react'
import type { Article } from '../types/article'
import { createArticle, uploadArticleImage } from '../lib/api'
import { useAuth } from '../lib/auth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { getSiteUrl } from '../lib/siteUrl'
import ImageUploadField from '../components/ImageUploadField'

const WRAP = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' } as const

const CATEGORIES = [
  'LIFE',
  'TECHNOLOGY',
  'YOUTH',
  'LEADERSHIP',
  'CREATIVITY',
  'PERSONAL REFLECTIONS',
  'SOCIETY',
  'BUSINESS',
]

type NavFn = (page: 'home' | 'article' | 'about' | 'explore' | 'publish' | 'profile', article?: Article) => void

interface PublishPageProps {
  navigate: NavFn
  onPublished: (article: Article) => void
}

const fieldStyle = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  padding: '13px 16px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
} as const

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  color: 'var(--ink-3)',
  marginBottom: 8,
} as const

export default function PublishPage({ navigate, onPublished }: PublishPageProps) {
  const { ready, accessToken, session, profile, signOut } = useAuth()

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [category, setCategory] = useState(CATEGORIES[0])
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('Ndomi')
  const [image, setImage] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishLoading, setPublishLoading] = useState(false)
  const [published, setPublished] = useState<Article | null>(null)

  useEffect(() => {
    if (profile?.displayName) {
      setAuthor(profile.displayName)
    }
  }, [profile?.displayName])

  async function handleAuth(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setAuthError('')
    setAuthSuccess('')
    setAuthLoading(true)

    try {
      const result =
        authMode === 'signin'
          ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
          : await supabase.auth.signUp({
              email: authEmail,
              password: authPassword,
              options: {
                emailRedirectTo: `${getSiteUrl()}/`,
              },
            })

      if (result.error) throw result.error
      if (!result.data.session && authMode === 'signup') {
        setAuthSuccess(
          'Account created successfully! Check your email for a confirmation link, then sign in.',
        )
        setAuthMode('signin')
        return
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleImageSelect(file: File) {
    if (!accessToken) return
    setImageUploading(true)
    setPublishError('')
    const localPreview = URL.createObjectURL(file)
    setImagePreview(localPreview)
    try {
      const url = await uploadArticleImage(file, accessToken)
      setImage(url)
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to upload image.')
      setImage('')
    } finally {
      setImageUploading(false)
    }
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setPublishError('')
    setPublishLoading(true)

    try {
      const article = await createArticle(
        { category, title, subtitle, excerpt, body, author, image },
        accessToken,
      )
      setPublished(article)
      onPublished(article)
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to publish article.')
    } finally {
      setPublishLoading(false)
    }
  }

  if (!ready) {
    return (
      <main style={{ paddingTop: 120, paddingBottom: 80, textAlign: 'center' }}>
        <div style={WRAP}>Loading…</div>
      </main>
    )
  }

  if (!isSupabaseConfigured) {
    return (
      <main style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ ...WRAP, maxWidth: 640 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, marginBottom: 16 }}>Publish</h1>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-2)', lineHeight: 1.7 }}>
            Add <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>, and{' '}
            <code>VITE_API_URL</code> to your environment to enable publishing.
          </p>
        </div>
      </main>
    )
  }

  if (published) {
    return (
      <main style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ ...WRAP, maxWidth: 640 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--accent)' }}>
            PUBLISHED
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 40px)', margin: '16px 0' }}>
            {published.title}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 32 }}>
            Your article is live on Tafakuri.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('article', published)}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', padding: '12px 24px', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}
            >
              VIEW ARTICLE
            </button>
            <button
              onClick={() => { setPublished(null); setTitle(''); setSubtitle(''); setExcerpt(''); setBody(''); setImage(''); setImagePreview(null) }}
              style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '12px 24px', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' }}
            >
              WRITE ANOTHER
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div style={WRAP}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)' }}>
              FOR WRITERS
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, margin: '12px 0 16px', color: 'var(--ink)' }}>
              Publish a Tafakuri
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.75, color: 'var(--ink-2)', margin: 0 }}>
              Share a reflection, story, or idea worth thinking about. Sign in, write, and publish directly to the publication.
            </p>
          </div>

          {!accessToken ? (
            <div style={{ background: 'var(--surface)', padding: '36px 40px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                {(['signin', 'signup'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setAuthMode(mode); setAuthError(''); setAuthSuccess('') }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: authMode === mode ? 'var(--accent)' : 'var(--ink-3)',
                      borderBottom: `2px solid ${authMode === mode ? 'var(--accent)' : 'transparent'}`,
                      padding: '0 0 8px',
                    }}
                  >
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>EMAIL</label>
                  <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>PASSWORD</label>
                  <input type="password" required minLength={6} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={fieldStyle} />
                </div>
                {authSuccess && (
                  <div style={{ background: 'rgba(34, 139, 87, 0.1)', border: '1px solid rgba(34, 139, 87, 0.25)', padding: '14px 16px' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#1a6b42', margin: 0, lineHeight: 1.6 }}>{authSuccess}</p>
                  </div>
                )}
                {authError && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#b42318', margin: 0 }}>{authError}</p>}
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{ background: 'var(--ink)', color: 'var(--paper)', border: 'none', cursor: 'pointer', padding: '14px 24px', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', opacity: authLoading ? 0.7 : 1 }}
                >
                  {authLoading ? 'PLEASE WAIT…' : authMode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-2)' }}>
                  Signed in as <strong style={{ color: 'var(--ink)' }}>{session?.user.email}</strong>
                </span>
                <button onClick={() => void signOut()} style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '8px 14px', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>
                  Sign out
                </button>
              </div>

              <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={fieldStyle}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>TITLE</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} style={fieldStyle} placeholder="Your headline" />
                </div>
                <div>
                  <label style={labelStyle}>SUBTITLE</label>
                  <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={fieldStyle} placeholder="A line that expands the title" />
                </div>
                <div>
                  <label style={labelStyle}>EXCERPT</label>
                  <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical' }} placeholder="Short summary for cards and previews" />
                </div>
                <div>
                  <label style={labelStyle}>BODY</label>
                  <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={14} style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }} placeholder={"Write your article here.\n\nSeparate paragraphs with a blank line.\n\nFor pull quotes start a line with PULLQUOTE:Your quote here"} />
                </div>
                <ImageUploadField
                  label="COVER IMAGE"
                  onFileSelect={handleImageSelect}
                  previewUrl={imagePreview || image || null}
                  uploading={imageUploading}
                />
                <div>
                  <label style={labelStyle}>AUTHOR</label>
                  <input value={author} onChange={(e) => setAuthor(e.target.value)} style={fieldStyle} />
                </div>
                {publishError && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#b42318', margin: 0 }}>{publishError}</p>}
                <button
                  type="submit"
                  disabled={publishLoading || imageUploading}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', padding: '16px 28px', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', opacity: publishLoading || imageUploading ? 0.7 : 1 }}
                >
                  {publishLoading ? 'PUBLISHING…' : 'PUBLISH ARTICLE'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
