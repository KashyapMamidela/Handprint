import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import HandprintMark from '../components/HandprintMark';
import RankAvatar from '../components/RankAvatar';
import { useTilt } from '../hooks/useTilt';
import { supabase } from '../lib/supabaseClient';
import { RANK_STYLES } from '../utils/rankStyles';
import { formatDate } from '../utils/format';

export default function Landing() {
  const markRef = useRef(null);
  const heroRef = useTilt({ rotateX: 10, rotateY: 14, targetRef: markRef });

  const [leaders, setLeaders] = useState(null);
  const [drivesPreview, setDrivesPreview] = useState(null);
  const [stats, setStats] = useState({ hours: 0, students: 0, drives: 0 });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ data: leaderboard }, { data: drives, count: driveCount }] = await Promise.all([
        supabase.from('leaderboard').select('*').order('rank', { ascending: true }),
        supabase
          .from('drives')
          .select('*', { count: 'exact' })
          .order('event_date', { ascending: true })
          .limit(3),
      ]);

      if (cancelled) return;

      const leaderRows = leaderboard || [];
      setLeaders(leaderRows.slice(0, 3));
      setDrivesPreview(drives || []);
      setStats({
        hours: leaderRows.reduce((sum, l) => sum + Number(l.hours || 0), 0),
        students: leaderRows.filter((l) => Number(l.hours || 0) > 0).length,
        drives: driveCount ?? 0,
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <Header />

      <section ref={heroRef} className="mx-auto grid max-w-[1200px] grid-cols-12 items-center gap-6 px-12 pb-16 pt-24">
        <div className="col-span-6">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/[0.12] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            <span className="text-[13px] font-bold uppercase tracking-wide text-gold-200">
              Volunteer hours, verified
            </span>
          </div>
          <h1 className="mb-6 font-display text-[68px] font-semibold leading-[1.04] tracking-tight text-cream">
            Leave your
            <br />
            mark.
          </h1>
          <p className="mb-10 max-w-[460px] text-[19px] leading-relaxed text-text-secondary">
            Log your service hours, get them verified by real organizers, and see your impact climb the campus
            leaderboard — all in one calm, honest place.
          </p>
          <div className="mb-10 flex gap-4">
            <Link
              to="/login"
              className="flex h-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-gold-100 to-gold-400 px-7 text-[15px] font-bold text-ink-deep shadow-cta"
            >
              Start Logging Hours
            </Link>
            <Link
              to="/drives"
              className="flex h-12 items-center justify-center rounded-[10px] border border-white/[0.16] px-7 text-[15px] font-bold text-cream"
            >
              Browse Drives
            </Link>
          </div>
          <div className="flex gap-10">
            <Stat value={stats.hours.toLocaleString()} label="verified hours this term" />
            <Stat value={stats.students.toLocaleString()} label="students participating" />
            <Stat value={stats.drives.toLocaleString()} label="active drives" />
          </div>
        </div>

        <div className="col-span-5 col-start-8 flex justify-center" style={{ perspective: 1000 }}>
          <HandprintMark ref={markRef} />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-12 pb-24 pt-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-cream">This month's top contributors</h2>
          <Link to="/leaderboard" className="text-sm font-bold text-gold-200">
            View full leaderboard →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {(leaders || []).map((l, i) => (
            <div
              key={l.student_id}
              className="flex items-center gap-4 rounded-xl border border-white/[0.09] bg-white/[0.045] p-5"
            >
              <RankAvatar initials={l.initials} bg={RANK_STYLES[i].bg} color={RANK_STYLES[i].color} />
              <div className="flex-1">
                <div className="text-[15px] font-bold text-cream">{l.name}</div>
                <div className="mt-0.5 text-[13px] text-text-muted">
                  {l.hours} hrs · rank #{l.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-alt py-24">
        <div className="mx-auto max-w-[1200px] px-12">
          <h2 className="mb-12 text-center font-display text-3xl font-semibold text-cream">How it works</h2>
          <div className="grid grid-cols-3 gap-6">
            <HowItWorksCard number="1" accent="gold" title="Log">
              Pick a drive, enter your hours, and add a quick description of what you did.
            </HowItWorksCard>
            <HowItWorksCard number="2" accent="green" title="Verify">
              The organizer who ran the drive reviews and confirms your submission.
            </HowItWorksCard>
            <HowItWorksCard number="3" accent="gold" title="Rank">
              Verified hours count toward your total and your place on the leaderboard.
            </HowItWorksCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-12 py-24">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-cream">Open drives near you</h2>
          <Link to="/drives" className="text-sm font-bold text-gold-200">
            Browse all drives →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {(drivesPreview || []).map((d) => (
            <div key={d.id} className="flex flex-col gap-3 rounded-xl border border-white/[0.09] bg-white/[0.045] p-6">
              <div className="text-xs font-bold uppercase tracking-wide text-text-muted">{d.org}</div>
              <h3 className="text-[17px] font-bold text-cream">{d.name}</h3>
              <p className="flex-1 text-sm leading-relaxed text-text-secondary">{d.description}</p>
              <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
                <span className="text-[13px] text-text-muted">{formatDate(d.event_date)}</span>
                <Link to="/drives" className="text-[13px] font-bold text-gold-200">
                  Log Hours →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.08] p-12">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-gold-100 to-gold-400" />
            <span className="font-display text-base font-semibold text-cream">Handprint</span>
          </div>
          <span className="text-[13px] text-text-muted">© 2026 Handprint. Leave your mark.</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-display text-[26px] font-semibold text-cream">{value}</div>
      <div className="mt-0.5 text-[13px] text-text-muted">{label}</div>
    </div>
  );
}

const ACCENTS = {
  gold: { bg: 'rgba(212,175,55,0.15)', color: '#e8c766' },
  green: { bg: 'rgba(63,165,136,0.15)', color: '#59c2a4' },
};

function HowItWorksCard({ number, accent, title, children }) {
  const style = ACCENTS[accent];
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-8">
      <div
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-[10px] font-display text-[17px] font-bold"
        style={{ background: style.bg, color: style.color }}
      >
        {number}
      </div>
      <h3 className="mb-2 text-lg font-bold text-cream">{title}</h3>
      <p className="text-[15px] leading-relaxed text-text-secondary">{children}</p>
    </div>
  );
}
