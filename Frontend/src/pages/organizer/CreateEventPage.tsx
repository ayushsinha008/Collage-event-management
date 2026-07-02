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

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
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
    imageUrl: PRESET_IMAGES[0],
    status: 'draft',
  });

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]: v }));

  const canStep1 = form.title.trim() && form.description.trim() && form.category;
  const canStep2 = form.date.trim() && form.time.trim() && form.location.trim();
  const canStep3 = form.capacity > 0 && form.organizer.trim();

  const submit = async (mode: PublishMode) => {
    setBusy(true);
    try {
      const created = await organizerApi.createEvent({ ...form, status: mode });
      navigate(`/organizer/events/${(created as Event).id ?? '1'}`);
    } catch {
      navigate(`/organizer/events/1`);
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
              <p className="text-xs font-label-bold text-on-surface-variant mt-1 uppercase">
                {form.description.length} chars · Aim for 120–280
              </p>
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
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  placeholder="e.g. OCT 30 or 2026-10-30"
                  className="w-full bg-background border-4 border-on-background px-4 py-3 font-label-bold uppercase focus:outline-none focus:neo-shadow-sm"
                />
              </FieldRow>
              <FieldRow label="Time *" icon={Calendar}>
                <input
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
              <FieldRow label="Organizer / Club *" icon={Users}>
                <input
                  value={form.organizer}
                  onChange={(e) => set('organizer', e.target.value)}
                  placeholder="e.g. Music Club"
                  className="w-full bg-background border-4 border-on-background px-4 py-3 font-label-bold uppercase focus:outline-none focus:neo-shadow-sm"
                />
              </FieldRow>
            </div>

            <FieldRow label="Cover Image" icon={ImageIcon}>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                {PRESET_IMAGES.map((url) => (
                  <button
                    key={url}
                    onClick={() => set('imageUrl', url)}
                    className={`relative h-20 border-4 border-on-background overflow-hidden ${
                      form.imageUrl === url ? 'ring-4 ring-tertiary-fixed' : ''
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 border-4 border-on-background bg-background px-3 py-2">
                <Upload className="w-5 h-5 stroke-[2.5]" />
                <input
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="...or paste an image URL"
                  className="flex-1 bg-transparent focus:outline-none text-sm font-label-bold"
                />
              </div>
            </FieldRow>

            <div className="border-t-4 border-on-background pt-6">
              <p className="font-label-bold uppercase text-xs tracking-widest mb-3">Live Preview</p>
              <div className="bg-surface border-4 border-on-background overflow-hidden">
                <div className="relative h-44 border-b-4 border-on-background">
                  <img src={form.imageUrl ?? PRESET_IMAGES[0]} alt="" className="w-full h-full object-cover" />
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
              disabled={busy || !canStep3}
              className="border-4 border-on-background bg-surface-variant px-5 py-3 font-label-bold uppercase hover-lift press-down disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[3]" /> Save Draft
            </button>
            <button
              onClick={() => submit('published')}
              disabled={busy || !canStep3}
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