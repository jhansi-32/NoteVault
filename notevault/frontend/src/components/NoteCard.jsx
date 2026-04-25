
import { useState } from 'react';

const ACCENT_COLORS = {
  '#1a1a1a': null,
  '#1a2a1a': '#6ec88a',
  '#1a1a2a': '#8a9ec8',
  '#2a1a1a': '#c86e6e',
  '#1a2a2a': '#6ec8c8',
  '#2a1a2a': '#c86ec8',
};

export default function NoteCard({ note, onEdit, onDelete, onPin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const accentColor = ACCENT_COLORS[note.color] || 'var(--accent)';

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const isList       = note.type === 'list' && note.items?.length > 0;
  const filledItems  = isList ? note.items.filter(i => i.text?.trim()) : [];
  const checkedCount = filledItems.filter(i => i.checked).length;
  const progressPct  = filledItems.length ? (checkedCount / filledItems.length) * 100 : 0;
  const previewItems = filledItems.slice(0, 4);  // show max 4 items on card

  return (
    <div
      style={{ ...styles.card, background: note.color || '#1a1a1a' }}
      className="fade-up"
      onClick={() => onEdit(note)}
    >
      {/* Pin badge */}
      {note.pinned && <div style={styles.pinBadge} title="Pinned">◆</div>}

      {/* Color accent bar */}
      <div style={{ ...styles.accentBar, background: accentColor }} />

      <div style={styles.body}>
        <h3 style={styles.title}>{note.title}</h3>

        {/* ── Text preview ─────────────────────────────────────────────── */}
        {!isList && note.content && (
          <p style={styles.preview}>
            {note.content.length > 110 ? note.content.slice(0, 110) + '…' : note.content}
          </p>
        )}

        {/* ── List preview ─────────────────────────────────────────────── */}
        {isList && (
          <div style={styles.listPreview}>
            {/* Progress bar */}
            {filledItems.length > 0 && (
              <div style={styles.progressRow}>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
                </div>
                <span style={styles.progressLabel}>{checkedCount}/{filledItems.length}</span>
              </div>
            )}

            {/* Bullet items */}
            {previewItems.map((item, idx) => (
              <div key={idx} style={styles.bulletRow}>
                {/* Mini checkbox */}
                <span style={{
                  ...styles.miniCheck,
                  background: item.checked ? accentColor || 'var(--accent)' : 'transparent',
                  borderColor: item.checked ? accentColor || 'var(--accent)' : 'var(--border-light)',
                }}>
                  {item.checked && <span style={styles.miniTick}>✓</span>}
                </span>
                <span style={{
                  ...styles.bulletText,
                  ...(item.checked ? styles.bulletTextChecked : {}),
                }}>
                  {item.text}
                </span>
              </div>
            ))}

            {/* Overflow indicator */}
            {filledItems.length > 4 && (
              <span style={styles.moreItems}>
                +{filledItems.length - 4} more item{filledItems.length - 4 !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={styles.tags}>
          {note.tags.slice(0, 3).map(t => (
            <span key={t} style={styles.tag}>#{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          {isList && (
            <span style={styles.listBadge}>☑ list</span>
          )}
          <span style={styles.date}>{fmt(note.updatedAt)}</span>
        </div>

        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button style={styles.menuBtn} onClick={() => setMenuOpen(o => !o)}>···</button>

          {menuOpen && (
            <div style={styles.menu} className="fade-in">
              <button style={styles.menuItem} onClick={() => { onEdit(note); setMenuOpen(false); }}>
                ✎ Edit
              </button>
              <button style={styles.menuItem} onClick={() => { onPin(note._id); setMenuOpen(false); }}>
                {note.pinned ? '◇ Unpin' : '◆ Pin'}
              </button>
              <button
                style={{ ...styles.menuItem, color: 'var(--red)' }}
                onClick={() => { onDelete(note._id); setMenuOpen(false); }}
              >
                ✕ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    padding: '1.25rem', cursor: 'pointer',
    transition: 'border-color var(--transition), transform var(--transition)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden',
  },
  pinBadge: {
    position: 'absolute', top: '0.75rem', right: '0.75rem',
    color: 'var(--accent)', fontSize: '0.6rem',
  },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.6,
  },
  body: { flex: 1 },
  title: {
    fontFamily: 'var(--font-display)', fontSize: '1.1rem',
    fontWeight: 400, color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.5rem',
  },

  // Text preview
  preview: { color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.6 },

  // List preview
  listPreview: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },

  progressRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' },
  progressTrack: {
    flex: 1, height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', background: 'var(--accent)', transition: 'width 0.4s ease' },
  progressLabel: { fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 },

  bulletRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  miniCheck: {
    width: 13, height: 13, borderRadius: 2, flexShrink: 0,
    border: '1.5px solid var(--border-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background var(--transition)',
  },
  miniTick: { color: '#0a0a0a', fontSize: '0.5rem', fontWeight: 700 },
  bulletText: {
    fontSize: '0.78rem', color: 'var(--text-muted)',
    lineHeight: 1.4, transition: 'color var(--transition)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  bulletTextChecked: { textDecoration: 'line-through', color: 'var(--text-dim)' },

  moreItems: {
    fontSize: '0.68rem', color: 'var(--text-dim)',
    marginTop: '0.1rem', letterSpacing: '0.03em',
  },

  // Tags + footer
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
  tag: {
    fontSize: '0.65rem', letterSpacing: '0.05em',
    color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)', borderRadius: '2px', padding: '0.1rem 0.4rem',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto',
  },
  footerLeft: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  listBadge: {
    fontSize: '0.6rem', letterSpacing: '0.06em',
    color: 'var(--accent)', background: 'var(--accent-glow)',
    border: '1px solid rgba(200,169,110,0.2)',
    borderRadius: 2, padding: '0.1rem 0.4rem',
  },
  date: { color: 'var(--text-dim)', fontSize: '0.68rem', letterSpacing: '0.05em' },
  menuBtn: {
    color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1,
    padding: '0.25rem 0.5rem', letterSpacing: '0.1em',
  },
  menu: {
    position: 'absolute', bottom: '2rem', right: 0,
    background: 'var(--bg-2)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)', padding: '0.35rem',
    minWidth: 130, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    width: '100%', padding: '0.5rem 0.75rem',
    color: 'var(--text)', fontSize: '0.78rem',
    borderRadius: 'var(--radius)', textAlign: 'left',
    background: 'none', border: 'none', cursor: 'pointer',
  },
};