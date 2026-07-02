import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, MapPin, Users, Edit, Trash2, Share2, BarChart3, Megaphone, Settings as SettingsIcon, ClipboardList, HeartHandshake } from 'lucide-react';
import { Event } from '../../types/event';
import { organizerApi } from '../../services/organizerApi';
import { EventStatusBadge } from '../../components/organizer/events/EventStatusBadge';
import { RegistrationTable } from '../../components/organizer/registrations/RegistrationTable';
import VolunteerAssignView from '../../components/organizer/manage/VolunteerAssignView';
import { LiveAttendanceChart } from '../../components/organizer/analytics/LiveAttendanceChart';
import { LiveAttendanceData, Announcement, EventSettings } from '../../types/organizer';

type Tab = 'overview' | 'registrations' | 'volunteers' | 'announcements' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview',      label: 'Overview',      icon: BarChart3 },
  { id: 'registrations', label: 'Registrations', icon: ClipboardList },
  { id: 'volunteers',    label: 'Volunteers',    icon: HeartHandshake },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'settings',      label: 'Settings',      icon: SettingsIcon },
];

// Helper: ensure imageUrl is a string (TS narrowing)
const safeImg = (e: Event) => e.imageUrl || `https://picsum.photos/seed/${e.id}/800/300`;

export const ManageEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs: Tab[] = ['overview', 'registrations', 'volunteers', 'announcements', 'settings'];
  const tabFromUrl = searchParams.get('tab') as Tab | null;
  const [tab, setTabState] = useState<Tab>(tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'overview');

  const setTab = (t: Tab) => {
    setTabState(t);
    setSearchParams(t === 'overview' ? {} : { tab: t });
  };
  const [event, setEvent] = useState<Event | null>(null);
  const [live, setLive] = useState<LiveAttendanceData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [ev, la, ann, set] = await Promise.all([
        organizerApi.getEventById(id),
        organizerApi.getLiveAttendance(id),
        organizerApi.getAnnouncements(),
        organizerApi.getEventSettings(id),
      ]);
      setEvent(ev);
      setLive(la);
      setAnnouncements(ann.filter((a: Announcement) => a.eventId === id));
      setSettings(set);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !event) {
    return <div className="py-20 text-center font-label-bold uppercase tracking-widest">Loading event…</div>;
  }

  const fillPct = Math.min(100, ((event.registrationsCount ?? 0) / event.capacity) * 100);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/organizer/events')} className="flex items-center gap-2 font-label-bold uppercase text-sm hover:underline">
        <ArrowLeft className="w-4 h-4 stroke-[3]" /> All Events
      </button>

      <div className="bg-surface border-4 border-on-background neo-shadow overflow-hidden">
        <div className="relative h-48 md:h-64 border-b-4 border-on-background">
          <img src={safeImg(event)} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <EventStatusBadge status={event.status} />
            <span className="bg-tertiary-fixed border-2 border-on-background px-2 py-1 text-xs font-extrabold uppercase">{event.category}</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-on-primary">
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight" style={{ textShadow: '2px 2px 0 #000' }}>
              {event.title}
            </h1>
            <p className="font-label-bold uppercase mt-2 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date} · {event.time}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {event.registrationsCount ?? 0} / {event.capacity}</span>
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-b-4 border-on-background">
          <div className="flex justify-between text-xs font-label-bold uppercase mb-2">
            <span>Registration fill</span>
            <span>{fillPct.toFixed(0)}% FULL</span>
          </div>
          <div className="h-4 bg-surface-variant border-2 border-on-background relative">
            <div className="absolute inset-y-0 left-0 bg-primary-fixed border-r-2 border-on-background transition-all duration-500" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4">
          <button onClick={() => window.open(`/events/${event.id}`, '_blank')} className="flex items-center gap-2 border-2 border-on-background bg-surface px-3 py-2 font-label-bold uppercase text-xs hover-lift press-down">
            <Eye className="w-4 h-4 stroke-[3]" /> Public Page
          </button>
          <button onClick={() => navigate(`/organizer/events?edit=${event.id}`)} className="flex items-center gap-2 border-2 border-on-background bg-surface-variant px-3 py-2 font-label-bold uppercase text-xs hover-lift press-down">
            <Edit className="w-4 h-4 stroke-[3]" /> Edit
          </button>
          <button className="flex items-center gap-2 border-2 border-on-background bg-tertiary-fixed px-3 py-2 font-label-bold uppercase text-xs hover-lift press-down">
            <Share2 className="w-4 h-4 stroke-[3]" /> Share
          </button>
          <button className="ml-auto flex items-center gap-2 border-2 border-on-background bg-error-container text-on-error-container px-3 py-2 font-label-bold uppercase text-xs hover-lift press-down">
            <Trash2 className="w-4 h-4 stroke-[3]" /> Delete
          </button>
        </div>
      </div>

      <div className="bg-surface border-4 border-on-background overflow-x-auto">
        <div className="flex">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-4 font-label-bold uppercase text-sm border-b-4 transition-all ${
                tab === tid
                  ? 'bg-tertiary-fixed text-on-background border-on-background -translate-y-1'
                  : 'bg-surface text-on-surface-variant border-transparent hover:bg-surface-variant'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[3]" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border-4 border-on-background p-6 neo-shadow">
        {tab === 'overview' && live && (
          <div className="space-y-6">
            <LiveAttendanceChart data={live} eventTitle={event.title} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickStat label="Status" value={event.status ?? 'draft'} />
              <QuickStat label="Created by" value={event.organizer ?? 'You'} />
              <QuickStat label="Last updated" value={new Date(event.updatedAt ?? Date.now()).toLocaleDateString()} />
            </div>
          </div>
        )}

        {tab === 'registrations' && <RegistrationTableLazy eventId={event.id} />}

        {tab === 'volunteers' && <VolunteerAssignView eventId={event.id} />}

        {tab === 'announcements' && (
          <AnnouncementsTab eventId={event.id} announcements={announcements} setAnnouncements={setAnnouncements} />
        )}

        {tab === 'settings' && settings && (
          <EventSettingsTab settings={settings} setSettings={setSettings} />
        )}
      </div>
    </div>
  );
};

const RegistrationTableLazy: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [regs, setRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await organizerApi.getRegistrations({ eventId });
      setRegs(r);
      setLoading(false);
    })();
  }, [eventId]);
  if (loading) return <div className="py-10 text-center font-label-bold uppercase">Loading…</div>;
  return <RegistrationTable registrations={regs} loading={false} onCheckIn={async () => {}} />;
};

const QuickStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border-4 border-on-background bg-background p-4">
    <p className="text-[10px] font-label-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
    <p className="text-lg font-extrabold uppercase mt-1">{value}</p>
  </div>
);

const AnnouncementsTab: React.FC<{ eventId: string; announcements: Announcement[]; setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>> }> = ({ eventId, announcements, setAnnouncements }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = await organizerApi.createAnnouncement({
      title, message, audience: 'event-attendees', eventId, eventTitle: '', createdBy: 'me',
    } as any);
    setAnnouncements((p) => [a, ...p]);
    setTitle(''); setMessage('');
  };

  const send = async (id: string) => {
    await organizerApi.sendAnnouncement(id);
    setAnnouncements((p) => p.map((a) => a.id === id ? { ...a, status: 'sent', sentAt: new Date().toISOString() } : a));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="bg-surface-variant border-4 border-on-background p-4 space-y-3">
        <h4 className="font-extrabold uppercase flex items-center gap-2"><Megaphone className="w-4 h-4 stroke-[3]" /> New Announcement</h4>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" className="w-full border-4 border-on-background bg-background px-3 py-2 font-label-bold uppercase text-sm focus:outline-none" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Message…" rows={3} className="w-full border-4 border-on-background bg-background px-3 py-2 text-sm resize-none focus:outline-none" />
        <button className="border-4 border-on-background bg-tertiary-fixed px-4 py-2 font-label-bold uppercase neo-shadow-sm hover-lift press-down">Save Draft</button>
      </form>

      <div className="space-y-3">
        {announcements.length === 0 && <div className="text-center py-8 font-label-bold uppercase text-on-surface-variant">No announcements yet.</div>}
        {announcements.map((a: Announcement) => (
          <div key={a.id} className="bg-surface border-4 border-on-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h5 className="font-extrabold uppercase">{a.title}</h5>
                <p className="text-sm text-on-surface-variant mt-1">{a.message}</p>
              </div>
              <span className={`border-2 border-on-background px-2 py-0.5 text-[10px] font-extrabold uppercase ${a.status === 'sent' ? 'bg-primary-fixed' : 'bg-surface-variant'}`}>{a.status}</span>
            </div>
            <div className="mt-3 flex gap-2">
              {a.status !== 'sent' && <button onClick={() => send(a.id)} className="border-2 border-on-background bg-primary-fixed px-3 py-1.5 text-xs font-label-bold uppercase hover-lift press-down">Send Now</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventSettingsTab: React.FC<{ settings: EventSettings; setSettings: React.Dispatch<React.SetStateAction<EventSettings | null>> }> = ({ settings, setSettings }) => {
  const [saving, setSaving] = useState(false);
  const toggle = (k: keyof EventSettings) => setSettings((p) => p ? { ...p, [k]: !(p as any)[k] } : p);

  const save = async () => {
    setSaving(true);
    await organizerApi.updateEventSettings(settings.eventId, settings);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Toggle label="Registration Open"     value={settings.registrationOpen}   onChange={() => toggle('registrationOpen')} />
        <Toggle label="Waitlist Enabled"      value={settings.waitlistEnabled}    onChange={() => toggle('waitlistEnabled')} />
        <Toggle label="Require Approval"      value={settings.requireApproval}    onChange={() => toggle('requireApproval')} />
        <Toggle label="Send Confirmation Email" value={settings.sendConfirmationEmail} onChange={() => toggle('sendConfirmationEmail')} />
        <Toggle label="Collect Phone"         value={settings.collectPhone}       onChange={() => toggle('collectPhone')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">Reminder (hours before)</label>
          <input type="number" value={settings.sendReminderHoursBefore} onChange={(e) => setSettings((p) => p ? { ...p, sendReminderHoursBefore: Number(e.target.value) } : p)} className="w-full border-4 border-on-background bg-background px-3 py-2 font-label-bold uppercase" />
        </div>
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">Check-in Window (minutes)</label>
          <input type="number" value={settings.allowCheckInWindow} onChange={(e) => setSettings((p) => p ? { ...p, allowCheckInWindow: Number(e.target.value) } : p)} className="w-full border-4 border-on-background bg-background px-3 py-2 font-label-bold uppercase" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">Cancellation Policy</label>
        <textarea value={settings.cancellationPolicy ?? ''} onChange={(e) => setSettings((p) => p ? { ...p, cancellationPolicy: e.target.value } : p)} rows={2} className="w-full border-4 border-on-background bg-background px-3 py-2 text-sm resize-none" />
      </div>
      <div>
        <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">Refund Policy</label>
        <textarea value={settings.refundPolicy ?? ''} onChange={(e) => setSettings((p) => p ? { ...p, refundPolicy: e.target.value } : p)} rows={2} className="w-full border-4 border-on-background bg-background px-3 py-2 text-sm resize-none" />
      </div>

      <button onClick={save} disabled={saving} className="border-4 border-on-background bg-primary-fixed text-on-primary-fixed px-6 py-3 font-extrabold uppercase neo-shadow-sm hover-lift press-down disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Event Settings'}
      </button>
    </div>
  );
};

const Toggle: React.FC<{ label: string; value: boolean; onChange: () => void }> = ({ label, value, onChange }) => (
  <button onClick={onChange} className="flex items-center justify-between gap-4 border-4 border-on-background bg-background px-4 py-3 text-left hover-lift press-down">
    <span className="font-extrabold uppercase text-sm">{label}</span>
    <span className={`relative w-14 h-7 border-2 border-on-background ${value ? 'bg-primary-fixed' : 'bg-surface-variant'}`}>
      <span className={`absolute top-0.5 ${value ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-on-background transition-all`} />
    </span>
  </button>
);

export default ManageEventPage;