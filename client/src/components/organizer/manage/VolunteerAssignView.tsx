import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, Trash2, UserPlus, X, Check, Clock, XCircle, ShieldCheck, Search, Copy, Send } from 'lucide-react';
import { Volunteer, VolunteerRole, VolunteerStatus } from '../../../types/organizer';
import { organizerApi } from '../../../services/organizerApi';

interface Props {
  eventId: string;
}

const ROLES: { value: VolunteerRole; label: string; color: string }[] = [
  { value: 'coordinator',       label: 'Coordinator',   color: 'bg-primary-fixed' },
  { value: 'registration-desk', label: 'Reg Desk',      color: 'bg-secondary-container' },
  { value: 'stage-manager',     label: 'Stage Manager', color: 'bg-tertiary-fixed' },
  { value: 'security',          label: 'Security',      color: 'bg-error-container' },
  { value: 'photography',       label: 'Photography',   color: 'bg-primary-container' },
  { value: 'tech-support',      label: 'Tech Support',  color: 'bg-tertiary-container' },
  { value: 'catering',          label: 'Catering',      color: 'bg-secondary-fixed' },
  { value: 'first-aid',         label: 'First Aid',     color: 'bg-surface-variant' },
];

const STATUS_META: Record<VolunteerStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  invited:      { label: 'Invited',    color: 'bg-surface-variant',    icon: Clock },
  accepted:     { label: 'Accepted',   color: 'bg-primary-container',  icon: Check },
  declined:     { label: 'Declined',   color: 'bg-error-container',    icon: XCircle },
  'checked-in': { label: 'Checked In', color: 'bg-primary-fixed',      icon: ShieldCheck },
  'no-show':    { label: 'No Show',    color: 'bg-tertiary-container', icon: X },
};

export const VolunteerAssignView: React.FC<Props> = ({ eventId }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | VolunteerRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | VolunteerStatus>('all');
  const [showInvite, setShowInvite] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await organizerApi.getVolunteers(eventId);
    setVolunteers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [eventId]);

  const filtered = useMemo(() => volunteers.filter((v) =>
    (!filterRole || filterRole === 'all' || v.role === filterRole) &&
    (!filterStatus || filterStatus === 'all' || v.status === filterStatus) &&
    (!search || v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()))
  ), [volunteers, search, filterRole, filterStatus]);

  const counts = useMemo(() => ({
    total: volunteers.length,
    accepted: volunteers.filter((v) => v.status === 'accepted').length,
    checkedIn: volunteers.filter((v) => v.status === 'checked-in').length,
    invited: volunteers.filter((v) => v.status === 'invited').length,
    declined: volunteers.filter((v) => v.status === 'declined').length,
  }), [volunteers]);

  const remove = async (id: string) => {
    if (!confirm('Remove this volunteer?')) return;
    await organizerApi.removeVolunteer(eventId, id);
    setVolunteers((p) => p.filter((v) => v.id !== id));
  };

  const updateStatus = async (id: string, status: VolunteerStatus) => {
    await organizerApi.updateVolunteer(eventId, id, { status });
    setVolunteers((p) => p.map((v) => (v.id === id ? { ...v, status } : v)));
  };

  if (loading) {
    return <div className="py-16 text-center font-label-bold uppercase tracking-widest">Loading volunteers…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total"      value={counts.total}     color="bg-surface" />
        <Stat label="Invited"     value={counts.invited}   color="bg-surface-variant" />
        <Stat label="Accepted"    value={counts.accepted}  color="bg-primary-container" />
        <Stat label="Checked In"  value={counts.checkedIn} color="bg-primary-fixed" />
        <Stat label="Declined"    value={counts.declined}  color="bg-error-container" />
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-surface border-4 border-on-background p-4">
        <div className="flex items-center flex-1 min-w-[200px] border-4 border-on-background bg-background">
          <div className="px-3 py-2 bg-surface-variant border-r-4 border-on-background">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH VOLUNTEERS…"
            className="flex-1 px-3 py-2 font-label-bold text-sm bg-transparent focus:outline-none uppercase"
          />
        </div>

        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} className="border-4 border-on-background bg-background px-3 py-2 font-label-bold text-sm uppercase">
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="border-4 border-on-background bg-background px-3 py-2 font-label-bold text-sm uppercase">
          <option value="all">All Status</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <button onClick={() => setShowInvite(true)} className="ml-auto flex items-center gap-2 border-4 border-on-background bg-tertiary-fixed px-4 py-2 font-label-bold uppercase neo-shadow-sm hover-lift press-down">
          <UserPlus className="w-4 h-4 stroke-[3]" /> INVITE VOLUNTEER
        </button>
      </div>

      <div className="space-y-6">
        {ROLES.map((r) => {
          const list = filtered.filter((v) => v.role === r.value);
          if (list.length === 0) return null;
          return (
            <div key={r.value} className="border-4 border-on-background bg-surface">
              <div className={`${r.color} border-b-4 border-on-background px-4 py-3 flex items-center justify-between`}>
                <h4 className="font-extrabold uppercase tracking-tight">{r.label}</h4>
                <span className="border-2 border-on-background bg-background px-2 py-0.5 text-xs font-extrabold">{list.length}</span>
              </div>
              <div className="divide-y-4 divide-on-background">
                {list.map((v) => <VolunteerRow key={v.id} v={v} onRemove={remove} onStatus={updateStatus} />)}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-surface border-4 border-on-background p-12 text-center">
            <p className="font-label-bold uppercase tracking-wide text-on-surface-variant">No volunteers match the filters.</p>
          </div>
        )}
      </div>

      {showInvite && (
        <InviteModal eventId={eventId} onClose={() => setShowInvite(false)} onAdded={(v) => { setVolunteers((p) => [...p, v]); setShowInvite(false); }} />
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className={`${color} border-4 border-on-background p-3 neo-shadow-sm`}>
    <p className="text-3xl font-extrabold leading-none">{value}</p>
    <p className="text-[10px] font-label-bold uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const VolunteerRow: React.FC<{ v: Volunteer; onRemove: (id: string) => void; onStatus: (id: string, s: VolunteerStatus) => void }> = ({ v, onRemove, onStatus }) => {
  const meta = STATUS_META[v.status];
  const StatusIcon = meta.icon;
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-4 hover:bg-surface-variant transition-colors">
      <img src={v.avatarUrl || `https://i.pravatar.cc/100?u=${v.id}`} alt={v.name} className="w-12 h-12 border-4 border-on-background object-cover bg-surface-variant" />
      <div className="flex-1 min-w-[200px]">
        <p className="font-extrabold uppercase">{v.name}</p>
        <div className="flex flex-wrap gap-3 text-xs font-label-bold text-on-surface-variant mt-1">
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {v.email}</span>
          {v.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {v.phone}</span>}
          {v.shift && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {v.shift.start}–{v.shift.end}</span>}
        </div>
      </div>

      <span className={`${meta.color} border-2 border-on-background px-3 py-1 text-xs font-extrabold uppercase flex items-center gap-1`}>
        <StatusIcon className="w-3 h-3 stroke-[3]" /> {meta.label}
      </span>

      <div className="flex gap-1">
        {v.status !== 'accepted' && (
          <button title="Mark Accepted" onClick={() => onStatus(v.id, 'accepted')} className="border-2 border-on-background bg-primary-container p-2 hover-lift press-down"><Check className="w-4 h-4 stroke-[3]" /></button>
        )}
        {v.status !== 'checked-in' && v.status === 'accepted' && (
          <button title="Check In" onClick={() => onStatus(v.id, 'checked-in')} className="border-2 border-on-background bg-primary-fixed p-2 hover-lift press-down"><ShieldCheck className="w-4 h-4 stroke-[3]" /></button>
        )}
        <button title="Copy Email" onClick={() => navigator.clipboard.writeText(v.email)} className="border-2 border-on-background bg-surface p-2 hover-lift press-down"><Copy className="w-4 h-4 stroke-[3]" /></button>
        <button title="Remove" onClick={() => onRemove(v.id)} className="border-2 border-on-background bg-error-container p-2 hover-lift press-down"><Trash2 className="w-4 h-4 stroke-[3]" /></button>
      </div>
    </div>
  );
};

const InviteModal: React.FC<{ eventId: string; onClose: () => void; onAdded: (v: Volunteer) => void }> = ({ eventId, onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<VolunteerRole>('registration-desk');
  const [shiftStart, setShiftStart] = useState('16:00');
  const [shiftEnd, setShiftEnd] = useState('20:00');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const v = await organizerApi.inviteVolunteer(eventId, {
        name, email, phone, role,
        shift: { start: shiftStart, end: shiftEnd },
        avatarUrl: `https://i.pravatar.cc/100?u=${email}`,
      });
      onAdded(v);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface border-4 border-on-background w-full max-w-lg relative z-10 neo-shadow">
        <div className="flex justify-between items-center p-5 border-b-4 border-on-background bg-tertiary-fixed">
          <h3 className="font-extrabold uppercase text-xl flex items-center gap-2"><UserPlus className="w-5 h-5 stroke-[3]" /> Invite Volunteer</h3>
          <button onClick={onClose} className="border-2 border-on-background p-1 hover-lift press-down"><X className="w-4 h-4 stroke-[3]" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <Field label="Full Name *"><input value={name} onChange={(e) => setName(e.target.value)} required className="modal-input" /></Field>
          <Field label="Email *"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="modal-input" /></Field>
          <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="modal-input" /></Field>
          <Field label="Role *">
            <select value={role} onChange={(e) => setRole(e.target.value as VolunteerRole)} className="modal-input">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shift Start"><input type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="modal-input" /></Field>
            <Field label="Shift End"><input type="time" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="modal-input" /></Field>
          </div>
          <button disabled={busy} className="w-full border-4 border-on-background bg-primary-fixed text-on-primary-fixed py-3 font-extrabold uppercase neo-shadow-sm hover-lift press-down disabled:opacity-50 flex items-center justify-center gap-2">
            <Send className="w-4 h-4 stroke-[3]" /> {busy ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
        <style>{`.modal-input { width: 100%; background: white; border: 4px solid #1b1b1b; padding: 8px 12px; font-weight: 700; font-size: 14px; text-transform: uppercase; outline: none; } .modal-input:focus { box-shadow: 4px 4px 0 0 #1b1b1b; }`}</style>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">{label}</label>
    {children}
  </div>
);

export default VolunteerAssignView;