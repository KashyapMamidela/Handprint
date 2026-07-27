import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Header from '../components/Header';
import RankAvatar from '../components/RankAvatar';
import { supabase } from '../lib/supabaseClient';

const PODIUM_DELAYS = ['0.2s', '0.05s', '0.35s']; // [1st, 2nd, 3rd] visual order is 2nd, 1st, 3rd

export default function Leaderboard() {
  const [rows, setRows] = useState(null);

  const load = () => {
    supabase
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .then(({ data }) => setRows(data || []));
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('leaderboard_hour_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hour_logs' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const data = rows || [];
  const podium = data.slice(0, 3);
  const rest = data.slice(3);
  const max = data.length ? Number(data[0].hours) || 1 : 1;
  const chartData = data.slice(0, 10).map((r) => ({ name: r.name, hours: Number(r.hours) }));

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <div className="mx-auto max-w-[1200px] px-12 pb-24 pt-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="mb-2 font-display text-[32px] font-semibold text-cream">Leaderboard</h1>
            <p className="text-[15px] text-text-nav">Top contributors, ranked by verified hours.</p>
          </div>
          <div className="flex gap-3">
            <select className="h-11 rounded-[10px] border border-white/[0.14] bg-white/[0.04] px-3 font-sans text-sm text-cream">
              <option>All drives</option>
            </select>
            <select className="h-11 rounded-[10px] border border-white/[0.14] bg-white/[0.04] px-3 font-sans text-sm text-cream">
              <option>This term</option>
              <option>This month</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        {podium.length === 3 && (
          <div className="mb-16 flex justify-center pt-8" style={{ perspective: 1400 }}>
            <div className="flex items-end gap-8">
              <PodiumPlace
                place={2}
                person={podium[1]}
                delay={PODIUM_DELAYS[1]}
                ringColor="#3fa588"
                textColor="#59c2a4"
                avatarBg="rgba(63,165,136,0.18)"
                avatarSize={56}
                fontSize={16}
                plinthHeight={110}
                plinthWidth={150}
                gradient="linear-gradient(160deg,#59c2a4,#2f7f68 70%)"
                numberColor="rgba(13,15,16,0.5)"
              />
              <PodiumPlace
                place={1}
                person={podium[0]}
                delay={PODIUM_DELAYS[0]}
                ringColor="#d4af37"
                textColor="#e8c766"
                avatarBg="rgba(212,175,55,0.18)"
                avatarSize={68}
                fontSize={19}
                plinthHeight={150}
                plinthWidth={170}
                gradient="linear-gradient(160deg,#f3d98a,#d4af37 55%,#a8802a)"
                numberColor="rgba(20,18,10,0.55)"
                glow
              />
              <PodiumPlace
                place={3}
                person={podium[2]}
                delay={PODIUM_DELAYS[2]}
                ringColor="#c98f5c"
                textColor="#d6a679"
                avatarBg="rgba(201,143,92,0.18)"
                avatarSize={52}
                fontSize={15}
                plinthHeight={84}
                plinthWidth={150}
                gradient="linear-gradient(160deg,#d6a679,#8a5a35 70%)"
                numberColor="rgba(20,15,10,0.45)"
              />
            </div>
          </div>
        )}

        <div className="mb-16 overflow-hidden rounded-xl border border-white/[0.09]">
          <div
            className="grid gap-2 border-b border-white/[0.08] bg-white/[0.03] px-6 py-3.5"
            style={{ gridTemplateColumns: '0.5fr 2fr 1fr 3fr' }}
          >
            <HeadCell>Rank</HeadCell>
            <HeadCell>Student</HeadCell>
            <HeadCell>Hours</HeadCell>
            <HeadCell>Verified hours</HeadCell>
          </div>
          {rest.map((r) => (
            <div
              key={r.student_id}
              className="grid items-center gap-2 border-b border-white/[0.06] px-6 py-3.5"
              style={{ gridTemplateColumns: '0.5fr 2fr 1fr 3fr' }}
            >
              <div className="text-sm font-bold text-text-muted">#{r.rank}</div>
              <div className="flex items-center gap-3">
                <RankAvatar
                  initials={r.initials}
                  bg="rgba(255,255,255,0.06)"
                  color="#a8a29b"
                  size={34}
                  fontSize={12}
                />
                <div className="text-sm font-bold text-cream">{r.name}</div>
              </div>
              <div className="text-sm font-bold text-cream">{r.hours}</div>
              <div className="h-2.5 overflow-hidden rounded-md bg-white/[0.06]">
                <div
                  className="h-full rounded-md bg-gradient-to-r from-gold-400 to-green-400"
                  style={{ width: `${Math.round((Number(r.hours) / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-7">
            <h2 className="mb-5 font-display text-xl font-semibold text-cream">Hours by student</h2>
            <ResponsiveContainer width="100%" height={Math.max(chartData.length * 36, 160)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 24 }}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#3fa588" />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" tick={{ fill: '#6b6862', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: '#f5f1e8', fontSize: 13, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#101315',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 10,
                    color: '#f5f1e8',
                  }}
                  labelStyle={{ color: '#f5f1e8', fontWeight: 700 }}
                />
                <Bar dataKey="hours" fill="url(#barFill)" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function HeadCell({ children }) {
  return <div className="text-xs font-bold uppercase tracking-wide text-text-muted">{children}</div>;
}

function PodiumPlace({
  person,
  place,
  delay,
  ringColor,
  textColor,
  avatarBg,
  avatarSize,
  fontSize,
  plinthHeight,
  plinthWidth,
  gradient,
  numberColor,
  glow,
}) {
  return (
    <div
      className="flex flex-col items-center gap-3.5 animate-podiumRise"
      style={{ animationDelay: delay }}
    >
      <div
        className="flex items-center justify-center rounded-full font-extrabold"
        style={{
          width: avatarSize,
          height: avatarSize,
          fontSize,
          background: avatarBg,
          border: `2px solid ${ringColor}`,
          color: textColor,
          boxShadow: glow ? '0 0 24px -4px rgba(212,175,55,0.5)' : undefined,
        }}
      >
        {person?.initials}
      </div>
      <div className="text-center">
        <div className="text-[15px] font-bold text-cream">{person?.name}</div>
        <div className="mt-0.5 text-[13px]" style={{ color: place === 1 ? '#e8c766' : '#6b6862', fontWeight: place === 1 ? 700 : 400 }}>
          {person?.hours} hrs
        </div>
      </div>
      <div
        className="flex items-center justify-center rounded-t-xl"
        style={{
          width: plinthWidth,
          height: plinthHeight,
          background: gradient,
          boxShadow: `0 -2px 0 rgba(255,255,255,0.25) inset, 0 24px 40px -16px rgba(0,0,0,0.4)`,
        }}
      >
        <span className="font-display font-bold" style={{ fontSize: place === 1 ? 44 : place === 3 ? 32 : 36, color: numberColor }}>
          {place}
        </span>
      </div>
    </div>
  );
}
