
import { useState, useEffect, useRef } from 'react';

const COLOR_OPTIONS = [
  { value: '#1a1a1a', label: 'Default' },
  { value: '#1a2a1a', label: 'Forest'  },
  { value: '#1a1a2a', label: 'Ocean'   },
  { value: '#2a1a1a', label: 'Rose'    },
  { value: '#1a2a2a', label: 'Teal'    },
  { value: '#2a1a2a', label: 'Violet'  },
];

export default function NoteModal({ note, onSave, onClose }) {
  const isEdit = Boolean(note?._id);

  const [form, setForm] = useState({
    title:   note?.title   || '',
    content: note?.content || '',
    color:   note?.color   || '#1a1a1a',
    tags:    note?.tags?.join(', ') || '',
    type:    note?.type    || 'text',
    items:   note?.items?.length
      ? note.items.map(i => ({ ...i }))
      : [{ text: '', checked: false }],
  });

  const [saving, setSaving] = useState(false);
  const titleRef = useRef();
  const itemRefs = useRef([]);

  useEffect(() => {
    titleRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── List item helpers ────────────────────────────────────────────────────
  const updateItem = (idx, field, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) => i === idx ? { ...it, [field]: value } : it),
    }));
  };

  const addItem = (afterIdx) => {
    setForm(f => {
      const items = [...f.items];
      items.splice(afterIdx + 1, 0, { text: '', checked: false });
      return { ...f, items };
    });
    setTimeout(() => itemRefs.current[afterIdx + 1]?.focus(), 30);
  };

  const removeItem = (idx) => {
    setForm(f => {
      if (f.items.length === 1) return { ...f, items: [{ text: '', checked: false }] };
      return { ...f, items: f.items.filter((_, i) => i !== idx) };
    });
    setTimeout(() => itemRefs.current[Math.max(0, idx - 1)]?.focus(), 30);
  };

  const handleItemKeyDown = (e, idx) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem(idx); }
    if (e.key === 'Backspace' && form.items[idx].text === '') { e.preventDefault(); removeItem(idx); }
  };

  const moveItem = (idx, dir) => {
    setForm(f => {
      const items = [...f.items];
      const target = idx + dir;
      if (target < 0 || target >= items.length) return f;
      [items[idx], items[target]] = [items[target], items[idx]];
      return { ...f, items };
    });
  };

  const filledItems   = form.items.filter(i => i.text.trim());
  const checkedCount  = filledItems.filter(i => i.checked).length;
  const progressPct   = filledItems.length ? (checkedCount / filledItems.length) * 100 : 0;

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const tags  = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const items = form.items.filter(i => i.text.trim() !== '');
    await onSave({ ...form, tags, items });
    setSaving(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{ ...styles.modal, background: form.color }}
        className="fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.modalHeader}>
          <span style={styles.modalLabel}>{isEdit ? 'Edit note' : 'New note'}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Title */}
          <input
            ref={titleRef}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            required
            style={styles.titleInput}
          />

          {/* ── Note type toggle ───────────────────────────────────────── */}
          <div style={styles.typeToggle}>
            <button
              type="button"
              style={{ ...styles.typeBtn, ...(form.type === 'text' ? styles.typeBtnActive : {}) }}
              onClick={() => setForm(f => ({ ...f, type: 'text' }))}
            >
              ¶ Text
            </button>
            <button
              type="button"
              style={{ ...styles.typeBtn, ...(form.type === 'list' ? styles.typeBtnActive : {}) }}
              onClick={() => setForm(f => ({ ...f, type: 'list' }))}
            >
              ☑ List
            </button>
          </div>

          {/* ── TEXT mode ─────────────────────────────────────────────── */}
          {form.type === 'text' && (
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write something…"
              rows={7}
              style={styles.contentInput}
            />
          )}

          {/* ── LIST mode ─────────────────────────────────────────────── */}
          {form.type === 'list' && (
            <div style={styles.listWrap}>

              {/* Progress bar */}
              {filledItems.length > 0 && (
                <div style={styles.progressRow}>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
                  </div>
                  <span style={styles.progressLabel}>
                    {checkedCount} / {filledItems.length} done
                  </span>
                </div>
              )}

              {/* Items */}
              {form.items.map((item, idx) => (
                <div key={idx} style={styles.itemRow}>

                  {/* Checkbox */}
                  <button
                    type="button"
                    style={{ ...styles.checkbox, ...(item.checked ? styles.checkboxChecked : {}) }}
                    onClick={() => updateItem(idx, 'checked', !item.checked)}
                    aria-label="Toggle done"
                  >
                    {item.checked && <span style={styles.checkmark}>✓</span>}
                  </button>

                  {/* Text */}
                  <input
                    ref={el => itemRefs.current[idx] = el}
                    value={item.text}
                    onChange={e => updateItem(idx, 'text', e.target.value)}
                    onKeyDown={e => handleItemKeyDown(e, idx)}
                    placeholder="List item… (Enter to add, Backspace to remove)"
                    style={{ ...styles.itemInput, ...(item.checked ? styles.itemInputChecked : {}) }}
                  />

                  {/* Reorder + delete */}
                  <div style={styles.itemActions}>
                    <button type="button" style={styles.itemActionBtn}
                      onClick={() => moveItem(idx, -1)} title="Move up">↑</button>
                    <button type="button" style={styles.itemActionBtn}
                      onClick={() => moveItem(idx, 1)} title="Move down">↓</button>
                    <button type="button"
                      style={{ ...styles.itemActionBtn, color: 'var(--red)' }}
                      onClick={() => removeItem(idx)} title="Remove">✕</button>
                  </div>
                </div>
              ))}

              {/* Add item */}
              <button
                type="button"
                style={styles.addItemBtn}
                onClick={() => addItem(form.items.length - 1)}
              >
                + Add item
              </button>

              {/* Uncheck all */}
              {checkedCount > 0 && (
                <button
                  type="button"
                  style={styles.clearCheckedBtn}
                  onClick={() => setForm(f => ({
                    ...f,
                    items: f.items.map(i => ({ ...i, checked: false })),
                  }))}
                >
                  ↺ Uncheck all
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          <input
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Tags: work, ideas, personal (comma separated)"
            style={styles.tagsInput}
          />

          {/* Color picker */}
          <div style={styles.colorRow}>
            <span style={styles.colorLabel}>Color</span>
            <div style={styles.colorOptions}>
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setForm(f => ({ ...f, color: c.value }))}
                  style={{
                    ...styles.colorSwatch,
                    background: c.value,
                    border: form.color === c.value
                      ? '2px solid var(--accent)'
                      : '2px solid var(--border-light)',
                    transform: form.color === c.value ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.saveBtn} disabled={saving || !form.title.trim()}>
              {saving ? <Spinner /> : isEdit ? 'Save changes' : 'Create note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 13, height: 13,
      border: '2px solid rgba(10,10,10,0.3)', borderTopColor: '#0a0a0a',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  },
  modal: {
    width: '100%', maxWidth: 540,
    border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
    padding: '1.75rem', boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.25rem',
  },
  modalLabel: {
    fontSize: '0.68rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--text-muted)',
  },
  closeBtn: { color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.25rem 0.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  titleInput: {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--border-light)',
    color: 'var(--text)', padding: '0.375rem 0',
    fontSize: '1.15rem', fontFamily: 'var(--font-display)',
    fontWeight: 400, outline: 'none', width: '100%',
  },

  // Type toggle
  typeToggle: {
    display: 'flex', gap: '0.4rem',
    background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius)',
    padding: '0.2rem', width: 'fit-content',
  },
  typeBtn: {
    padding: '0.3rem 0.9rem', borderRadius: 'var(--radius)',
    fontSize: '0.72rem', letterSpacing: '0.04em',
    color: 'var(--text-muted)', transition: 'all var(--transition)',
    fontFamily: 'var(--font-mono)',
  },
  typeBtnActive: { background: 'var(--accent)', color: '#0a0a0a', fontWeight: 500 },

  // Text
  contentInput: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)',
    padding: '0.75rem', outline: 'none', resize: 'vertical',
    lineHeight: 1.7, width: '100%', fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem', minHeight: 140,
  },

  // List
  listWrap: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  progressRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' },
  progressTrack: {
    flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: 'var(--accent)',
    borderRadius: 2, transition: 'width 0.4s ease',
  },
  progressLabel: { fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 },

  itemRow: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 3, flexShrink: 0,
    border: '1.5px solid var(--border-light)', background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background var(--transition), border-color var(--transition)',
  },
  checkboxChecked: { background: 'var(--accent)', borderColor: 'var(--accent)' },
  checkmark: { color: '#0a0a0a', fontSize: '0.6rem', fontWeight: 700 },

  itemInput: {
    flex: 1, background: 'transparent', border: 'none',
    color: 'var(--text)', outline: 'none',
    fontSize: '0.85rem', padding: '0.3rem 0',
    fontFamily: 'var(--font-mono)', transition: 'color var(--transition)',
  },
  itemInputChecked: { color: 'var(--text-muted)', textDecoration: 'line-through' },

  itemActions: { display: 'flex', gap: '0.1rem' },
  itemActionBtn: {
    fontSize: '0.68rem', color: 'var(--text-muted)',
    padding: '0.2rem 0.3rem', borderRadius: 2, lineHeight: 1,
    opacity: 0.5, transition: 'opacity var(--transition)',
  },

  addItemBtn: {
    marginTop: '0.35rem', color: 'var(--accent)',
    fontSize: '0.75rem', letterSpacing: '0.04em',
    textAlign: 'left', padding: '0.35rem 0',
  },
  clearCheckedBtn: {
    color: 'var(--text-dim)', fontSize: '0.7rem',
    textAlign: 'left', padding: '0.15rem 0', letterSpacing: '0.04em',
  },

  tagsInput: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)',
    padding: '0.5rem 0.75rem', outline: 'none', width: '100%', fontSize: '0.8rem',
  },
  colorRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  colorLabel: {
    fontSize: '0.68rem', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-muted)', flexShrink: 0,
  },
  colorOptions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  colorSwatch: {
    width: 22, height: 22, borderRadius: '50%',
    cursor: 'pointer', transition: 'transform var(--transition)',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: {
    padding: '0.6rem 1.25rem', color: 'var(--text-muted)',
    borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8rem',
  },
  saveBtn: {
    padding: '0.6rem 1.5rem', background: 'var(--accent)',
    color: '#0a0a0a', borderRadius: 'var(--radius)',
    fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.03em',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
};