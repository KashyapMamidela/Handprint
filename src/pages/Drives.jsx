import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCardTiltCallback } from '../hooks/useTilt';
import { supabase } from '../lib/supabaseClient';
import { formatDate } from '../utils/format';

export default function Drives() {
  const [drives, setDrives] = useState([]);
  const cardRef = useCardTiltCallback({
    rotateX: 9,
    rotateY: 9,
    perspective: 900,
    extraTransform: 'translateY(-4px)',
    hoverShadow: '0 30px 50px -20px rgba(0,0,0,0.7)',
    resetShadow: '0 20px 40px -24px rgba(0,0,0,0.6)',
  });

  useEffect(() => {
    supabase
      .from('drives')
      .select('*')
      .order('event_date', { ascending: true })
      .then(({ data }) => setDrives(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <div className="mx-auto max-w-[1200px] px-12 pb-24 pt-12">
        <h1 className="mb-2 font-display text-[32px] font-semibold text-cream">Open drives</h1>
        <p className="mb-10 text-[15px] text-text-nav">
          Find a drive, show up, and log your hours when you're done.
        </p>

        <div className="grid grid-cols-3 gap-6" style={{ perspective: 1200 }}>
          {drives.map((d) => (
            <div
              key={d.id}
              ref={cardRef}
              className="flex flex-col gap-3 rounded-xl border border-white/[0.09] bg-white/[0.045] p-6 shadow-card transition-[transform,box-shadow] duration-100 ease-out"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-text-muted">{d.org}</span>
                <span className="rounded-full bg-gold-400/[0.12] px-2.5 py-1 text-xs font-bold text-gold-200">
                  {d.hours_estimate} hrs
                </span>
              </div>
              <h3 className="text-lg font-bold text-cream">{d.name}</h3>
              <p className="flex-1 text-sm leading-relaxed text-text-secondary">{d.description}</p>
              <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
                <div>
                  <div className="text-[13px] font-semibold text-cream">{formatDate(d.event_date)}</div>
                  <div className="mt-0.5 text-xs text-text-muted">{d.spots} spots open</div>
                </div>
                <Link
                  to="/dashboard"
                  className="flex h-[38px] items-center rounded-[9px] bg-gradient-to-br from-gold-100 to-gold-400 px-[18px] text-[13px] font-bold text-ink-deep"
                >
                  Log Hours
                </Link>
              </div>
            </div>
          ))}
          {drives.length === 0 && <p className="text-sm text-text-muted">No open drives right now.</p>}
        </div>
      </div>
    </div>
  );
}
