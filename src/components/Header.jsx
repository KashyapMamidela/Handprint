import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGGED_OUT_NAV = [
  { to: '/drives', label: 'Drives' },
  { to: '/leaderboard', label: 'Leaderboard' },
];
const VOLUNTEER_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/drives', label: 'Drives' },
  { to: '/leaderboard', label: 'Leaderboard' },
];
const ADMIN_NAV = [
  { to: '/admin', label: 'Queue' },
  { to: '/admin/drives', label: 'Post Drive' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAvatarClick = async () => {
    await signOut();
    navigate('/');
  };

  const isAdmin = profile?.role === 'admin';
  const navItems = !profile ? LOGGED_OUT_NAV : isAdmin ? ADMIN_NAV : VOLUNTEER_NAV;

  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-white/[0.08] bg-ink/85 px-12 backdrop-blur-lg">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-[9px] bg-gradient-to-br from-gold-100 to-gold-400 shadow-mark" />
        <span className="font-display text-xl font-semibold text-cream">Handprint</span>
      </Link>

      <nav className="flex items-center gap-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `text-[15px] ${isActive ? 'font-bold text-gold-200' : 'font-semibold text-text-nav'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {profile ? (
        <button
          type="button"
          onClick={handleAvatarClick}
          title="Sign out"
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold ${
            isAdmin ? 'bg-green-400 text-ink' : 'bg-gold-400 text-ink-deep'
          }`}
        >
          {profile.initials}
        </button>
      ) : (
        <Link
          to="/login"
          className="flex h-10 items-center gap-2.5 rounded-[10px] border border-white/[0.14] px-[18px] text-sm font-bold text-cream"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
