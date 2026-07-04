import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  QrCode,
  BarChart3,
  HeartHandshake,
  GraduationCap,
  Megaphone,
  Users,
  ScanLine,
  Star,
} from 'lucide-react';

// Scrolling marquee of live/upcoming events, sits directly under the nav.
const TICKER_ITEMS = [
  'Neon Pulse Music Festival',
  'AI & The Future Of Creativity',
  'Inter-College Slam Dunk',
  'Brutalist UI Lab',
  'Club Night: Retro Rewind',
  'Tech Hackathon 2026',
];

const HERO_DETAILS = [
  { title: 'Instant RSVP', desc: 'Register with a single tap', bg: 'bg-primary-fixed' },
  { title: 'QR Tickets', desc: 'Secure entry codes on your phone', bg: 'bg-tertiary-fixed' },
  { title: 'Live Feed', desc: 'Watch attendee counts update in real-time', bg: 'bg-secondary-fixed' },
  { title: 'Smart Alerts', desc: 'Direct updates to all students', bg: 'bg-error-container' },
];

const FEATURES = [
  {
    icon: Calendar,
    tag: 'Discovery',
    title: 'One Event Hub',
    desc: 'Every club, every event in one searchable calendar. Students stop missing things.',
    bg: 'bg-primary-fixed',
  },
  {
    icon: QrCode,
    tag: 'Ticketing',
    title: 'Instant QR Tickets',
    desc: 'Register in one tap, get a unique QR ticket immediately. No printing needed.',
    bg: 'bg-tertiary-fixed',
  },
  {
    icon: HeartHandshake,
    tag: 'Operations',
    title: 'Volunteer Tools',
    desc: 'Assign roles, track check-ins, keep your crew organized without a group chat.',
    bg: 'bg-error-container',
  },
  {
    icon: BarChart3,
    tag: 'Insights',
    title: 'Live Analytics',
    desc: 'Attendance and check-in rate update in real time as your event runs.',
    bg: 'bg-secondary-fixed',
  },
];

const STEPS = [
  {
    n: '01',
    icon: Zap,
    title: 'Create',
    desc: 'Organizer sets up event with date, capacity, and category in under 3 minutes.',
    bg: 'bg-tertiary-fixed',
  },
  {
    n: '02',
    icon: Users,
    title: 'Discover',
    desc: 'Students browse the unified feed and register with a single tap.',
    bg: 'bg-primary-fixed',
  },
  {
    n: '03',
    icon: QrCode,
    title: 'Ticket',
    desc: 'A unique QR code lands instantly — no email delays, no printing.',
    bg: 'bg-secondary-fixed',
  },
  {
    n: '04',
    icon: ScanLine,
    title: 'Check In',
    desc: 'Volunteer scans at the door. Dashboard updates live. Zero manual counting.',
    bg: 'bg-error-container',
  },
];

const ROLES = [
  {
    icon: GraduationCap,
    title: 'Students',
    desc: 'Discover and attend events across every club without checking ten sources.',
    perks: ['Browse all campus events', 'One-tap RSVP', 'QR ticket in your wallet', 'Live event updates'],
    bg: 'bg-primary-fixed',
    cta: 'Explore Events',
    to: '/',
  },
  {
    icon: Zap,
    title: 'Organizers',
    desc: 'Run events without the spreadsheet chaos — from creation to post-event analytics.',
    perks: ['Create events in 3 minutes', 'Live registration dashboard', 'Broadcast announcements', 'Export attendee lists'],
    bg: 'bg-tertiary-fixed',
    cta: 'Open Dashboard',
    to: '/login',
  },
  {
    icon: HeartHandshake,
    title: 'Volunteers',
    desc: 'Show up knowing exactly what to do — scan tickets and see real-time crowd numbers.',
    perks: ['Mobile QR scanner', 'Instant validation', 'Live attendance count', 'No paper lists needed'],
    bg: 'bg-error-container',
    cta: 'Start Scanning',
    to: '/login',
  },
];

export const LandingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else if (user.role === 'volunteer') {
        navigate('/volunteer');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Marquee keyframes, scoped locally */}
      <style>{`
        @keyframes festflow-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .festflow-ticker-track {
          animation: festflow-ticker 26s linear infinite;
        }
      `}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-3.5 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary-fixed border-4 border-on-background p-1.5 flex">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-headline font-extrabold text-xl uppercase tracking-tight">FestFlow</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-2 bg-surface px-5 py-2.5 font-bold uppercase text-xs border-[3px] border-on-background hover-lift press-down transition-all"
          >
            Organizer
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 bg-on-background text-background px-5 py-2.5 font-bold uppercase text-xs border-4 border-on-background hover-lift press-down transition-all"
          >
            Sign In <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>
      </nav>

      {/* TICKER */}
      <div className="overflow-hidden bg-tertiary-fixed border-b-4 border-on-background py-2.5">
        <div className="flex gap-14 w-max festflow-ticker-track whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="font-bold uppercase tracking-widest text-xs text-on-primary-fixed">
              {i % 2 === 0 ? '★' : '◆'} {item}
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div className="bg-background border-b-4 border-on-background">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 border-[3px] border-on-background px-3 py-1.5 bg-primary-fixed/20 uppercase text-[11px] font-extrabold tracking-widest mb-5">
              <Star className="w-3.5 h-3.5 stroke-[2.5]" /> Built for Indian Campuses
            </span>
            <h1 className="font-headline font-extrabold text-5xl md:text-6xl uppercase leading-[0.92] tracking-tight mb-6">
              Stop managing
              <br />
              events in
              <br />
              <span className="relative inline-block px-1">
                <span className="absolute inset-0 -skew-x-6 bg-error-container border-4 border-on-background -z-10" />
                WhatsApp
              </span>
              <br />
              groups.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-md mb-8 leading-relaxed">
              FestFlow gives every college event a proper home — registration, QR tickets, live
              check-in, and real-time analytics. Zero spreadsheets.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link
                to="/login"
                className="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed px-7 py-3.5 font-extrabold uppercase text-sm border-4 border-on-background neo-shadow hover-lift press-down transition-all"
              >
                Get Started Free <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-5">
              {['No credit card', 'Free for clubs', 'Setup in 2 min'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-primary">
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>

          {/* Stat grid + live event preview */}
          <div className="grid grid-cols-2 gap-3">
            {HERO_DETAILS.map((d) => (
              <div key={d.title} className={`border-4 border-on-background p-5 flex flex-col justify-between min-h-[120px] ${d.bg}`}>
                <div className="font-headline font-extrabold text-2xl uppercase tracking-tight leading-none">{d.title}</div>
                <div className="text-[11px] font-bold text-on-surface-variant leading-snug mt-2">{d.desc}</div>
              </div>
            ))}
            <div className="col-span-2 border-4 border-on-background bg-[#ffe24c] p-4 flex items-center gap-4 neo-shadow-sm">
              <div className="bg-surface border-4 border-on-background p-2.5 flex-shrink-0">
                <Zap className="w-5 h-5 stroke-[2.5] text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-headline font-extrabold uppercase text-sm">Empowering Student Communities</div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant mt-0.5">
                  Built to simplify registrations & club operations.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="bg-primary/5 border-b-4 border-on-background">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-16">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-2.5">What FestFlow does</p>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl uppercase leading-none tracking-tight">
                Everything event day
                <br />
                demands, built in.
              </h2>
            </div>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide border-b-[3px] border-on-background pb-0.5"
            >
              See all features <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, tag, title, desc, bg }, i) => (
              <div
                key={title}
                className={`border-4 border-on-background p-6 flex flex-col gap-3.5 ${bg} ${i > 0 ? 'lg:-ml-1' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="border-4 border-on-background bg-surface p-2 inline-flex">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide border-2 border-on-background px-2 py-1 bg-surface">
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-extrabold uppercase text-base leading-tight mb-2">{title}</h3>
                  <p className="text-[13px] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEPS — a genuine sequence, numbering carries real information here */}
      <div className="bg-background border-b-4 border-on-background">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 border-[3px] border-on-background px-3 py-1.5 uppercase text-[11px] font-extrabold tracking-widest mb-4">
              The flow
            </span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl uppercase leading-none tracking-tight">
              From idea to check-in
              <br />
              in four steps.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ n, icon: Icon, title, desc, bg }, i) => (
              <div
                key={n}
                className={`border-4 border-on-background p-6 flex flex-col gap-3.5 ${bg} ${i > 0 ? 'lg:-ml-1' : ''}`}
              >
                <div className="font-headline font-extrabold text-5xl leading-none opacity-[0.13]">{n}</div>
                <div className="border-4 border-on-background bg-surface p-2 inline-flex w-fit">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-headline font-extrabold uppercase text-base">{title}</h3>
                <p className="text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROLES */}
      <div className="bg-tertiary/5 border-b-4 border-on-background">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 border-[3px] border-on-background px-3 py-1.5 uppercase text-[11px] font-extrabold tracking-widest mb-4">
              Who it's for
            </span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl uppercase leading-none tracking-tight">
              One platform.
              <br />
              Every campus role.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map(({ icon: Icon, title, desc, perks, bg, cta, to }) => (
              <div key={title} className="border-4 border-on-background bg-surface p-7 flex flex-col gap-4">
                <div className={`border-4 border-on-background p-2.5 inline-flex w-fit ${bg}`}>
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-headline font-extrabold uppercase text-xl mb-1.5">{title}</h3>
                  <p className="text-[13px] leading-relaxed text-on-surface-variant">{desc}</p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[13px] font-bold">
                      <span className="text-primary flex-shrink-0">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={to}
                  className={`flex items-center justify-center gap-2 px-5 py-3 font-extrabold uppercase text-xs border-4 border-on-background hover-lift press-down transition-all mt-auto ${bg}`}
                >
                  {cta} <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div className="bg-on-background border-b-4 border-on-background px-6 md:px-10 py-14 md:py-16">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-10 flex-wrap">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-widest text-primary-fixed mb-4">
              <div className="bg-tertiary-fixed border-4 border-primary-fixed p-2 flex">
                <Megaphone className="w-5 h-5 stroke-[2.5]" />
              </div>
              Ready to run your next event?
            </div>
            <h2 className="font-headline font-extrabold text-background text-3xl md:text-4xl uppercase leading-none tracking-tight mb-3.5">
              Your next event deserves better than a Google Form.
            </h2>
            <p className="text-sm text-primary-fixed leading-relaxed">
              Set up in under 4 minutes. No billing, no onboarding calls. Paste in your event details and go.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed px-7 py-3.5 font-extrabold uppercase text-sm border-4 border-background neo-shadow hover-lift press-down transition-all"
            >
              Launch FestFlow <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-background px-7 py-3 font-extrabold uppercase text-xs border-[3px] border-background/40 hover:border-background transition-all"
            >
              View Organizer Demo
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-surface px-6 md:px-10 py-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 font-headline font-extrabold uppercase text-sm">
          <div className="bg-tertiary-fixed border-[3px] border-on-background p-1 flex">
            <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          FestFlow
        </div>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant text-center">
          Campus Event Operations Platform — Built for Students, by Students
        </p>
        <div className="flex gap-5">
          <Link to="/login" className="text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">
            Sign In
          </Link>
          <Link to="/login" className="text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">
            Organizer
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
