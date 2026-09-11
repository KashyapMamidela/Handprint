import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        signOut();
        setError('This account does not have admin access.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-12"
      style={{ background: 'radial-gradient(ellipse 900px 500px at 50% -10%,rgba(212,175,55,0.08),transparent)' }}
    >
      <Link to="/" className="absolute left-12 top-10 flex items-center gap-2.5 text-cream">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-gold-100 to-gold-400" />
        <span className="font-display text-lg font-semibold">Handprint</span>
      </Link>

      <div className="w-[400px] rounded-2xl border border-white/[0.09] bg-white/[0.045] p-10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
        <h1 className="mb-2 text-center font-display text-[28px] font-semibold text-cream">Admin sign in</h1>
        <p className="mb-8 text-center text-sm text-text-secondary">
          For drive organizers and campus staff only.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Admin email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="h-12 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3.5 font-sans text-sm text-cream box-border"
            />
          </Field>
          <Field label="Password">
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-[13px] text-red-200">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex h-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-gold-100 to-gold-400 text-[15px] font-bold text-ink-deep shadow-cta disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-text-secondary">
          Not an admin? <Link to="/login" className="font-bold text-gold-200 hover:text-gold-100">Volunteer sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary">{label}</label>
      {children}
    </div>
  );
}
