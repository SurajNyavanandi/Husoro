import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  Check,
  Copy,
  Mail,
  MapPin,
  Maximize,
  Menu,
  Minimize,
  Pause,
  Play,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

/* ----------------------------- CONSTANTS ----------------------------- */

const BRAND_LOGO =
  'https://res.cloudinary.com/dfr0zghtc/image/upload/v1794060891/Gemini_Generated_Image_tatgbctatgbctatg_kltjho.jpg';
const HERO_IMAGE =
  'https://res.cloudinary.com/dfr0zghtc/image/upload/v1794898816/M.I.R.A.G.E._Rover_in_the_Golden_Desert_foacih.png';
const VIDEO_URL =
  'https://res.cloudinary.com/dfr0zghtc/video/upload/v1793773090/intro_video_y9ppov.mp4';
const VIDEO_FALLBACK_URL = '/intro_video.mp4';
const LINKEDIN_URL = 'https://www.linkedin.com/company/husoro-technologies/';
const CONTACT_EMAIL = 'info@husoro.com';
const WHATSAPP_NUMBER = '919876543210';

// Core theme: black and white
const INK = '#0B0B0B';
const WHITE = '#FFFFFF';
const SAND = '#F4F4F1';

// Accents: army green used sparingly, plus neutral highlights
const ARMY = '#4B5320';
const KHAKI = '#B8A65A';
const PALE_OLIVE = '#C9D19A';

const WORDMARK_FONT = "'Bank Gothic', 'Oxanium', 'Arial Black', sans-serif";
const DISPLAY_FONT = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const BODY_FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

const SHARED_CONTAINER = 'mx-auto w-full max-w-300 px-5 sm:px-6 lg:px-8';
const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black';
const INPUT_CLASS =
  'w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-black/35 focus:border-black focus:ring-2 focus:ring-black/15 sm:text-sm';
const CONTROL_BUTTON = `flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/30 ${FOCUS_RING} focus-visible:outline-white`;

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'product', label: 'Product' },
  { id: 'technology', label: 'Technology' },
  { id: 'contact', label: 'Contact' },
] as const;

const TECHNOLOGIES = [
  {
    title: 'Radar That Sees Underground',
    description:
      'Scans beneath the soil to spot hidden plastic and metal landmines without touching them.',
    image:
      'https://res.cloudinary.com/dfr0zghtc/image/upload/v1794898817/M.I.R.A.G.E._Rover_Scanning_Desert_Terrain_ga1tiv.png',
    alt: 'M.I.R.A.G.E. rover scanning desert terrain with ground-penetrating radar',
  },
  {
    title: 'Smart Sensor Fusion',
    description:
      'Combines radar and sensors so the robot clearly identifies real threats and avoids false alarms from rocks or trash.',
    image:
      'https://res.cloudinary.com/dfr0zghtc/image/upload/v1794898816/M.I.R.A.G.E._Rover_Scanning_Martian_Debris_zmtj8u.png',
    alt: 'M.I.R.A.G.E. rover fusing sensor data to tell real threats from debris',
  },
  {
    title: 'Drives Autonomously or by Remote',
    description:
      'Can drive itself across rocks, sand, and rough dirt, or be driven safely by an operator from a distance.',
    image:
      'https://res.cloudinary.com/dfr0zghtc/image/upload/v1794898816/M.I.R.A.G.E._Rover_at_Dusk_qbnhcc.png',
    alt: 'M.I.R.A.G.E. rover driving autonomously across terrain at dusk',
  },
];

const ERROR_REQUIRED = 'Please fill in your name, email, subject, and message.';
const ERROR_EMAIL = 'Please enter a valid email address.';
const STATUS_OPENING = 'Opening WhatsApp with your message ready...';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ----------------------------- GLOBAL STYLES ----------------------------- */

const GLOBAL_CSS = `
@font-face {
  font-family: 'Bank Gothic';
  src: url('/fonts/bank-gothic.woff2') format('woff2'),
       url('/fonts/bank-gothic.ttf') format('truetype');
  font-weight: 400 900;
  font-display: swap;
}
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto !important; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

/* ----------------------------- HELPERS ----------------------------- */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
};

/* ----------------------------- SMALL COMPONENTS ----------------------------- */

function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const offset = {
    up: { x: 0, y: 28 },
    left: { x: -40, y: 0 },
    right: { x: 40, y: 0 },
  }[direction];

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function NavAnchor({
  id,
  label,
  className,
  onNavigate,
}: {
  id: string;
  label: string;
  className: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(id);
      }}
      className={className}
    >
      {label}
    </a>
  );
}

/* ----------------------------- SCROLL PROGRESS ----------------------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: scrollYProgress, backgroundColor: KHAKI }}
      className="fixed inset-x-0 top-0 z-60 h-0.5 origin-left"
    />
  );
}

/* ----------------------------- HEADER ----------------------------- */

function Header({
  scrolled,
  activeSection,
  menuOpen,
  setMenuOpen,
  onNavigate,
}: {
  scrolled: boolean;
  activeSection: string;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  // White header over the hero, frosted white bar with a black-tint border after scrolling
  const onDark = !scrolled && !menuOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={`mx-auto max-w-300 rounded-2xl transition-all duration-300 ${
          onDark
            ? 'border border-transparent bg-transparent'
            : 'border border-black/10 bg-white/95 shadow-lg backdrop-blur-md'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className={`group flex items-center gap-3 rounded-lg ${FOCUS_RING}`}
            aria-label="HUSORO Technologies Home"
          >
            <img
              src={BRAND_LOGO}
              alt="HUSORO Technologies Defense Robotics Logo Emblem"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <span
              className={`text-2xl tracking-wide ${onDark ? 'text-white' : 'text-black'}`}
              style={{
                fontFamily: WORDMARK_FONT,
                fontWeight: 700,
                textShadow: onDark ? '0 2px 12px rgba(0,0,0,0.5)' : undefined,
              }}
            >
              HUSORO
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <NavAnchor
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  onNavigate={onNavigate}
                  className={`relative rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${FOCUS_RING} ${
                    onDark
                      ? isActive
                        ? 'text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-white'
                        : 'text-white/85 hover:text-white'
                      : isActive
                        ? 'text-black after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-black'
                        : 'text-slate-600 hover:text-black'
                  }`}
                />
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors md:hidden ${FOCUS_RING} ${
              onDark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'
            }`}
            aria-label="Toggle Navigation Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              key="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="border-t border-black/10 px-3 pb-3 pt-2 md:hidden"
              aria-label="Mobile"
            >
              {NAV_LINKS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <NavAnchor
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    onNavigate={onNavigate}
                    className={`flex min-h-11 items-center rounded-xl px-3 text-base transition-colors ${FOCUS_RING} ${
                      isActive
                        ? 'bg-black/5 font-bold text-black'
                        : 'text-slate-700 hover:bg-black/5 hover:text-black'
                    }`}
                  />
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/* ----------------------------- HERO ----------------------------- */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Wrapper is 120% tall and starts at -10%, so the parallax never reveals an edge
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '6%']);

  return (
    <section
      id="home"
      ref={ref}
      className="relative isolate flex min-h-svh scroll-mt-24 items-start overflow-hidden md:min-h-[92vh] md:items-center"
      style={{ backgroundColor: INK }}
    >
      <motion.div style={{ y }} className="absolute inset-x-0 top-[-10%] h-[120%]">
        <motion.img
          src={HERO_IMAGE}
          alt="M.I.R.A.G.E. rover driving across a golden desert plain by HUSORO Technologies"
          width={1672}
          height={941}
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
          initial={reduceMotion ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.2, 0.7, 0.2, 1] }}
          className="h-full w-full object-cover object-[72%_50%] md:object-[70%_center]"
        />
      </motion.div>

      {/* Desktop only: black shade on the left, fading into the photo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.78) 32%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0) 72%)',
        }}
      />

      {/* Mobile only: light fade at the top so the text and header stay readable. The photo keeps its natural colors. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%] md:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div className={`${SHARED_CONTAINER} relative z-10 pt-28 pb-12 sm:pt-32 md:pt-28 md:pb-0`}>
        <div className="max-w-136">
          <Reveal direction="left">
            <h1
              className="font-extrabold uppercase text-white"
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: 'clamp(3.75rem, 16vw, 9.5rem)',
                lineHeight: 0.88,
                letterSpacing: '-0.01em',
                textShadow: '0 4px 18px rgba(0,0,0,0.45)',
              }}
            >
              ROBOTS
            </h1>
          </Reveal>

          <Reveal direction="left" delay={0.12}>
            <div className="mt-5 border-l-4 py-1 pl-4 sm:pl-5" style={{ borderColor: WHITE }}>
              <p
                className="font-semibold uppercase text-white"
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontSize: 'clamp(1.125rem, 4.2vw, 2rem)',
                  lineHeight: 1.12,
                  letterSpacing: '0.06em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                DESIGNED TO SAVE, PROTECT, &amp; SERVE
              </p>
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.24}>
            <div className="mt-7 flex items-center gap-2" aria-hidden="true">
              <span className="h-1 w-16 rounded-full bg-white" />
              <span className="h-1 w-3 rounded-full" style={{ backgroundColor: ARMY }} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- ABOUT ----------------------------- */

function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-24 py-16 text-white sm:py-24"
      style={{ backgroundColor: INK }}
    >
      <div className={`${SHARED_CONTAINER} grid gap-12 md:grid-cols-12 md:gap-16`}>
        <Reveal direction="left" className="md:col-span-5">
          <h2
            id="about-heading"
            className="text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            About <span style={{ color: KHAKI }}>HUSORO</span>
          </h2>
          <div className="mt-6 h-1 w-20 rounded-full bg-white" aria-hidden="true" />
        </Reveal>

        <Reveal
          direction="right"
          delay={0.15}
          className="space-y-5 text-sm leading-relaxed text-white/80 sm:text-base md:col-span-7"
        >
          <p>
            <strong className="font-semibold text-white">Husoro Technologies</strong> is a deep-tech robotics company building autonomous ground vehicles for defense and high-risk operations.
          </p>
          <p>
            We develop the full stack — mobility, perception, AI, and intelligent sensing — to deploy where human presence is dangerous, inefficient, or impossible.
          </p>
          <p>
            Our first platform, <strong className="font-semibold text-white">M.I.R.A.G.E.</strong>, targets landmine and UXO detection. It is the first of a portfolio of purpose-built UGVs Husoro is developing for real-world defence and critical-use applications.
          </p>
          <p>
            Incubated at <span className="font-semibold" style={{ color: PALE_OLIVE }}>iTIC–TiHAN, IIT Hyderabad</span>, we are developing robotics from India for challenges that matter globally.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- PRODUCT ----------------------------- */

function Product({ onNavigate }: { onNavigate: (id: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const update = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
    return () => {
      document.removeEventListener('fullscreenchange', update);
      document.removeEventListener('webkitfullscreenchange', update);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => void;
    }) | null;
    const video = videoRef.current as (HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    }) | null;
    if (!container || !video) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => void;
    };

    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      try {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else doc.webkitExitFullscreen?.();
      } catch {
        // ignore
      }
      return;
    }

    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
        return;
      }
      if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
        return;
      }
    } catch {
      // fall through to the iOS fallback
    }

    // iOS Safari: only the video element itself can enter native fullscreen
    if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  };

  return (
    <section id="product" aria-labelledby="product-heading" className="scroll-mt-24 bg-white">
      <Reveal>
        {/* Desktop adds a white margin around the player. Mobile and tablet stay edge to edge. */}
        <div className="md:px-8 md:py-12 lg:px-12">
          {/* Mobile and tablet: 16:9 player like a YouTube embed. Desktop: large framed player. */}
          <div
            ref={containerRef}
            className="group relative aspect-video w-full overflow-hidden bg-black md:aspect-auto md:h-[80svh] md:rounded-3xl md:shadow-2xl md:shadow-black/30 [&:fullscreen]:aspect-auto [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none"
          >
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="M.I.R.A.G.E. product demonstration video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
            >
              <source src={VIDEO_URL} type="video/mp4" />
              <source src={VIDEO_FALLBACK_URL} type="video/mp4" />
              <p>
                Your browser does not support the video tag.{' '}
                <a href={VIDEO_URL} target="_blank" rel="noreferrer" className="underline">
                  Download video
                </a>
                .
              </p>
            </video>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent"
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-xl border border-white/20 bg-black/85 p-1.5 opacity-90 shadow-lg backdrop-blur-md transition-opacity group-hover:opacity-100 sm:right-6 sm:bottom-6 sm:p-2 md:right-8 md:bottom-8">
              <button
                type="button"
                onClick={togglePlay}
                className={CONTROL_BUTTON}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className={CONTROL_BUTTON}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className={CONTROL_BUTTON}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit fullscreen' : 'Full screen'}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" aria-hidden="true" /> : <Maximize className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="py-16 sm:py-24" style={{ backgroundColor: SAND }}>
        <div className={`${SHARED_CONTAINER} grid items-center gap-12 md:grid-cols-2 md:gap-16`}>
          <Reveal direction="left">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-black uppercase">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ARMY }} aria-hidden="true" />
              <span>Flagship Landmine-Finding Rover</span>
            </div>

            <h2
              id="product-heading"
              className="mb-4 text-4xl font-extrabold uppercase leading-none text-slate-900 sm:text-5xl"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Product <span style={{ color: ARMY }}>M.I.R.A.G.E.</span>
            </h2>

            <p className="mb-5 text-xs font-semibold tracking-wide text-slate-700 uppercase sm:text-sm">
              <span className="text-black">M</span>inefield{' '}
              <span className="text-black">I</span>ntelligent{' '}
              <span className="text-black">R</span>adar and{' '}
              <span className="text-black">A</span>utonomous{' '}
              <span className="text-black">G</span>round{' '}
              <span className="text-black">E</span>xplorer
            </p>

            <button
              type="button"
              onClick={() => onNavigate('technology')}
              className={`group inline-flex items-center gap-2 rounded text-sm font-semibold text-black transition-all hover:gap-3 ${FOCUS_RING}`}
            >
              <span>See how the technology works</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              M.I.R.A.G.E. is an autonomous military-grade UGV built for real-time landmine detection and subsurface hazard classification, utilizing ground-penetrating radar to safeguard defense and humanitarian operations without human risk.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- TECHNOLOGY ----------------------------- */

function Technology() {
  return (
    <section
      id="technology"
      aria-labelledby="technology-heading"
      className="scroll-mt-24 bg-white py-16 sm:py-24"
    >
      <div className={SHARED_CONTAINER}>
        <Reveal className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
          <h2
            id="technology-heading"
            className="mb-4 text-4xl font-extrabold uppercase leading-none text-black sm:text-5xl"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Technology <span style={{ color: ARMY }}>Capabilities</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Smart sensors and self-driving robots built to find hidden explosives and protect lives.
          </p>
        </Reveal>

        <div className="space-y-12 sm:space-y-20">
          {TECHNOLOGIES.map((tech, idx) => {
            const reverse = idx % 2 === 1;
            return (
              <Reveal key={tech.title} direction={reverse ? 'right' : 'left'}>
                <div
                  className={`group flex flex-col items-center gap-8 md:gap-16 ${
                    reverse ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                >
                  <div className="w-full min-w-0 flex-1">
                    <div className="aspect-4/3 overflow-hidden rounded-3xl bg-black shadow-xl shadow-black/20 transition-transform duration-500 group-hover:-translate-y-1.5">
                      <img
                        src={tech.image}
                        alt={tech.alt}
                        width={1024}
                        height={768}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="w-full min-w-0 flex-1">
                    <span
                      className="inline-block rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wider text-white uppercase"
                      style={{ backgroundColor: ARMY }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="mt-3 mb-3 text-3xl font-extrabold uppercase leading-tight text-slate-900 transition-colors group-hover:text-black sm:text-4xl"
                      style={{ fontFamily: DISPLAY_FONT }}
                    >
                      {tech.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{tech.description}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CONTACT ----------------------------- */

type FormState = { name: string; email: string; phone: string; subject: string; message: string };
type Phase = 'idle' | 'sending' | 'sent';

function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [copied, setCopied] = useState(false);

  const update =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setWhatsappUrl(null);

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setFeedback({ type: 'error', text: ERROR_REQUIRED });
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setFeedback({ type: 'error', text: ERROR_EMAIL });
      return;
    }

    const text =
      `*New Message - HUSORO Technologies*\n\n` +
      `*Name:* ${form.name}\n` +
      `*Email:* ${form.email}\n` +
      `*Phone:* ${form.phone.trim() ? form.phone : 'N/A'}\n` +
      `*Subject:* ${form.subject}\n\n` +
      `*Message:*\n${form.message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

    setPhase('sending');
    setWhatsappUrl(url);
    setFeedback({ type: 'success', text: STATUS_OPENING });

    // Background log; failures are ignored so the WhatsApp redirect always works
    fetch('/contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => {});

    window.setTimeout(() => {
      setPhase('sent');
      window.location.href = url;
    }, 350);
  };

  const buttonLabel =
    phase === 'sending' ? 'Sending...' : phase === 'sent' ? 'Message Sent' : 'Send Message';

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-24 py-16 sm:py-24"
      style={{ backgroundColor: SAND }}
    >
      <div className={SHARED_CONTAINER}>
        <Reveal className="mb-10 sm:mb-14">
          <h2
            id="contact-heading"
            className="text-4xl font-extrabold uppercase leading-none text-black sm:text-5xl"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Contact <span style={{ color: ARMY }}>Us</span>
          </h2>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal direction="left" className="lg:col-span-7">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xl shadow-black/10 sm:p-10">
              {feedback && (
                <div
                  role="alert"
                  className={`mb-6 rounded-xl border p-4 text-sm ${
                    feedback.type === 'success'
                      ? 'border-black/20 bg-black/5 text-black'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  <p>{feedback.text}</p>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C1C1C] ${FOCUS_RING}`}
                    >
                      <span>Open WhatsApp directly</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700">
                      Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={update('name')}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="your.email@example.com"
                      value={form.email}
                      onChange={update('email')}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-700">
                      Phone (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Your phone number"
                      value={form.phone}
                      onChange={update('phone')}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-subject" className="text-xs font-semibold text-slate-700">
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      placeholder="What would you like to discuss?"
                      value={form.subject}
                      onChange={update('subject')}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    placeholder="Tell us about your project, questions, or how we can help..."
                    value={form.message}
                    onChange={update('message')}
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={phase === 'sending'}
                  className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 hover:bg-[#1C1C1C] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{buttonLabel}</span>
                </button>
              </form>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.15} className="lg:col-span-5">
            <div className="flex h-full flex-col justify-center gap-6 rounded-3xl bg-black p-6 text-white sm:p-10">
              <h3
                className="text-2xl font-extrabold uppercase tracking-wide"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                Get in Touch
              </h3>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-xl bg-white/15 p-2.5">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className={`break-all rounded text-sm font-medium underline-offset-4 hover:underline ${FOCUS_RING} focus-visible:outline-white`}
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/15 ${FOCUS_RING} focus-visible:outline-white`}
                  aria-label="Copy Email to clipboard"
                  title="Copy Email"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="shrink-0 rounded-xl bg-white/15 p-2.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <address className="text-sm leading-relaxed not-italic">
                  Technology Innovation Park, IIT HYDERABAD, Kandi, Sangareddy, Telangana, India - 502284
                </address>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FOOTER ----------------------------- */

function Footer({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <footer className="border-t-4 py-10 text-white" style={{ backgroundColor: INK, borderColor: ARMY }}>
      <div
        className={`${SHARED_CONTAINER} flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left`}
      >
        <div className="flex items-center gap-3">
          <img
            src={BRAND_LOGO}
            alt="HUSORO Technologies Logo"
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
            className="h-8 w-8 rounded-lg bg-white object-cover"
          />
          <span className="text-xl tracking-wide" style={{ fontFamily: WORDMARK_FONT, fontWeight: 700 }}>
            HUSORO
          </span>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium"
          aria-label="Footer"
        >
          {NAV_LINKS.map((item) => (
            <NavAnchor
              key={item.id}
              id={item.id}
              label={item.label}
              onNavigate={onNavigate}
              className={`rounded p-1 text-white/80 transition-colors hover:text-white ${FOCUS_RING} focus-visible:outline-white`}
            />
          ))}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded p-1 text-white/80 transition-colors hover:text-white ${FOCUS_RING} focus-visible:outline-white`}
          >
            LinkedIn
          </a>
        </nav>

        <p className="text-xs text-white/70">© 2024 HUSORO. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ----------------------------- APP ----------------------------- */

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    // Global styles: Bank Gothic font-face and reduced-motion handling
    const styleId = 'husoro-global-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }

    // Display, body, and fallback wordmark fonts from Google Fonts
    const fontId = 'husoro-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Oxanium:wght@600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleNavigate = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white antialiased text-slate-900"
      style={{ fontFamily: BODY_FONT }}
    >
      <ScrollProgress />

      <Header
        scrolled={scrolled}
        activeSection={activeSection}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onNavigate={handleNavigate}
      />

      <main>
        <Hero />
        <About />
        <Product onNavigate={handleNavigate} />
        <Technology />
        <Contact />
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}