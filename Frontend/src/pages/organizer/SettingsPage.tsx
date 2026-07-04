import React, { useEffect, useState } from 'react';
import { Save, Bell, Lock, User, Check } from 'lucide-react';
import { organizerApi } from '../../services/organizerApi';
import { OrganizerSettings } from '../../types/organizer';
import { applyTheme, applyDensity } from '../../utils/theme';

type Tab = 'account' | 'notifications' | 'privacy';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'account',      label: 'Account',      icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy',      label: 'Privacy',      icon: Lock },
];

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('account');
  const [settings, setSettings] = useState<OrganizerSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await organizerApi.getOrganizerSettings();
        const fallbackSettings: OrganizerSettings = {
          account: {
            name: data?.account?.name || '',
            email: data?.account?.email || '',
            organization: data?.account?.organization || 'Campus Events',
            bio: data?.account?.bio || '',
            website: data?.account?.website || '',
            phone: data?.account?.phone || '',
          },
          notifications: {
            newRegistration: data?.notifications?.newRegistration ?? true,
            eventReminders: data?.notifications?.eventReminders ?? true,
            weeklyDigest: data?.notifications?.weeklyDigest ?? true,
            marketingEmails: data?.notifications?.marketingEmails ?? false,
            pushBrowser: data?.notifications?.pushBrowser ?? true,
            smsNotifications: data?.notifications?.smsNotifications ?? false,
          },
          appearance: {
            theme: data?.appearance?.theme || 'light',
            accent: data?.appearance?.accent || 'green',
            density: data?.appearance?.density || 'comfortable',
            reducedMotion: data?.appearance?.reducedMotion ?? false,
          },
          privacy: {
            profileVisible: data?.privacy?.profileVisible ?? true,
            showEventStats: data?.privacy?.showEventStats ?? true,
            allowDirectMessages: data?.privacy?.allowDirectMessages ?? true,
          }
        };
        setSettings(fallbackSettings);
        applyTheme(fallbackSettings.appearance.theme);
        applyDensity(fallbackSettings.appearance.density);
      } catch (err) {
        console.error('Failed to load settings:', err);
        // Fallback to local default settings if API fails
        const localDefault: OrganizerSettings = {
          account: { name: 'FestFlow Organizer', email: 'organizer@univ.edu', organization: 'Campus Events' },
          notifications: { newRegistration: true, eventReminders: true, weeklyDigest: true, marketingEmails: false, pushBrowser: true, smsNotifications: false },
          appearance: { theme: 'light', accent: 'green', density: 'comfortable', reducedMotion: false },
          privacy: { profileVisible: true, showEventStats: true, allowDirectMessages: true }
        };
        setSettings(localDefault);
      }
    })();
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await organizerApi.updateOrganizerSettings(settings);
      applyTheme(settings.appearance.theme);
      applyDensity(settings.appearance.density);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
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