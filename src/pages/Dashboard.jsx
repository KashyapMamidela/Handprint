import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useTilt } from '../hooks/useTilt';
import { supabase } from '../lib/supabaseClient';
import { formatDate } from '../utils/format';

const TILT_OPTS = {
  rotateX: 8,
  rotateY: 8,
  perspective: 800,
  extraTransform: 'translateZ(4px)',
  resetTransform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
};

export default function Dashboard() {
  const { profile } = useAuth();

  const cardRef0 = useTilt(TILT_OPTS);
  const cardRef1 = useTilt(TILT_OPTS);
  const cardRef2 = useTilt(TILT_OPTS);

  const [drives, setDrives] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [rankRow, setRankRow] = useState(null);
  const [studentCount, setStudentCount] = useState(0);

  const [driveId, setDriveId] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const fileInputRef = useRef(null);

  const loadSubmissions = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('hour_logs')
      .select('*, drives(name, org)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false });
    setSubmissions((data || []).map((s) => ({ ...s, drive_name: s.drives?.name, drive_org: s.drives?.org })));
  }, [profile]);

  const loadRank = useCallback(async () => {
    if (!profile) return;
    const [{ data: row }, { count }] = await Promise.all([
      supabase.from('leaderboard').select('*').eq('student_id', profile.id).maybeSingle(),
      supabase.from('leaderboard').select('student_id', { count: 'exact', head: true }),
    ]);
    setRankRow(row);
    setStudentCount(count ?? 0);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('drives')
      .select('*')
      .order('event_date', { ascending: true })
      .then(({ data }) => setDrives(data || []));
    loadSubmissions();
    loadRank();
  }, [profile, loadSubmissions, loadRank]);

  useEffect(() => {
    if (!profile) return undefined;
    const channel = supabase
      .channel(`hour_logs_student_${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hour_logs', filter: `student_id=eq.${profile.id}` },
        () => {
          loadSubmissions();
          loadRank();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, loadSubmissions, loadRank]);

  const approvedHours = submissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + Number(s.hours), 0);
  const pendingHours = submissions.filter((s) => s.status === 'pending').reduce((sum, s) => sum + Number(s.hours), 0);
  const totalHours = approvedHours + pendingHours;
  const now = new Date();
  const monthDelta = submissions
    .filter((s) => {
      if (s.status !== 'approved' || !s.verified_at) return false;
      const d = new Date(s.verified_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, s) => sum + Number(s.hours), 0);

  const handleFilePick = (picked) => {
    if (picked) setFile(picked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driveId || !hours) {
      setFormError('Pick a drive and enter your hours.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      let proofPath = null;
      if (file) {
        const path = `${profile.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('proof').upload(path, file);
        if (uploadError) throw uploadError;
        proofPath = path;
      }

      const { error: insertError } = await supabase.from('hour_logs').insert({
        student_id: profile.id,
        drive_id: driveId,
        hours: Number(hours),
        description,
        proof_path: proofPath,
      });
      if (insertError) throw insertError;

      setDriveId('');
      setHours('');
      setDescription('');
      setFile(null);
      loadSubmissions();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <div className="mx-auto max-w-[1200px] px-12 pb-24 pt-12">
        <h1 className="mb-2 font-display text-[32px] font-semibold text-cream">
          Welcome back, {profile?.name?.split(' ')[0] || ''}
        </h1>
        <p className="mb-10 text-[15px] text-text-nav">Here's where your impact stands this term.</p>

        <div className="mb-12 grid grid-cols-3 gap-6" style={{ perspective: 1200 }}>
          <div
            ref={cardRef0}
            className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-7 shadow-card transition-transform duration-100 ease-out"
          >
            <div className="mb-3 text-[13px] font-bold uppercase tracking-wide text-text-muted">Total hours</div>
            <div className="font-display text-[44px] font-semibold text-cream">{totalHours}</div>
            <div className="mt-2 text-[13px] font-semibold text-green-200">↑ {monthDelta} this month</div>
          </div>

          <div
            ref={cardRef1}
            className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-7 shadow-card transition-transform duration-100 ease-out"
          >
            <div className="mb-3 text-[13px] font-bold uppercase tracking-wide text-text-muted">
              Verified vs pending
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-[44px] font-semibold text-green-200">{approvedHours}</span>
              <span className="text-base text-text-muted">/ {pendingHours} pending</span>
            </div>
            <div className="mt-3.5 flex h-1.5 gap-1 overflow-hidden rounded">
              <div className="bg-green-400" style={{ flex: Math.max(approvedHours, 1) }} />
              <div className="bg-gold-400" style={{ flex: Math.max(pendingHours, 0.001) }} />
            </div>
          </div>

          <div
            ref={cardRef2}
            className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-7 shadow-card transition-transform duration-100 ease-out"
          >
            <div className="mb-3 text-[13px] font-bold uppercase tracking-wide text-text-muted">Campus rank</div>
            <div className="font-display text-[44px] font-semibold text-gold-200">
              {rankRow ? `#${rankRow.rank}` : '—'}
            </div>
            <div className="mt-2 text-[13px] text-text-muted">of {studentCount} volunteers</div>
          </div>
        </div>

        <div className="grid items-start gap-6" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-7">
            <h2 className="mb-5 font-display text-xl font-semibold text-cream">Log hours</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary">Drive</label>
                <select
                  value={driveId}
                  onChange={(e) => setDriveId(e.target.value)}
                  className="h-11 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-sm text-cream box-border"
                >
                  <option value="">Select a drive…</option>
                  {drives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.org}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary">Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g. 3"
                  className="h-11 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-sm text-cream box-border"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary">
                  What did you do?
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe your contribution…"
                  className="w-full resize-none rounded-[10px] border border-white/[0.14] bg-white/[0.03] p-3 font-sans text-sm text-cream box-border"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary">
                  Proof (optional)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFilePick(e.dataTransfer.files?.[0]);
                  }}
                  className={`cursor-pointer rounded-[10px] border-[1.5px] border-dashed p-6 text-center text-[13px] text-text-muted ${
                    dragOver ? 'border-gold-400' : 'border-white/[0.18]'
                  }`}
                >
                  {file ? file.name : 'Drag a photo or PDF here, or click to browse'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFilePick(e.target.files?.[0])}
                  />
                </div>
              </div>

              {formError && <p className="text-[13px] text-red-200">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 h-12 rounded-[10px] bg-gradient-to-br from-gold-100 to-gold-400 text-[15px] font-bold text-ink-deep shadow-cta disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit for verification'}
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-7">
            <h2 className="mb-5 font-display text-xl font-semibold text-cream">My submissions</h2>
            <div className="flex flex-col gap-3">
              {submissions.map((s) => (
                <div key={s.id} className="flex flex-col gap-2 rounded-xl border border-white/[0.08] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-cream">{s.drive_name}</div>
                      <div className="mt-0.5 text-xs text-text-muted">
                        {s.drive_org} · {formatDate(s.created_at)} · {s.hours} hrs
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  {s.status === 'rejected' && s.rejection_reason && (
                    <div className="rounded-lg bg-red-400/10 p-2.5 text-xs text-red-400">{s.rejection_reason}</div>
                  )}
                </div>
              ))}
              {submissions.length === 0 && <p className="text-sm text-text-muted">No submissions yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
