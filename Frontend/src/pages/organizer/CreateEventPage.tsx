import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Upload, Save, Send, Calendar, MapPin, Users, Tag, FileText, Sparkles } from 'lucide-react';
import { Event } from '../../types/event';
import { organizerApi } from '../../services/organizerApi';

const CATEGORIES: { value: Event['category']; label: string; color: string }[] = [
  { value: 'TECHNICAL', label: 'Technical', color: 'bg-primary-fixed' },
  { value: 'CULTURAL',  label: 'Cultural',  color: 'bg-secondary-fixed' },
  { value: 'SPORTS',    label: 'Sports',    color: 'bg-tertiary-fixed' },
  { value: 'WORKSHOP',  label: 'Workshop',  color: 'bg-primary-container' },
  { value: 'SEMINAR',   label: 'Seminar',   color: 'bg-secondary-container' },
  { value: 'academic',  label: 'Academic',  color: 'bg-tertiary-container' },
  { value: 'other',     label: 'Other',     color: 'bg-surface-variant' },
];

type PublishMode = 'draft' | 'published';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    capacity: 100,
    category: 'TECHNICAL',
    imageUrl: '',
    status: 'draft',
  });

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]: v }));

  const canStep1 = form.title.trim() && form.description.trim().length >= 10 && form.category;
  const canStep2 = form.date.trim() && form.time.trim() && form.location.trim();
  const canStep3 = form.capacity > 0;

  // Compress + resize image to max 800px wide for event banners (keeps under Vercel 4.5MB limit)
  const compressEventImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const MAX_W = 800;
        const scale = Math.min(MAX_W / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.80));
      };
      img.onerror = reject;
      img.src = objectUrl;
    });

  const submit = async (mode: PublishMode) => {
    if (!canStep1) return alert('Please complete Step 1 (Basics). Description must be at least 10 chars.');
    if (!canStep2) return alert('Please complete Step 2 (When & Where). Ensure Date, Time, and Location are filled.');
    if (!canStep3) return alert('Please complete Step 3 (Capacity & Cover). Capacity must be > 0.');

    setBusy(true);
    try {
      // Ensure date is a valid ISO string
      const parsedDate = new Date(form.date);
      if (isNaN(parsedDate.getTime())) {
        alert('Invalid date. Please select a valid date.');
        setBusy(false);
        return;
      }
      const isoDate = parsedDate.toISOString();

      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        venue: form.location.trim(),
        date: isoDate,
        startTime: form.time,
        endTime: '23:59',
        capacity: Number(form.capacity),
        status: mode === 'draft' ? 'Draft' : 'Upcoming',
      };

      // Only include bannerImage if one was selected
      if (form.imageUrl) payload.bannerImage = form.imageUrl;

      await organizerApi.createEvent(payload);
      navigate('/organizer/events');
    } catch (err: any) {
      console.error('Create Event Error:', err.response?.data || err);
      const data = err.response?.data;
      let errMsg = data?.message || 'Request failed. Check your network.';

      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errMsg += '\n\nValidation Details:\n' + data.errors.join('\n');
      }

      alert(`Failed to create event:\n${errMsg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/organizer/events')} className="border-4 border-on-background bg-surface p-2 hover-lift press-down">
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </button>
        <div className="flex-1 border-l-8 border-primary pl-6 py-2">
          <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
            Create Event
          </h1>
          <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">
            Step {step} of 3 · {step === 1 ? 'The Basics' : step === 2 ? 'When & Where' : 'Capacity & Cover'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-4 border-on-background bg-surface p-2">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => setStep(n as 1 | 2 | 3)}
            className={`flex-1 py-3 font-label-bold uppercase text-sm border-2 transition-all ${
              step === n
                ? 'bg-tertiary-fixed text-on-background border-on-background neo-shadow-sm'
                : n < step
                  ? 'bg-primary-fixed border-on-background'
                  : 'bg-surface border-transparent text-on-surface-variant'
            }`}
          >
            {n === 1 ? 'Basics' : n === 2 ? 'When & Where' : 'Capacity'}
          </button>
        ))}
      </div>

      <div className="bg-surface border-4 border-on-background p-8 neo-shadow space-y-6">
        {step === 1 && (
          <>
            <FieldRow label="Event Title *" icon={Sparkles}>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. NEON PULSE MUSIC FESTIVAL"
                className="w-full bg-background border-4 border-on-background px-4 py-3 font-extrabold text-lg uppercase focus:outline-none focus:neo-shadow-sm"
              />
            </FieldRow>

            <FieldRow label="Description *" icon={FileText}>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What's the event about? Make it punchy."
                rows={4}
                className="w-full bg-background border-4 border-on-background px-4 py-3 text-sm resize-none focus:outline-none focus:neo-shadow-sm"
              />
              <div className="flex justify-between items-center mt-1">
                <p className={`text-xs font-label-bold uppercase ${
                  form.description.length > 0 && form.description.length < 10 
                    ? 'text-error font-extrabold' 
                    : 'text-on-surface-variant'
                }`}>
                  {form.description.length > 0 && form.description.length < 10 
                    ? `Too short! Minimum 10 chars (${10 - form.description.length} more needed)`
                    : `${form.description.length} chars · Aim for 120–280`
                  }
                </p>
              </div>
            </FieldRow>

            <FieldRow label="Category *" icon={Tag}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => set('category', c.value)}
                    className={`border-4 border-on-background py-3 px-3 font-label-bold uppercase text-sm transition-all ${
                      form.category === c.value
                        ? `${c.color} neo-shadow-sm -translate-y-0.5`
                        : 'bg-surface hover:bg-surface-variant'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </FieldRow>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldRow label="Date *" icon={Calendar}>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  placeholder="e.g. OCT 30 or 2026-10-30"
                  className="w-full bg-background border-4 border-on-background px-4 py-3 font-label-bold uppercase focus:outline-none focus:neo-shadow-sm"
                />
              </FieldRow>
              <FieldRow label="Time *" icon={Calendar}>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  placeholder="e.g. 06:00 PM"
                  className="w-full bg-background border-4 border-on-background px-4 py-3 font-label-bold uppercase focus:outline-none focus:neo-shadow-sm"
                />
              </FieldRow>
            </div>
            <FieldRow label="Location *" icon={MapPin}>
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Main Auditorium, Block C"
                className="w-full bg-background border-4 border-on-background px-4 py-3 font-label-bold uppercase focus:outline-none focus:neo-shadow-sm"
              />
            </FieldRow>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldRow label="Capacity *" icon={Users}>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => set('capacity', Number(e.target.value))}
                  className="w-full bg-background border-4 border-on-background px-4 py-3 font-label-bold uppercase focus:outline-none focus:neo-shadow-sm"
                />
              </FieldRow>
              <FieldRow label="Organizer / Club (optional)" icon={Users}>
                <input
                  value={form.organizer}
                  onChange={(e) => set('organizer', e.target.value)}
                  placeholder="e.g. Music Club, Cultural Committee"
                  className="w-full bg-background border-4 border-on-background px-4 py-3 font-label-bold uppercase focus:outline-none focus:neo-shadow-sm"
                />
                <p className="text-[10px] text-on-surface-variant mt-1 font-semibold uppercase tracking-wider">
                  Optional — your organizer profile is auto-linked from your account
                </p>
              </FieldRow>
            </div>

            <FieldRow label="Cover Image (Optional)" icon={ImageIcon}>
              <div className="mb-3">
                <label className="flex items-center gap-3 border-4 border-on-background bg-background px-4 py-3 cursor-pointer hover:bg-surface-variant transition-colors">
                  <Upload className="w-5 h-5 stroke-[2.5]" />
                  <span className="font-label-bold uppercase text-sm">Upload image (saved to Cloudinary)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                  onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Image must be under 10MB');
                        return;
                      }
                      try {
                        const compressed = await compressEventImage(file);
                        set('imageUrl', compressed);
                      } catch {
                        // fallback: read directly
                        const reader = new FileReader();
                        reader.onloadend = () => set('imageUrl', reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              {form.imageUrl && (
                <div className="relative h-32 border-4 border-on-background overflow-hidden mb-3">
                  <img src={form.imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </FieldRow>

            <div className="border-t-4 border-on-background pt-6">
              <p className="font-label-bold uppercase text-xs tracking-widest mb-3">Live Preview</p>
              <div className="bg-surface border-4 border-on-background overflow-hidden">
                <div className="relative h-44 border-b-4 border-on-background">
                  <img src={form.imageUrl || undefined} alt="" className="w-full h-full object-cover bg-slate-200" />
                  <div className="absolute top-2 left-2 bg-tertiary-fixed border-2 border-on-background px-2 py-1 font-extrabold text-xs uppercase">
                    {form.category}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-xl font-extrabold uppercase">{form.title || 'Your event title'}</h3>
                  <p className="text-sm text-on-surface-variant line-clamp-2">{form.description || 'Description preview...'}</p>
                  <div className="flex gap-2 text-xs font-label-bold uppercase">
                    <span className="bg-surface-variant border-2 border-on-background px-2 py-1">{form.date || 'DATE'}</span>
                    <span className="bg-surface-variant border-2 border-on-background px-2 py-1">{form.time || 'TIME'}</span>
                    <span className="bg-surface-variant border-2 border-on-background px-2 py-1">{form.location || 'VENUE'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-4 border-on-background bg-surface p-4">
        <button
          onClick={() => (step === 1 ? navigate('/organizer/events') : setStep((step - 1) as 1 | 2 | 3))}
          className="border-4 border-on-background bg-surface px-5 py-3 font-label-bold uppercase hover-lift press-down"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((step + 1) as 1 | 2 | 3)}
            disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2)}
            className="border-4 border-on-background bg-tertiary-fixed px-6 py-3 font-label-bold uppercase neo-shadow-sm hover-lift press-down disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => submit('draft')}
              disabled={busy}
              className="border-4 border-on-background bg-surface-variant px-5 py-3 font-label-bold uppercase hover-lift press-down disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[3]" /> Save Draft
            </button>
            <button
              onClick={() => submit('published')}
              disabled={busy}
              className="border-4 border-on-background bg-primary-fixed text-on-primary-fixed px-6 py-3 font-extrabold uppercase neo-shadow hover-lift press-down disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4 stroke-[3]" /> Publish Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FieldRow: React.FC<{ label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <div>
    <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
      <Icon className="w-4 h-4 stroke-[2.5]" /> {label}
    </label>
    {children}
  </div>
);

export default CreateEventPage;