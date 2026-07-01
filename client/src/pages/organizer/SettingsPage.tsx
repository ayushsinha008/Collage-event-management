import React, { useEffect, useState } from 'react';
import { Save, Bell, Palette, Lock, User, Check } from 'lucide-react';
import { organizerApi } from '../../services/organizerApi';
import { OrganizerSettings } from '../../types/organizer';

type Tab = 'account' | 'notifications' | 'appearance' | 'privacy';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'account',      label: 'Account',      icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance',   label: 'Appearance',   icon: Palette },
  { id: 'privacy',      label: 'Privacy',      icon: Lock },
];

const ACCENTS = [
  { id: 'green',  label: 'Green',  swatch: '#1b6b4f' },
  { id: 'yellow', label: 'Yellow', swatch: '#ffe24c' },
  { id: 'purple', label: 'Purple', swatch: '#5f5a7c' },
  { id: 'pink',   label: 'Pink',   swatch: '#ba1a1a' },
  { id: 'blue',   label: 'Blue',   swatch: '#1f3a93' },
] as const;

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('account');
  const [settings, setSettings] = useState<OrganizerSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    (async () => setSettings(await organizerApi.getOrganizerSettings()))();
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await organizerApi.updateOrganizerSettings(settings);
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  if (!settings) return <div className="py-16 text-center font-label-bold uppercase">Loading settings…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-l-8 border-primary pl-6 py-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>Settings</h1>
          <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">Manage your organizer preferences.</p>
        </div>
        <button onClick={save} disabled={saving} className={`flex items-center gap-2 border-4 border-on-background px-5 py-3 font-extrabold uppercase neo-shadow-sm hover-lift press-down transition-colors disabled:opacity-50 ${savedFlash ? 'bg-primary-fixed' : 'bg-tertiary-fixed'}`}>
          {savedFlash ? <Check className="w-5 h-5 stroke-[3]" /> : <Save className="w-5 h-5 stroke-[3]" />}
          {savedFlash ? 'SAVED!' : saving ? 'SAVING…' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Side nav */}
        <aside className="border-4 border-on-background bg-surface p-3 space-y-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-on-background font-label-bold uppercase text-sm transition-all ${
                tab === id ? 'bg-tertiary-fixed neo-shadow-sm -translate-y-0.5' : 'bg-surface hover:bg-surface-variant'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[3]" /> {label}
            </button>
          ))}
        </aside>

        {/* Panel */}
        <div className="lg:col-span-3 border-4 border-on-background bg-surface p-6 neo-shadow space-y-6">
          {tab === 'account' && (
            <div className="space-y-4">
              <SectionHeader title="Account Information" sub="How you appear on FestFlow." />
              <Grid>
                <Input label="Full Name" value={settings.account.name} onChange={(v) => setSettings({ ...settings, account: { ...settings.account, name: v } })} />
                <Input label="Email" type="email" value={settings.account.email} onChange={(v) => setSettings({ ...settings, account: { ...settings.account, email: v } })} />
                <Input label="Organization" value={settings.account.organization} onChange={(v) => setSettings({ ...settings, account: { ...settings.account, organization: v } })} />
                <Input label="Phone" value={settings.account.phone ?? ''} onChange={(v) => setSettings({ ...settings, account: { ...settings.account, phone: v } })} />
                <Input label="Website" value={settings.account.website ?? ''} onChange={(v) => setSettings({ ...settings, account: { ...settings.account, website: v } })} />
              </Grid>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">Bio</label>
                <textarea rows={3} value={settings.account.bio ?? ''} onChange={(e) => setSettings({ ...settings, account: { ...settings.account, bio: e.target.value } })} className="w-full border-4 border-on-background bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:neo-shadow-sm" />
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4">
              <SectionHeader title="Notifications" sub="Choose what gets through to you." />
              <ToggleRow label="New Registration"  desc="Get notified when someone signs up for your event." value={settings.notifications.newRegistration} onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, newRegistration: v } })} />
              <ToggleRow label="Event Reminders"   desc="Reminders X hours before your event starts." value={settings.notifications.eventReminders} onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, eventReminders: v } })} />
              <ToggleRow label="Weekly Digest"     desc="A Monday email with your last week's stats." value={settings.notifications.weeklyDigest} onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, weeklyDigest: v } })} />
              <ToggleRow label="Marketing Emails"  desc="Product updates and tips from FestFlow." value={settings.notifications.marketingEmails} onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, marketingEmails: v } })} />
              <ToggleRow label="Browser Push"      desc="Real-time alerts in your browser tab." value={settings.notifications.pushBrowser} onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, pushBrowser: v } })} />
              <ToggleRow label="SMS Notifications" desc="Critical alerts sent to your phone." value={settings.notifications.smsNotifications} onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, smsNotifications: v } })} />
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-6">
              <SectionHeader title="Appearance" sub="Make FestFlow feel like yours." />

              <div>
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button key={t} onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, theme: t } })} className={`border-4 border-on-background py-4 font-extrabold uppercase transition-all ${settings.appearance.theme === t ? `${t === 'dark' ? 'bg-on-background text-on-primary' : 'bg-tertiary-fixed'} neo-shadow-sm -translate-y-0.5` : 'bg-surface'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Accent Color</Label>
                <div className="flex gap-3 flex-wrap">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, accent: a.id } })}
                      className={`flex items-center gap-2 border-4 border-on-background px-3 py-2 font-label-bold uppercase text-xs transition-all ${settings.appearance.accent === a.id ? 'neo-shadow-sm -translate-y-0.5' : ''}`}
                    >
                      <span className="w-5 h-5 border-2 border-on-background" style={{ background: a.swatch }} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Density</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['comfortable', 'compact'] as const).map((d) => (
                    <button key={d} onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, density: d } })} className={`border-4 border-on-background py-4 font-extrabold uppercase transition-all ${settings.appearance.density === d ? 'bg-tertiary-fixed neo-shadow-sm -translate-y-0.5' : 'bg-surface'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <ToggleRow label="Reduce Motion" desc="Disable transitions and parallax effects." value={settings.appearance.reducedMotion} onChange={(v) => setSettings({ ...settings, appearance: { ...settings.appearance, reducedMotion: v } })} />
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <SectionHeader title="Privacy" sub="Control who sees what." />
              <ToggleRow label="Public Profile" desc="Students can find and follow you." value={settings.privacy.profileVisible} onChange={(v) => setSettings({ ...settings, privacy: { ...settings.privacy, profileVisible: v } })} />
              <ToggleRow label="Show Event Stats Publicly" desc="Display registration counts on the public event page." value={settings.privacy.showEventStats} onChange={(v) => setSettings({ ...settings, privacy: { ...settings.privacy, showEventStats: v } })} />
              <ToggleRow label="Allow Direct Messages" desc="Attendees can message you for support." value={settings.privacy.allowDirectMessages} onChange={(v) => setSettings({ ...settings, privacy: { ...settings.privacy, allowDirectMessages: v } })} />

              <div className="border-t-4 border-on-background pt-4">
                <h4 className="font-extrabold uppercase mb-3 text-error">Danger Zone</h4>
                <button className="border-4 border-on-background bg-error-container text-on-error-container px-4 py-2 font-label-bold uppercase hover-lift press-down">Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div className="border-b-4 border-on-background pb-4">
    <h2 className="font-extrabold uppercase text-xl">{title}</h2>
    <p className="text-sm text-on-surface-variant font-label-bold uppercase tracking-wide">{sub}</p>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-2">{children}</label>
);

const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Input: React.FC<{ label: string; value: string; type?: string; onChange: (v: string) => void }> = ({ label, value, type = 'text', onChange }) => (
  <div>
    <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-4 border-on-background bg-background px-3 py-2 font-label-bold uppercase text-sm focus:outline-none focus:neo-shadow-sm" />
  </div>
);

const ToggleRow: React.FC<{ label: string; desc: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, desc, value, onChange }) => (
  <div className="flex items-start justify-between gap-4 border-4 border-on-background bg-background p-4">
    <div className="flex-1">
      <p className="font-extrabold uppercase text-sm">{label}</p>
      <p className="text-xs text-on-surface-variant mt-1">{desc}</p>
    </div>
    <button onClick={() => onChange(!value)} className={`relative w-14 h-7 border-2 border-on-background ${value ? 'bg-primary-fixed' : 'bg-surface-variant'}`}>
      <span className={`absolute top-0.5 ${value ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-on-background transition-all`} />
    </button>
  </div>
);

export default SettingsPage;