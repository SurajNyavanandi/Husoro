import React, { useState, useEffect, useRef } from 'react';
import {
  Radar,
  Radio,
  Layers,
  ArrowRight,
  MapPin,
  Mail,
  Send,
  Check,
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Copy,
} from 'lucide-react';

const HUSORO_LETTERS = ['H', 'U', 'S', 'O', 'R', 'O'];

const BRAND_LOGO = 'https://res.cloudinary.com/dfr0zghtc/image/upload/v1794060891/Gemini_Generated_Image_tatgbctatgbctatg_kltjho.jpg';

// WhatsApp number for inquiry redirection (can be updated with official number)
const WHATSAPP_NUMBER = '919876543210';

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.84 6.88a1.61 1.61 0 1 0 0 3.22 1.61 1.61 0 0 0 0-3.22Z" />
    </svg>
  );
}

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'product', label: 'Product' },
  { id: 'technology', label: 'Technology' },
  { id: 'contact', label: 'Contact' },
];

// High-precision canvas radar for background defense texture
function RadarCanvas({ darkMode }: { darkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    const blips = [
      { r: 0.35, theta: 0.6, alpha: 0 },
      { r: 0.65, theta: 2.1, alpha: 0 },
      { r: 0.5, theta: 3.8, alpha: 0 },
      { r: 0.78, theta: 5.1, alpha: 0 },
      { r: 0.28, theta: 4.4, alpha: 0 },
    ];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(cx, cy) * 0.95;

      const ringColor = darkMode ? 'rgba(4, 88, 236, 0.12)' : 'rgba(0, 81, 187, 0.08)';
      const crossColor = darkMode ? 'rgba(255, 108, 44, 0.12)' : 'rgba(255, 108, 44, 0.09)';
      const sweepColor = darkMode ? 'rgba(4, 88, 236, 0.18)' : 'rgba(0, 81, 187, 0.12)';

      // Draw concentric radar rings
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const r = (maxR / 4) * i;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = ringColor;
        ctx.setLineDash(i === 4 ? [] : [4, 6]);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw crosshair axes
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = crossColor;
      ctx.stroke();

      // Draw rotating sweep sector
      angle += 0.012;
      if (angle >= Math.PI * 2) angle -= Math.PI * 2;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.45, angle);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      grad.addColorStop(0, sweepColor);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Draw sweep leading edge line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = darkMode ? 'rgba(4, 88, 236, 0.4)' : 'rgba(0, 81, 187, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Render & decay blips
      blips.forEach((b) => {
        const diff = Math.abs(angle - b.theta);
        if (diff < 0.08 || diff > Math.PI * 2 - 0.08) {
          b.alpha = 1;
        } else {
          b.alpha = Math.max(0, b.alpha - 0.008);
        }

        if (b.alpha > 0.02) {
          const bx = cx + Math.cos(b.theta) * (b.r * maxR);
          const by = cy + Math.sin(b.theta) * (b.r * maxR);
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 108, 44, ${b.alpha * 0.9})`;
          ctx.shadowColor = '#ff6c2c';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [darkMode]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  });
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitBtnText, setSubmitBtnText] = useState('Submit');

  // Sync dark mode class on document & localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Navbar scroll tracking & active section observer
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ['home', 'about', 'product', 'technology', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Video playback toggling
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  // Contact Form Submission with WhatsApp redirection
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: null, text: '' });
    setWhatsappRedirectUrl(null);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormStatus({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({ type: 'error', text: 'Please provide a valid official email address.' });
      return;
    }

    setSubmitting(true);
    setSubmitBtnText('Submitting...');

    // Format all inquiry fields for WhatsApp
    const whatsappText =
      `*New Inquiry - HUSORO Technologies*\n\n` +
      `*Name:* ${formData.name}\n` +
      `*Email:* ${formData.email}\n` +
      `*Phone:* ${formData.phone.trim() ? formData.phone : 'N/A'}\n` +
      `*Subject:* ${formData.subject}\n\n` +
      `*Message:*\n${formData.message}`;

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
    setWhatsappRedirectUrl(targetUrl);

    // Optional background log to contact.php
    try {
      fetch('/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => {});
    } catch {
      // Ignored
    }

    setFormStatus({
      type: 'success',
      text: 'Redirecting to WhatsApp with your inquiry details pre-filled...',
    });

    // Directly redirect to WhatsApp
    setTimeout(() => {
      window.location.href = targetUrl;
      setSubmitBtnText('Submitted');
      setSubmitting(false);
    }, 350);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('info@husoro.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Card mouse movement for ambient spotlight effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  // Authentic core technologies without artificial metrics or numbers
  const coreTechnologies = [
    {
      title: 'Real-Time Landmine Detection',
      description: 'Advanced radar systems engineered to detect buried explosive threats with high precision and sub-surface reliability.',
      icon: Radar,
    },
    {
      title: 'Sensor Fusion Technology',
      description: 'Combines synchronized multi-sensor feeds and radar data to accurately identify buried hazards and minimize false positives.',
      icon: Layers,
    },
    {
      title: 'Dual-Mode Operation',
      description: 'Flexible autonomous traversal and manual tele-operation modes designed for extreme and challenging multi-terrain environments.',
      icon: Radio,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 selection:bg-[#ff6c2c]/30 selection:text-white transition-colors duration-300 relative overflow-x-hidden font-sans">
      {/* 1. Floating Frosted-Glass Header Pill (21st.dev / Tailwind UI Pattern) */}
      <div className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <header
          className={`max-w-6xl mx-auto pointer-events-auto rounded-2xl transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 border backdrop-blur-md shadow-2xl shadow-black/40 ${
            isScrolled
              ? 'bg-[#090d16]/90 border-white/15 shadow-black/60'
              : 'bg-slate-900/80 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Zone 1: Brand Wordmark & Geometric Emblem */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className="group flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0 focus:outline-none"
              aria-label="HUSORO Technologies Home"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg overflow-hidden bg-black border border-white/20 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
                <img
                  src={BRAND_LOGO}
                  alt="HUSORO Technologies Defense Robotics Logo Emblem"
                  width={36}
                  height={36}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-base sm:text-lg font-ubuntu text-white">
                  HUSORO
                </span>
              </div>
            </a>

            {/* Zone 2: Clean Nav Links with Active Indicator Pill */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1 rounded-xl bg-black/25 border border-white/5">
              {NAV_LINKS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium tracking-normal transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold shadow-xs border border-white/15'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Zone 3: Mobile Toggle */}
            <div className="flex md:hidden items-center shrink-0">
              {/* Mobile Menu Hamburger with 44px touch target */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu with touch-friendly targets */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-white/10 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`block px-4 py-3 min-h-[44px] flex items-center rounded-xl text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-white/15 text-white font-semibold border border-white/15'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </header>
      </div>

      {/* 2. Hero Section: Cinematic Flexible Sentence Rover Background */}
      <section
        id="home"
        className="relative min-h-[58vh] sm:min-h-[72vh] lg:min-h-[85vh] flex items-center justify-center pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-3.5 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* MND-X1 Desert Scanning Rover Background Image with Atmospheric Lighting */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793864428/MND-X1_Desert_Scanning_Rover_pl9j8m.jpg"
            alt="MND-X1 Desert Scanning Autonomous Landmine Detection Rover by HUSORO Technologies"
            width={1920}
            height={1080}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-115 scale-100"
            referrerPolicy="no-referrer"
          />

          {/* Tactical Blue Ambient Light Field (Left) */}
          <div
            className="absolute -top-24 -left-24 w-[280px] sm:w-[480px] md:w-[580px] h-[280px] sm:h-[480px] md:h-[580px] bg-gradient-to-br from-[#0051bb]/45 via-[#0458ec]/30 to-transparent rounded-full blur-[90px] sm:blur-[110px] pointer-events-none mix-blend-screen animate-pulse-slow-blue"
            aria-hidden="true"
          />

          {/* Defense Radar Orange Glow Flare (Right) */}
          <div
            className="absolute top-1/4 -right-20 w-[260px] sm:w-[440px] md:w-[540px] h-[260px] sm:h-[440px] md:h-[540px] bg-gradient-to-bl from-[#ff6c2c]/40 via-[#ff8042]/25 to-transparent rounded-full blur-[90px] sm:blur-[110px] pointer-events-none mix-blend-screen animate-pulse-slow-orange"
            aria-hidden="true"
          />

          {/* Optical Scanning Light Beam (Vertical Radar Sweep) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="w-full h-20 sm:h-24 bg-gradient-to-b from-transparent via-[#0458ec]/20 to-[#ff6c2c]/15 animate-scanline-sweep blur-sm" />
          </div>

          {/* Angled High-Tech Shimmer Light Beam */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="w-1/3 h-[200%] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-beam-sweep blur-md" />
          </div>

          {/* Smooth Vignette blending top nav and bottom section (#07090e) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/30 to-[#07090e]" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Subtle Canvas Radar Grid Background */}
        <RadarCanvas darkMode={true} />

        <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center justify-center">
          <h1 className="font-ubuntu text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-normal sm:tracking-tight leading-snug sm:leading-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.85)] flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3.5 gap-y-1.5 sm:gap-y-2 uppercase text-center max-w-4xl mx-auto px-2 sm:px-4">
            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-white">
              {HUSORO_LETTERS.map((letter, index) => (
                <span
                  key={index}
                  className="animate-letter-fall cursor-default hover:text-[#ff6c2c] transition-colors duration-200 inline-block transform"
                  style={{
                    animationDelay: `${0.12 + index * 0.12}s`,
                  }}
                  title={letter}
                >
                  {letter}
                </span>
              ))}
            </span>
            <span className="text-white">ROBOTS DESIGNED TO SAVE, PROTECT, &amp; SERVE</span>
          </h1>
        </div>
      </section>

      {/* 3. About Us Section: Alternating Zig-Zag (Left: Narrative / Right: Modern Split Spotlight Card) */}
      <section
        id="about"
        className="relative py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-800/80 bg-[#0d121f] text-slate-100 overflow-hidden"
        aria-labelledby="about-heading"
      >
        {/* Subtle background ambient radial glow */}
        <div
          className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-blue-600/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl">
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                <span>Who We Are</span>
              </div>
              <h2
                id="about-heading"
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.18] sm:leading-[1.15]"
              >
                About <span className="font-medium text-[#3b82f6]">HUSORO</span>
              </h2>
            </div>

            <div className="space-y-3.5 sm:space-y-4 text-sm sm:text-base font-normal leading-relaxed text-slate-300">
              <p>
                Established in 2024, <strong className="font-medium text-white">HUSORO Technologies</strong> is
                a deep-tech company dedicated to advancing the field of unmanned robotics. Our mission is to protect human lives and
                transform critical operations through intelligent, reliable, and purpose-driven robotic systems.
              </p>

              <p>
                Built on a strong foundation of in-house research and development, HUSORO combines expertise in{' '}
                <strong className="font-medium text-white">AI, autonomy, and advanced sensing</strong> to deliver
                technologies that are both robust and future-ready.
              </p>

              <p>
                With a clear focus on innovation, precision, and real-world impact, HUSORO is shaping the next generation of robotic
                solutions where technology serves humanity with trust, adaptability, and purpose.
              </p>
            </div>

            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => scrollToSection('product')}
                className="group inline-flex items-center gap-2 text-sm font-medium text-[#ff6c2c] hover:text-[#ff8042] transition-colors cursor-pointer"
              >
                <span>Discover our flagship UGV</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Section: Interactive Video Showcase Card & Narrative */}
      <section
        id="product"
        className="relative py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#07090e] text-white border-b border-slate-800/80 overflow-hidden"
        aria-labelledby="product-heading"
      >
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-120 sm:w-175 h-90 sm:h-125 bg-[#ff6c2c]/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Left Column: Interactive Video Showcase Card (21st.dev Pattern) */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black/95 border border-white/15 shadow-[0_0_60px_rgba(255,108,44,0.18)] aspect-video group before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[#ff6c2c]/40 before:to-transparent">
                {/* Top Feature Pill Badges */}
                <div className="absolute top-2.5 sm:top-3.5 inset-x-2.5 sm:inset-x-3.5 flex items-center justify-between pointer-events-none z-10 gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-medium text-slate-200 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    4K Real-Time Feed
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-medium text-orange-400 shadow-md">
                    <Radar className="w-3 h-3 text-orange-400" />
                    M.I.R.A.G.E. UGV
                  </span>
                </div>

                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  preload="auto"
                  aria-label="M.I.R.A.G.E. product demonstration video"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source
                    src="https://res.cloudinary.com/dfr0zghtc/video/upload/v1793773090/intro_video_y9ppov.mp4"
                    type="video/mp4"
                  />
                  <source src="/intro_video.mp4" type="video/mp4" />
                  <p>
                    Your browser does not support the video tag.{' '}
                    <a
                      href="https://res.cloudinary.com/dfr0zghtc/video/upload/v1793773090/intro_video_y9ppov.mp4"
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-[#ff6c2c]"
                    >
                      Download video
                    </a>
                    .
                  </p>
                </video>

                {/* Bottom Video Controls Overlay Pill with 40px touch targets */}
                <div className="absolute bottom-2.5 sm:bottom-3.5 inset-x-2.5 sm:inset-x-3.5 flex items-center justify-between bg-black/75 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/15 shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="min-w-[36px] min-h-[36px] p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="min-w-[36px] min-h-[36px] p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-[10px] sm:text-xs text-slate-300 font-medium tracking-wide truncate max-w-[130px] sm:max-w-none">
                    Autonomous Telemetry Active
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Narrative & Acronym Breakdown */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6c2c]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff6c2c]" />
                  <span>Flagship Defense Robotics</span>
                </div>
                <h2 id="product-heading" className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.15]">
                  Product <span className="font-medium text-[#ff6c2c]">M.I.R.A.G.E.</span>
                </h2>

                <h3 className="text-base sm:text-lg font-normal text-slate-300 tracking-tight">
                  <span className="text-[#ff6c2c] font-medium">M</span>inefield{' '}
                  <span className="text-[#ff6c2c] font-medium">I</span>ntelligent{' '}
                  <span className="text-[#ff6c2c] font-medium">R</span>adar and{' '}
                  <span className="text-[#ff6c2c] font-medium">A</span>utonomous{' '}
                  <span className="text-[#ff6c2c] font-medium">G</span>round{' '}
                  <span className="text-[#ff6c2c] font-medium">E</span>xplorer
                </h3>
              </div>

              <div className="space-y-4 text-sm sm:text-base font-normal leading-relaxed text-slate-300">
                <p>
                  <strong className="font-medium text-white">M.I.R.A.G.E.</strong> is an advanced{' '}
                  <strong className="font-medium text-white">military-grade UGV</strong> engineered for intelligent{' '}
                  <strong className="font-medium text-white">landmine detection and classification</strong>.
                </p>

                <p>
                  It employs <strong className="font-medium text-white">sensor fusion technology</strong>, combining data from
                  multiple sensors and advanced radar systems to accurately identify buried threats in real time.
                </p>

                <p>
                  Designed for reliability in challenging terrains, M.I.R.A.G.E enhances operational safety, precision, and
                  efficiency in <strong className="font-medium text-white">demining missions</strong>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => scrollToSection('technology')}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-[#ff6c2c] hover:text-[#ff8042] transition-colors cursor-pointer"
                >
                  <span>Explore technology capabilities</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technology Section: Sleek 3-Card Bento Grid */}
      <section
        id="technology"
        className="relative py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#0d121f] text-slate-100 overflow-hidden"
        aria-labelledby="technology-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-2.5 sm:space-y-3 mb-8 sm:mb-12 lg:mb-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
              <span>Core Capabilities</span>
            </div>
            <h2
              id="technology-heading"
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.18] sm:leading-[1.15]"
            >
              Technology <span className="font-medium text-[#3b82f6]">Capabilities</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg font-normal leading-relaxed text-slate-300">
              Advanced sub-surface sensing and autonomous robotics engineered to detect and classify explosive threats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {coreTechnologies.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onMouseMove={handleMouseMove}
                  className="card-spotlight relative p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#111726]/85 backdrop-blur-sm border border-slate-800/80 hover:border-blue-500/40 shadow-xl hover:shadow-[0_0_35px_rgba(59,130,246,0.15)] transition-all duration-300 group hover:-translate-y-1.5 sm:hover:-translate-y-2 flex flex-col justify-between before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[#3b82f6]/50 before:to-transparent"
                >
                  <div>
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 sm:mb-6 text-[#3b82f6] group-hover:scale-110 group-hover:border-[#ff6c2c]/40 group-hover:text-[#ff6c2c] group-hover:bg-[#ff6c2c]/10 transition-all duration-300 shadow-md">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <h3 className="text-base sm:text-lg lg:text-xl font-medium tracking-tight text-white leading-snug mb-2 sm:mb-3 group-hover:text-blue-100 transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-xs sm:text-sm lg:text-base font-normal leading-relaxed text-slate-300">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Contact Section: 21st.dev Floating Dark Glass Form & Details Architecture */}
      <section
        id="contact"
        className="relative py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#07090e] text-slate-100 overflow-hidden"
        aria-labelledby="contact-heading"
      >
        {/* Subtle Ambient Radial Glow Container */}
        <div
          className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-[#ff6c2c]/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
              <span>Direct Engagement</span>
            </div>
            <h2 id="contact-heading" className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.18] sm:leading-[1.15]">
              Contact <span className="font-medium text-[#3b82f6]">Us</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg font-normal leading-relaxed text-slate-300 max-w-3xl">
              If you have any questions regarding our defense robotics systems, field deployments, or partnerships, please
              fill out the form here.
            </p>
          </div>

          <div
            onMouseMove={handleMouseMove}
            className="card-spotlight relative rounded-2xl sm:rounded-3xl bg-[#0d121f]/90 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-black/80 overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[#3b82f6]/40 before:to-transparent"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
              {/* Left Column (lg:col-span-7): 21st.dev Floating Dark Glass Contact Form */}
              <div className="lg:col-span-7 p-4 sm:p-8 lg:p-10 bg-black/20">
                {formStatus.text && (
                  <div
                    className={`mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm ${
                      formStatus.type === 'success'
                        ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-200'
                        : 'bg-rose-950/40 border border-rose-800 text-rose-200'
                    }`}
                    role="alert"
                  >
                    <div>{formStatus.text}</div>
                    {whatsappRedirectUrl && (
                      <div className="mt-2.5">
                        <a
                          href={whatsappRedirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                        >
                          <span>Open WhatsApp directly</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="w-full space-y-3.5 sm:space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-300">Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-3 sm:px-4 sm:py-3 rounded-xl bg-[#080c14]/90 border border-slate-700/60 hover:border-slate-600 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/25 text-white text-base sm:text-sm placeholder:text-slate-500 transition-all outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-300">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@organization.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-3 sm:px-4 sm:py-3 rounded-xl bg-[#080c14]/90 border border-slate-700/60 hover:border-slate-600 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/25 text-white text-base sm:text-sm placeholder:text-slate-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-300">Phone</label>
                      <input
                        type="tel"
                        placeholder="+91-XXX-XXX-XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-3 sm:px-4 sm:py-3 rounded-xl bg-[#080c14]/90 border border-slate-700/60 hover:border-slate-600 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/25 text-white text-base sm:text-sm placeholder:text-slate-500 transition-all outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-300">Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="Inquiry or deployment focus"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-3 sm:px-4 sm:py-3 rounded-xl bg-[#080c14]/90 border border-slate-700/60 hover:border-slate-600 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/25 text-white text-base sm:text-sm placeholder:text-slate-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300">Message *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please describe your operational requirements or question..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-3 sm:px-4 sm:py-3 rounded-xl bg-[#080c14]/90 border border-slate-700/60 hover:border-slate-600 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/25 text-white text-base sm:text-sm placeholder:text-slate-500 transition-all outline-none resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold tracking-wide text-white bg-linear-to-r from-[#ff6c2c] to-[#ff8042] hover:from-[#e5591c] hover:to-[#ff6c2c] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitBtnText}</span>
                  </button>
                </form>
              </div>

              {/* Right Column (lg:col-span-5): Contact Information Cards */}
              <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 bg-white/2 flex flex-col justify-between">
                <div>
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg lg:text-xl font-medium tracking-tight text-white">Contact Info</h3>
                    <p className="text-xs sm:text-sm font-normal text-slate-400 leading-relaxed">
                      Official defense communications and corporate headquarters.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3.5 pt-3 sm:pt-4">
                    {/* Email */}
                    <div className="group p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#090d16]/90 border border-slate-800/80 hover:border-blue-500/40 hover:bg-[#0c121e] transition-all flex items-start justify-between gap-3 sm:gap-3.5">
                      <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                        <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#3b82f6] group-hover:scale-105 group-hover:text-blue-400 transition-all shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Email
                          </div>
                          <a
                            href="mailto:info@husoro.com"
                            className="text-xs sm:text-sm font-medium text-[#3b82f6] hover:text-[#ff6c2c] hover:underline transition-colors break-all"
                          >
                            info@husoro.com
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={copyEmailToClipboard}
                        className="min-w-[36px] min-h-[36px] p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                        title="Copy Email"
                        aria-label="Copy Email to clipboard"
                      >
                        {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Address */}
                    <div className="group p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#090d16]/90 border border-slate-800/80 hover:border-[#ff6c2c]/40 hover:bg-[#0c121e] transition-all flex items-start gap-3 sm:gap-3.5">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#ff6c2c] group-hover:scale-105 group-hover:text-orange-400 transition-all shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Address (Incubated At)
                        </div>
                        <address className="not-italic text-xs sm:text-sm font-medium text-slate-200 mt-0.5 leading-relaxed break-words">
                          Technology Innovation Park, IIT HYDERABAD, Kandi, Sangareddy, Telangana, India - 502284
                        </address>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer: Clean Minimal Tactical Footer with Refined Dividers & Muted Social Pill Links */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#05070a] text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Logo & Brand Wordmark */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg overflow-hidden bg-black border border-white/20 shadow-sm shrink-0">
                <img
                  src={BRAND_LOGO}
                  alt="HUSORO Technologies Logo"
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-white tracking-tight text-sm font-ubuntu">
                HUSORO
              </span>
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-400 font-normal text-xs">
              Incubated at iTIC Foundation, IIT Hyderabad
            </span>
          </div>

          {/* Quick Nav Mirror with touch-friendly spacing */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 sm:gap-6 font-medium text-xs sm:text-sm">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className="p-1 text-slate-400 hover:text-white transition-colors">
              Home
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="p-1 text-slate-400 hover:text-white transition-colors">
              About
            </a>
            <a href="#product" onClick={(e) => { e.preventDefault(); scrollToSection('product'); }} className="p-1 text-slate-400 hover:text-white transition-colors">
              Product
            </a>
            <a href="#technology" onClick={(e) => { e.preventDefault(); scrollToSection('technology'); }} className="p-1 text-slate-400 hover:text-white transition-colors">
              Technology
            </a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="p-1 text-slate-400 hover:text-white transition-colors">
              Contact
            </a>
            <a
              href="https://www.linkedin.com/company/husoro-technologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#0077b5]/50 hover:bg-[#0077b5]/10 hover:text-white text-slate-300 transition-all text-xs font-medium"
              aria-label="HUSORO Technologies LinkedIn"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-[#0077b5]" />
              <span>LinkedIn</span>
            </a>
          </div>

          {/* Clean Copyright */}
          <div>
            <p className="font-normal text-slate-500 text-[11px] sm:text-xs">&copy; 2024–2026 HUSORO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
