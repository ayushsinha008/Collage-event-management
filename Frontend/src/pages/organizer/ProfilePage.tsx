import React, { useState } from 'react';
import { useOrganizerContext } from '../../context/OrganizerContext';
import { Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { organizer, refreshProfile } = useOrganizerContext();
  const [form, setForm] = useState({
    name: organizer?.name ?? '',
    organization: organizer?.organization ?? '',
    email: organizer?.email ?? '',
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/organizer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('organizer_token')}`,
        },
        body: JSON.stringify(form),
      });
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="border-l-8 border-primary pl-6 py-2">
        <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>Profile</h1>
        <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">Update your organizer details.</p>
      </div>

      <form onSubmit={save} className="bg-surface border-4 border-on-background p-8 neo-shadow space-y-6">
        <div>
          <label className="block text-sm font-extrabold uppercase tracking-widest mb-2">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm uppercase focus:outline-none focus:neo-shadow-sm transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-extrabold uppercase tracking-widest mb-2">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm uppercase focus:outline-none focus:neo-shadow-sm transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-extrabold uppercase tracking-widest mb-2">Organization</label>
          <input
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm uppercase focus:outline-none focus:neo-shadow-sm transition-shadow"
          />
        </div>

        <button
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary-fixed hover:bg-primary-container text-on-primary-fixed font-extrabold text-lg py-4 border-4 border-on-background neo-shadow-sm hover-lift uppercase transition-all disabled:opacity-50 mt-4"
        >
          <Save className="w-5 h-5 stroke-[3]" /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>
    </div>
  );
};