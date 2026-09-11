import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatDate } from '../utils/format';

export default function AdminQueue() {
  const { profile } = useAuth();
  const [queue, setQueue] = useState(null);
  const [driveOptions, setDriveOptions] = useState([]);
  const [driveFilter, setDriveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [rejectingId, setRejectingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);

  const loadQueue = useCallback(async () => {
    const { data } = await supabase
      .from('hour_logs')
      .select('*, drives(id, name, org), student:profiles!hour_logs_student_id_fkey(name)')
      .eq('status', 'pending');
    setQueue(
      (data || []).map((q) => ({
        ...q,
        drive_name: q.drives?.name,
        drive_org: q.drives?.org,
        student_name: q.student?.name,
      }))
    );
  }, []);

  useEffect(() => {
    if (!profile) return;
    loadQueue();
    supabase
      .from('drives')
      .select('id, name')
      .then(({ data }) => setDriveOptions(data || []));
  }, [profile, loadQueue]);

  useEffect(() => {
    const channel = supabase
      .channel('hour_logs_admin_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hour_logs' }, () => loadQueue())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadQueue]);

  const approve = async (id) => {
    setBusyId(id);
    await supabase
      .from('hour_logs')
      .update({ status: 'approved', verified_by: profile.id, verified_at: new Date().toISOString() })
      .eq('id', id);
    setBusyId(null);
    loadQueue();
  };

  const confirmReject = async (id) => {
    setBusyId(id);
    await supabase
      .from('hour_logs')
      .update({
        status: 'rejected',
        verified_by: profile.id,
        verified_at: new Date().toISOString(),
        rejection_reason: drafts[id] || '',
      })
      .eq('id', id);
    setBusyId(null);
    setRejectingId(null);
    loadQueue();
  };

  const visibleQueue = useMemo(() => {
    let rows = queue || [];
    if (driveFilter !== 'all') rows = rows.filter((q) => String(q.drive_id) === driveFilter);
    rows = [...rows].sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'hours') return Number(b.hours) - Number(a.hours);
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return rows;
  }, [queue, driveFilter, sortBy]);

  const isEmpty = queue !== null && visibleQueue.length === 0;

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <div className="mx-auto max-w-[1200px] px-12 pb-24 pt-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-2 font-display text-[32px] font-semibold text-cream">Verification queue</h1>
            <p className="text-[15px] text-text-nav">{visibleQueue.length} submissions waiting on your review.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={driveFilter}
              onChange={(e) => setDriveFilter(e.target.value)}
              className="h-11 rounded-[10px] border border-white/[0.14] bg-white/[0.04] px-3 font-sans text-sm text-cream"
            >
              <option value="all">All drives</option>
              {driveOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 rounded-[10px] border border-white/[0.14] bg-white/[0.04] px-3 font-sans text-sm text-cream"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="hours">Most hours</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.09]">
          <div
            className="grid gap-2 border-b border-white/[0.08] bg-white/[0.03] px-6 py-3.5"
            style={{ gridTemplateColumns: '1.4fr 1.6fr 0.7fr 0.9fr 1.4fr' }}
          >
            <HeadCell>Volunteer</HeadCell>
            <HeadCell>Drive</HeadCell>
            <HeadCell>Hours</HeadCell>
            <HeadCell>Submitted</HeadCell>
            <HeadCell className="text-right">Actions</HeadCell>
          </div>

          {visibleQueue.map((q) => (
            <div key={q.id} className="border-b border-white/[0.06]">
              <div
                className="grid items-center gap-2 px-6 py-4"
                style={{ gridTemplateColumns: '1.4fr 1.6fr 0.7fr 0.9fr 1.4fr' }}
              >
                <div className="text-sm font-bold text-cream">{q.student_name}</div>
                <div>
                  <div className="text-sm text-cream">{q.drive_name}</div>
                  <div className="mt-0.5 text-xs text-text-muted">{q.drive_org}</div>
                </div>
                <div className="text-sm font-semibold text-cream">{q.hours} hrs</div>
                <div className="text-[13px] text-text-nav">{formatDate(q.created_at)}</div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={busyId === q.id}
                    onClick={() => approve(q.id)}
                    className="h-9 rounded-lg border border-green-400/30 bg-green-400/[0.16] px-4 text-[13px] font-bold text-green-200 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === q.id}
                    onClick={() => setRejectingId(rejectingId === q.id ? null : q.id)}
                    className="h-9 rounded-lg border border-red-400/[0.28] bg-red-400/[0.12] px-4 text-[13px] font-bold text-red-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
              {rejectingId === q.id && (
                <div className="flex gap-2.5 px-6 pb-4">
                  <input
                    value={drafts[q.id] || ''}
                    onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                    placeholder="Reason for rejection…"
                    className="h-[38px] flex-1 rounded-lg border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-[13px] text-cream box-border"
                  />
                  <button
                    type="button"
                    disabled={busyId === q.id}
                    onClick={() => confirmReject(q.id)}
                    className="h-[38px] rounded-lg bg-red-400 px-4 text-[13px] font-bold text-cream disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          ))}

          {isEmpty && <div className="p-12 text-center text-sm text-text-muted">Queue is clear — nice work.</div>}
        </div>
      </div>
    </div>
  );
}

function HeadCell({ children, className = '' }) {
  return (
    <div className={`text-xs font-bold uppercase tracking-wide text-text-muted ${className}`}>{children}</div>
  );
}
