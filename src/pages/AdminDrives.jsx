import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatDate } from '../utils/format';

const EMPTY_FORM = { name: '', org: '', description: '', event_date: '', hours_estimate: '', spots: '' };

export default function AdminDrives() {
  const { profile } = useAuth();
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadDrives = () =>
    supabase
      .from('drives')
      .select('*')
      .order('event_date', { ascending: true })
      .then(({ data }) => setDrives(data || []));

  useEffect(() => {
    loadDrives();
  }, []);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const startEdit = (drive) => {
    setEditingId(drive.id);
    setForm({
      name: drive.name,
      org: drive.org,
      description: drive.description || '',
      event_date: drive.event_date || '',
      hours_estimate: drive.hours_estimate ?? '',
      spots: drive.spots ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.org) {
      setError('Name and org are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        org: form.org,
        description: form.description,
        event_date: form.event_date || null,
        hours_estimate: form.hours_estimate || null,
        spots: form.spots || null,
      };
      if (editingId) {
        const { error: updateError } = await supabase.from('drives').update(payload).eq('id', editingId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('drives')
          .insert({ ...payload, created_by: profile.id });
        if (insertError) throw insertError;
      }
      cancelEdit();
      loadDrives();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <div className="mx-auto max-w-[1200px] px-12 pb-24 pt-12">
        <h1 className="mb-2 font-display text-[32px] font-semibold text-cream">Drives</h1>
        <p className="mb-10 text-[15px] text-text-nav">Post new drives and update the ones already live.</p>

        <div className="grid items-start gap-6" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-7">
            <h2 className="mb-5 font-display text-xl font-semibold text-cream">
              {editingId ? 'Edit drive' : 'Post a drive'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={setField('name')}
                  placeholder="Riverside Cleanup Day"
                  className="h-11 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-sm text-cream box-border"
                />
              </Field>
              <Field label="Organization">
                <input
                  value={form.org}
                  onChange={setField('org')}
                  placeholder="EcoAction Club"
                  className="h-11 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-sm text-cream box-border"
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={setField('description')}
                  placeholder="What will volunteers be doing?"
                  className="w-full resize-none rounded-[10px] border border-white/[0.14] bg-white/[0.03] p-3 font-sans text-sm text-cream box-border"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Event date">
                  <input
                    type="date"
                    value={form.event_date || ''}
                    onChange={setField('event_date')}
                    className="h-11 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-sm text-cream box-border"
                  />
                </Field>
                <Field label="Hours estimate">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hours_estimate}
                    onChange={setField('hours_estimate')}
                    placeholder="e.g. 3"
                    className="h-11 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-sm text-cream box-border"
                  />
                </Field>
              </div>
              <Field label="Spots">
                <input
                  type="number"
                  min="0"
                  value={form.spots}
                  onChange={setField('spots')}
                  placeholder="e.g. 20"
                  className="h-11 w-full rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 font-sans text-sm text-cream box-border"
                />
              </Field>

              {error && <p className="text-[13px] text-red-200">{error}</p>}

              <div className="mt-1 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-12 flex-1 rounded-[10px] bg-gradient-to-br from-gold-100 to-gold-400 text-[15px] font-bold text-ink-deep shadow-cta disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Post drive'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="h-12 rounded-[10px] border border-white/[0.16] px-5 text-[15px] font-bold text-cream"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-7">
            <h2 className="mb-5 font-display text-xl font-semibold text-cream">Existing drives</h2>
            <div className="flex flex-col gap-3">
              {drives.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] p-4"
                >
                  <div>
                    <div className="text-sm font-bold text-cream">{d.name}</div>
                    <div className="mt-0.5 text-xs text-text-muted">
                      {d.org} · {formatDate(d.event_date)} · {d.hours_estimate ?? '—'} hrs · {d.spots ?? '—'} spots
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(d)}
                    className="h-9 shrink-0 rounded-lg border border-white/[0.14] px-4 text-[13px] font-bold text-cream"
                  >
                    Edit
                  </button>
                </div>
              ))}
              {drives.length === 0 && <p className="text-sm text-text-muted">No drives posted yet.</p>}
            </div>
          </div>
        </div>
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
