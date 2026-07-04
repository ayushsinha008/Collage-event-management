import React, { useState, useRef } from 'react';
import { useOrganizerContext } from '../../context/OrganizerContext';
import { organizerApi } from '../../services/organizerApi';
import { Save } from 'lucide-react';
import { UserAvatar } from '../../components/common/UserAvatar';

export const ProfilePage: React.FC = () => {
  const { organizer, refreshProfile } = useOrganizerContext();
  const [form, setForm] = useState({
    name: organizer?.name ?? '',
    organization: organizer?.organization ?? '',
    email: organizer?.email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 256;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = reject;
      img.src = objectUrl;
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File must be less than 8 MB');
      return;
    }
    setUploadError('');
    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      await organizerApi.updateProfile({ ...form, avatarBase64: compressed });
      await refreshProfile();
    } catch (err: any) {
      console.error('Organizer PFP compression/upload error:', err);
      setUploadError('Upload failed — please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await organizerApi.updateProfile(form);
      await refreshProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save profile');
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
        {/* Avatar Upload Section */}
        <div className="flex items-center gap-6 pb-6 border-b-2 border-on-background/10">
          <div className="relative group shrink-0">
            <UserAvatar
              name={organizer?.name || 'Organizer'}
              src={organizer?.avatarUrl}
              size="md"
              variant="organizer"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center border-4 border-on-background">
                <span className="material-symbols-outlined text-white animate-spin">hourglass_empty</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-extrabold uppercase tracking-widest">Profile Picture</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-[#ffe24c] hover:bg-yellow-400 text-on-background font-label-bold px-4 py-2 border-2 border-on-background text-xs uppercase neo-shadow-sm hover-lift cursor-pointer disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Choose Photo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            {uploadError && (
              <p className="text-xs text-error font-semibold uppercase">{uploadError}</p>
            )}
          </div>
        </div>

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

        {error && (
          <p className="text-sm font-label-bold text-error uppercase">{error}</p>
        )}

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