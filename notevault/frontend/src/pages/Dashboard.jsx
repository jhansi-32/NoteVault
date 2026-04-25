import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import NoteCard  from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [notes,     setNotes]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [editNote,  setEditNote]  = useState(null);  // null = closed, {} = new, note = edit
  const [toast,     setToast]     = useState('');
  const [menuOpen,  setMenuOpen]  = useState(false);
  const searchTimeout = useRef(null);

  // ── Fetch notes ─────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async (q = '', tag = '') => {
    try {
      const params = {};
      if (q)   params.search = q;
      if (tag) params.tag    = tag;
      const { data } = await api.get('/notes', { params });
      setNotes(data);
    } catch {
      showToast('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchNotes(search, activeTag), 300);
    return () => clearTimeout(searchTimeout.current);
  }, [search, activeTag, fetchNotes]);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    try {
      if (editNote?._id) {
        const { data } = await api.put(`/notes/${editNote._id}`, form);
        setNotes(ns => ns.map(n => n._id === data._id ? data : n));
        showToast('Note updated');
      } else {
        const { data } = await api.post('/notes', form);
        setNotes(ns => [data, ...ns]);
        showToast('Note created');
      }
      setEditNote(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(ns => ns.filter(n => n._id !== id));
      showToast('Note deleted');
    } catch {
      showToast('Delete failed');
    }
  };

  const handlePin = async (id) => {
    try {
      const { data } = await api.patch(`/notes/${id}/pin`);
      setNotes(ns => {
        const updated = ns.map(n => n._id === data._id ? data : n);
        return [...updated].sort((a, b) => b.pinned - a.pinned || new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    } catch {
      showToast('Pin failed');
    }
  };

  // ── Derived tags ─────────────────────────────────────────────────────────────
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))].sort();

  // ── Layout ───────────────────────────────────────────────────────────────────
  const pinned   = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);

  return (
    <div style={styles.root}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logoRow}>
            <span style={styles.logoMark}>◆</span>
            <span style={styles.logoText}>NoteVault</span>
          </div>

          <button style={styles.newBtn} onClick={() => setEditNote({})}>
            + New note
          </button>
        </div>

        {/* Tags */}
        <div style={styles.tagSection}>
          <p style={styles.tagHeading}>Tags</p>
          <button
            style={{ ...styles.tagItem, ...(activeTag === '' ? styles.tagItemActive : {}) }}
            onClick={() => setActiveTag('')}
          >
            # All notes
            <span style={styles.tagCount}>{notes.length}</span>
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              style={{ ...styles.tagItem, ...(activeTag === tag ? styles.tagItemActive : {}) }}
              onClick={() => setActiveTag(t => t === tag ? '' : tag)}
            >
              #{tag}
              <span style={styles.tagCount}>
                {notes.filter(n => n.tags?.includes(tag)).length}
              </span>
            </button>
          ))}
        </div>

        {/* User menu */}
        <div style={styles.userSection}>
          <div style={{ position: 'relative' }}>
            <button style={styles.userBtn} onClick={() => setMenuOpen(o => !o)}>
              <span style={styles.avatar}>{user.name[0].toUpperCase()}</span>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userEmail}>{user.email}</span>
              </div>
            </button>
            {menuOpen && (
              <div style={styles.userMenu} className="fade-in">
                <button style={styles.logoutBtn} onClick={() => { setMenuOpen(false); logout(); }}>
                  ↩ Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…"
              style={styles.searchInput}
            />
            {search && (
              <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div style={styles.statsRow}>
            <span style={styles.statPill}>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
            {activeTag && (
              <span style={styles.statPill}>
                #{activeTag}
                <button style={styles.tagClear} onClick={() => setActiveTag('')}>✕</button>
              </span>
            )}
          </div>
        </div>

        {/* Notes grid */}
        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.loadingSpinner} />
          </div>
        ) : notes.length === 0 ? (
          <div style={styles.emptyState} className="fade-in">
            <span style={styles.emptyIcon}>◇</span>
            <p style={styles.emptyTitle}>
              {search ? 'No notes found' : 'Vault is empty'}
            </p>
            <p style={styles.emptyDesc}>
              {search ? 'Try a different search term' : 'Create your first note to get started'}
            </p>
            {!search && (
              <button style={styles.emptyBtn} onClick={() => setEditNote({})}>
                + Create note
              </button>
            )}
          </div>
        ) : (
          <div>
            {pinned.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionLabel}>◆ Pinned</h2>
                <div style={styles.grid}>
                  {pinned.map((note, i) => (
                    <div key={note._id} style={{ '--i': i }}>
                      <NoteCard
                        note={note}
                        onEdit={setEditNote}
                        onDelete={handleDelete}
                        onPin={handlePin}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {unpinned.length > 0 && (
              <section style={styles.section}>
                {pinned.length > 0 && <h2 style={styles.sectionLabel}>◇ Notes</h2>}
                <div style={styles.grid}>
                  {unpinned.map((note, i) => (
                    <div key={note._id} style={{ '--i': i }}>
                      <NoteCard
                        note={note}
                        onEdit={setEditNote}
                        onDelete={handleDelete}
                        onPin={handlePin}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* ── FAB (mobile) ───────────────────────────────────────────────────── */}
      <button style={styles.fab} onClick={() => setEditNote({})} aria-label="New note">
        +
      </button>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {editNote !== null && (
        <NoteModal
          note={editNote._id ? editNote : null}
          onSave={handleSave}
          onClose={() => setEditNote(null)}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={styles.toast} className="fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    display: 'flex', minHeight: '100vh',
    background: 'var(--bg)',
  },

  // Sidebar
  sidebar: {
    width: 220, flexShrink: 0,
    background: 'var(--bg-2)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  },
  sidebarTop: { padding: '1.5rem 1.25rem 1rem' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  logoMark: { color: 'var(--accent)', fontSize: '0.85rem' },
  logoText: {
    fontFamily: 'var(--font-display)', fontSize: '1.1rem',
    fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em',
  },
  newBtn: {
    width: '100%', padding: '0.6rem 1rem',
    background: 'var(--accent)', color: '#0a0a0a',
    borderRadius: 'var(--radius)', fontSize: '0.78rem',
    fontWeight: 500, letterSpacing: '0.03em',
    transition: 'opacity var(--transition)',
    textAlign: 'left',
  },
  tagSection: { flex: 1, padding: '0.75rem 0.75rem' },
  tagHeading: {
    fontSize: '0.62rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--text-dim)',
    padding: '0 0.5rem', marginBottom: '0.5rem',
  },
  tagItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '0.45rem 0.75rem',
    color: 'var(--text-muted)', fontSize: '0.78rem',
    borderRadius: 'var(--radius)', textAlign: 'left',
    transition: 'background var(--transition), color var(--transition)',
    letterSpacing: '0.02em',
  },
  tagItemActive: {
    background: 'var(--accent-glow)', color: 'var(--accent)',
  },
  tagCount: {
    fontSize: '0.65rem', color: 'var(--text-dim)',
    background: 'var(--bg-3)', borderRadius: 2,
    padding: '0.1rem 0.35rem',
  },
  userSection: { padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' },
  userBtn: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    width: '100%', padding: '0.5rem 0.5rem',
    borderRadius: 'var(--radius)', textAlign: 'left',
    transition: 'background var(--transition)',
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'var(--accent-dim)', color: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
    lineHeight: '28px', textAlign: 'center',
  },
  userInfo: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  userName: {
    fontSize: '0.78rem', color: 'var(--text)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.65rem', color: 'var(--text-muted)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  userMenu: {
    position: 'absolute', bottom: '110%', left: 0, right: 0,
    background: 'var(--bg-2)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)', padding: '0.35rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  logoutBtn: {
    width: '100%', padding: '0.5rem 0.75rem',
    color: 'var(--red)', fontSize: '0.78rem',
    borderRadius: 'var(--radius)', textAlign: 'left',
    transition: 'background var(--transition)',
  },

  // Main
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    minHeight: '100vh', overflowX: 'hidden',
  },
  topBar: {
    padding: '1.5rem 2rem 1rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
  },
  searchWrap: {
    display: 'flex', alignItems: 'center',
    background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '0.5rem 0.875rem', gap: '0.5rem',
  },
  searchIcon: { color: 'var(--text-muted)', fontSize: '1.1rem' },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none',
    color: 'var(--text)', outline: 'none', fontSize: '0.875rem',
  },
  clearBtn: { color: 'var(--text-muted)', fontSize: '0.75rem' },
  statsRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  statPill: {
    fontSize: '0.68rem', letterSpacing: '0.06em',
    color: 'var(--text-muted)', background: 'var(--bg-3)',
    border: '1px solid var(--border)', borderRadius: 2,
    padding: '0.1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
  },
  tagClear: { color: 'var(--text-dim)', fontSize: '0.6rem' },

  section: { padding: '1.5rem 2rem' },
  sectionLabel: {
    fontSize: '0.68rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--text-dim)',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },

  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '4rem', gap: '0.75rem', minHeight: '60vh',
  },
  emptyIcon: { color: 'var(--text-dim)', fontSize: '2rem' },
  emptyTitle: {
    fontFamily: 'var(--font-display)', fontSize: '1.5rem',
    fontWeight: 300, color: 'var(--text-muted)', fontStyle: 'italic',
  },
  emptyDesc: { color: 'var(--text-dim)', fontSize: '0.8rem' },
  emptyBtn: {
    marginTop: '1rem', padding: '0.625rem 1.5rem',
    background: 'var(--accent)', color: '#0a0a0a',
    borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 500,
  },
  loadingSpinner: {
    width: 28, height: 28,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  fab: {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
    width: 52, height: 52, borderRadius: '50%',
    background: 'var(--accent)', color: '#0a0a0a',
    fontSize: '1.5rem', fontWeight: 300, lineHeight: 1,
    boxShadow: '0 4px 20px rgba(200,169,110,0.35)',
    display: 'none', alignItems: 'center', justifyContent: 'center',
    zIndex: 50,
    '@media (max-width: 640px)': { display: 'flex' },
  },

  toast: {
    position: 'fixed', bottom: '2rem', left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg-2)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)', padding: '0.625rem 1.25rem',
    fontSize: '0.8rem', color: 'var(--text)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 300, whiteSpace: 'nowrap',
  },
};
