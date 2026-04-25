import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    clearError();
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return;
    const result = await signup(form);
    if (result.ok) navigate('/');
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">
        <div style={styles.logoRow}>
          <span style={styles.logoMark}>◆</span>
          <span style={styles.logoText}>NoteVault</span>
        </div>

        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.sub}>your private vault awaits</p>

        {error && (
          <div style={styles.errorBox} className="fade-in">
            <span style={styles.errorDot}>●</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Full name"  name="name"     type="text"     value={form.name}     onChange={handleChange} placeholder="Ada Lovelace" autoFocus />
          <Field label="Email"      name="email"    type="email"    value={form.email}    onChange={handleChange} placeholder="you@example.com" />
          <Field label="Password"   name="password" type="password" value={form.password} onChange={handleChange} placeholder="min. 6 characters" />

          {form.password.length > 0 && form.password.length < 6 && (
            <p style={styles.hint}>Password must be at least 6 characters</p>
          )}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? <Spinner /> : 'Create vault →'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
      <div style={styles.bg} />
    </div>
  );
}

function Field({ label, name, type, value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoFocus={autoFocus} required
        autoComplete={name === 'password' ? 'new-password' : name === 'email' ? 'email' : 'name'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...styles.input, ...(focused ? styles.inputFocused : {}) }}
      />
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid rgba(200,169,110,0.3)', borderTopColor: '#c8a96e',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden',
  },
  bg: {
    position: 'fixed', inset: 0, zIndex: -1,
    background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(200,169,110,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: 400,
    background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '2.5rem',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' },
  logoMark: { color: 'var(--accent)', fontSize: '1rem' },
  logoText: {
    fontFamily: 'var(--font-display)', fontSize: '1.25rem',
    fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em',
  },
  heading: {
    fontFamily: 'var(--font-display)', fontSize: '2rem',
    fontWeight: 300, color: 'var(--text)', lineHeight: 1.1, fontStyle: 'italic',
  },
  sub: {
    color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: '1.75rem', marginTop: '0.25rem',
  },
  errorBox: {
    background: 'rgba(200, 110, 110, 0.08)', border: '1px solid rgba(200, 110, 110, 0.25)',
    borderRadius: 'var(--radius)', padding: '0.75rem 1rem', color: 'var(--red)',
    fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  errorDot: { fontSize: '0.5rem' },
  hint: { color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '-0.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' },
  input: {
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', padding: '0.625rem 0.875rem',
    outline: 'none', transition: 'border-color var(--transition)', width: '100%',
  },
  inputFocused: { borderColor: 'var(--accent-dim)', boxShadow: '0 0 0 3px var(--accent-glow)' },
  btn: {
    marginTop: '0.5rem', background: 'var(--accent)', color: '#0a0a0a',
    border: 'none', borderRadius: 'var(--radius)', padding: '0.75rem 1.5rem',
    fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.04em', cursor: 'pointer',
    transition: 'opacity var(--transition)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
  switchText: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.5rem' },
  link: { color: 'var(--accent)', textDecoration: 'none' },
};
