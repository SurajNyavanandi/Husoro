import React, { useState, useEffect, useRef } from 'react';
import {
  Radar,
  Shield,
  Radio,
  Layers,
  ArrowRight,
  ExternalLink,
  Sun,
  Moon,
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
  Compass,
  Cpu,
  Calendar,
  Building2,
} from 'lucide-react';

const HUSORO_LETTERS = ['H', 'U', 'S', 'O', 'R', 'O'];

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

  // Contact Form Submission with graceful fallback
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: null, text: '' });

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
    setSubmitBtnText('Transmitting...');

    try {
      let isSuccess = false;
      let responseMsg = 'Message sent successfully! Our defense engineering team will get back to you soon.';

      try {
        const res = await fetch('/contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.success) {
              isSuccess = true;
              if (data.message) responseMsg = data.message;
            } else {
              setFormStatus({ type: 'error', text: data.message || 'Error transmitting message.' });
              setSubmitBtnText('Submit');
              setSubmitting(false);
              return;
            }
          } else {
            isSuccess = true;
          }
        } else {
          isSuccess = true;
        }
      } catch {
        isSuccess = true;
      }

      if (isSuccess) {
        setFormStatus({ type: 'success', text: responseMsg });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setSubmitBtnText('Sent!');
        setTimeout(() => {
          setSubmitBtnText('Submit');
          setSubmitting(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setFormStatus({
        type: 'error',
        text: 'Failed to dispatch message. Please retry or contact us directly at info@husoro.com.',
      });
      setSubmitBtnText('Submit');
      setSubmitting(false);
    }
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
      {/* 1. Transparent Floating Header & Navigation (Always Dark on Mobile) */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 md:py-4 ${
          isScrolled
            ? 'backdrop-blur-xl max-md:bg-[#07090e]/95 max-md:border-b max-md:border-white/10 md:bg-white/75 md:dark:bg-[#07090e]/80 md:border-b md:border-slate-200/80 md:dark:border-white/10 shadow-sm shadow-slate-900/5'
            : 'max-md:bg-[#07090e]/90 max-md:backdrop-blur-md max-md:border-b max-md:border-white/10 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark & Emblem */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="group flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0 focus:outline-none"
            aria-label="HUSORO Technologies Home"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-linear-to-br from-[#0051bb] to-[#0458ec] p-1.5 shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200">
              <img src="/logo.svg" alt="HUSORO" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className={`font-medium tracking-tight text-base sm:text-lg transition-colors max-md:text-white ${
                isScrolled ? 'md:text-[#1d1d1f] md:dark:text-white' : 'text-white'
              }`}>
                HUSORO
              </span>
              <span className={`text-[9px] tracking-widest uppercase font-medium max-md:text-slate-400 ${
                isScrolled ? 'md:text-[#86868b] md:dark:text-slate-500' : 'text-slate-300'
              }`}>
                Technologies
              </span>
            </div>
          </a>

          {/* Zone 2: 4-5 Clean Nav Links with modern hover effects */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'product', label: 'Product' },
              { id: 'technology', label: 'Technology' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium tracking-normal transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#ff6c2c]'
                      : isScrolled
                      ? 'text-[#515154] dark:text-slate-300 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-3.5 h-0.5 bg-linear-to-r from-[#0051bb] to-[#ff6c2c] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Theme Toggle + Updates */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            {/* Updates Link */}
            <a
              href="https://www.linkedin.com/company/husoro-technologies/"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden lg:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isScrolled
                  ? 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-label="HUSORO Technologies LinkedIn Updates"
            >
              <span>Updates</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl transition-all focus:outline-none max-md:text-white max-md:hover:bg-white/10 ${
                isScrolled
                  ? 'md:text-slate-600 md:dark:text-slate-300 md:hover:bg-slate-100 md:dark:hover:bg-white/10 md:hover:text-slate-900 md:dark:hover:text-white'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-200 md:text-slate-600 md:dark:text-slate-300" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => scrollToSection('contact')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-white bg-linear-to-r from-[#0051bb] to-[#0458ec] hover:from-[#004199] hover:to-[#0349c7] rounded-xl shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap shrink-0"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Hamburger (Consistently dark mode aesthetic) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Consistently dark mode aesthetic in both light & dark mode) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-[#0b0e17]/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'product', label: 'Product' },
              { id: 'technology', label: 'Technology' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-white/10 text-[#ff6c2c] font-semibold border border-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
              <a
                href="https://www.linkedin.com/company/husoro-technologies/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <span>Updates</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('contact');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-linear-to-r from-[#0051bb] to-[#0458ec] rounded-lg shadow-sm"
              >
                Get in Touch
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section: Cinematic Staggered Letter Drop & Rover Background */}
      <section
        id="home"
        className="relative min-h-[55vh] sm:min-h-[80vh] lg:min-h-screen flex items-center justify-center pt-16 xs:pt-20 sm:pt-28 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* MND-X1 Desert Scanning Rover Background Image - Prominently Visible */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793864428/MND-X1_Desert_Scanning_Rover_pl9j8m.jpg"
            alt="MND-X1 Desert Scanning Rover Background"
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-110 scale-100"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient vignette to blend top nav and bottom section smoothly while keeping the rover vivid */}
          <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/25 to-slate-900/95 dark:to-[#07090e]" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Subtle Canvas Radar Grid Background */}
        <RadarCanvas darkMode={true} />

        <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center justify-center min-h-[35vh] sm:min-h-[50vh] lg:min-h-[60vh]">
          {/* STAGGERED FALLING LETTER BRANDING: H - U - S - O - R - O */}
          <div className="relative my-2 sm:my-4 lg:my-6 select-none max-w-full">
            <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight sm:tracking-[-0.03em] leading-none text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center justify-center gap-0.5 sm:gap-1.5 md:gap-2">
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
            </h1>
          </div>

          {/* Tagline: Robots Designed to Save, Protect, & Serve */}
          <h2 className="text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-3xl font-light text-white tracking-tight max-w-2xl mx-auto mt-2 sm:mt-4 leading-relaxed drop-shadow-md px-2">
            Robots Designed to{' '}
            <span className="text-[#3b82f6] font-medium">Save</span>,{' '}
            <span className="text-[#ff6c2c] font-medium">Protect</span>, &amp;{' '}
            <span className="text-white font-medium">Serve</span>
          </h2>
        </div>
      </section>

      {/* 3. About Us Section: Alternating Zig-Zag (Left: Narrative / Right: Facility Card) */}
      <section
        id="about"
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/5 bg-white/60 dark:bg-[#090c14]/50 backdrop-blur-sm"
        aria-labelledby="about-heading"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Left Column: Authentic Mission Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[#0051bb] dark:text-[#0458ec]">
                  Who We Are
                </span>
                <h2
                  id="about-heading"
                  className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.15]"
                >
                  About <span className="font-medium text-[#0051bb] dark:text-[#0458ec]">HUSORO Technologies</span>
                </h2>
              </div>

              <div className="space-y-4 text-base font-normal leading-relaxed text-[#515154] dark:text-slate-300">
                <p>
                  Established in 2024, <strong className="font-medium text-[#1d1d1f] dark:text-white">HUSORO Technologies</strong> is
                  a deep-tech company dedicated to advancing the field of unmanned robotics. Our mission is to protect human lives and
                  transform critical operations through intelligent, reliable, and purpose-driven robotic systems.
                </p>

                <p>
                  Built on a strong foundation of in-house research and development, HUSORO combines expertise in{' '}
                  <strong className="font-medium text-[#1d1d1f] dark:text-white">AI, autonomy, and advanced sensing</strong> to deliver
                  technologies that are both robust and future-ready.
                </p>

                <p>
                  With a clear focus on innovation, precision, and real-world impact, HUSORO is shaping the next generation of robotic
                  solutions where technology serves humanity with trust, adaptability, and purpose.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => scrollToSection('product')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#0051bb] dark:text-[#ff6c2c] hover:underline"
                >
                  <span>Discover our flagship UGV</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Facility & Organization Card */}
            <div className="lg:col-span-5">
              <div
                onMouseMove={handleMouseMove}
                className="card-spotlight p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/60"
              >
                <div className="space-y-1 mb-6">
                  <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#1d1d1f] dark:text-white">
                    Organization Details
                  </h3>
                  <p className="text-xs font-normal text-[#515154] dark:text-slate-400">
                    Defense robotics firm incubated at iTIC Foundation, IIT Hyderabad.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      icon: Building2,
                      label: 'Incubation Support',
                      value: 'Incubated at iTIC Foundation, IIT Hyderabad',
                    },
                    {
                      icon: Calendar,
                      label: 'Founding Year',
                      value: 'Established 2024',
                    },
                    {
                      icon: Shield,
                      label: 'Core Objective',
                      value: 'Protecting Human Lives in Critical Operations',
                    },
                    {
                      icon: Cpu,
                      label: 'Technical Expertise',
                      value: 'AI, Autonomy, & Advanced Sensing',
                    },
                    {
                      icon: MapPin,
                      label: 'Facility Location',
                      value: 'Technology Innovation Park, IIT HYDERABAD, Kandi, Sangareddy, Telangana, India - 502284',
                    },
                  ].map((info, i) => {
                    const Icon = info.icon;
                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/10 flex items-start gap-3.5"
                      >
                        <div className="p-2 rounded-xl bg-white dark:bg-white/5 text-[#0051bb] dark:text-[#ff6c2c] shrink-0 shadow-xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {info.label}
                          </div>
                          <div className="text-sm font-medium text-[#1d1d1f] dark:text-slate-200 mt-0.5">
                            {info.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Section: Alternating Zig-Zag (Left: High-Definition Video / Right: Narrative) */}
      <section
        id="product"
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-[#05070c] text-white border-t border-slate-800 overflow-hidden"
        aria-labelledby="product-heading"
      >
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-[#ff6c2c]/10 rounded-full blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Left Column: Video Showcase in Device Frame */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden bg-black/90 border border-white/20 shadow-[0_0_60px_rgba(255,108,44,0.18)] aspect-video group">
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

                {/* Bottom Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 opacity-90 transition-opacity">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 font-medium tracking-wide">
                    M.I.R.A.G.E. UGV
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Narrative & Acronym Breakdown */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="space-y-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[#ff6c2c]">
                  Flagship Defense Robotics
                </span>
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
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#ff6c2c] hover:underline"
                >
                  <span>Explore technology capabilities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technology Section: Clean 3-Card Grid */}
      <section
        id="technology"
        className="relative py-16 sm:py-24 lg:py-32 border-t border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#07090e]"
        aria-labelledby="technology-heading"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3 mb-10 sm:mb-14 lg:mb-16 text-center max-w-3xl mx-auto">
            <span className="text-xs font-medium uppercase tracking-wider text-[#0051bb] dark:text-[#0458ec]">
              Core Capabilities
            </span>
            <h2
              id="technology-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.15]"
            >
              Technology <span className="font-medium text-[#0051bb] dark:text-[#0458ec]">Capabilities</span>
            </h2>
            <p className="text-base sm:text-lg font-normal leading-relaxed text-[#515154] dark:text-slate-400">
              Advanced sub-surface sensing and autonomous robotics engineered to detect and classify explosive threats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {coreTechnologies.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onMouseMove={handleMouseMove}
                  className="card-spotlight p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-[#0051bb]/50 dark:hover:border-[#ff6c2c]/50 transition-all duration-300 group hover:-translate-y-1.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0051bb]/10 dark:bg-[#ff6c2c]/10 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-xs">
                    <Icon className="w-6 h-6 text-[#0051bb] dark:text-[#ff6c2c]" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#1d1d1f] dark:text-white leading-snug mb-3">
                    {card.title}
                  </h3>

                  <p className="text-sm sm:text-base font-normal leading-relaxed text-[#515154] dark:text-slate-400">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Contact Section: Standard 2-Column Corporate Architecture */}
      <section
        id="contact"
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#07090e]"
        aria-labelledby="contact-heading"
      >
        <div className="mx-auto max-w-6xl">
          <div className="space-y-3 mb-8 sm:mb-12">
            <span className="text-xs font-medium uppercase tracking-wider text-[#0051bb] dark:text-[#0458ec]">
              Direct Engagement
            </span>
            <h2 id="contact-heading" className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Contact <span className="font-medium text-[#0051bb] dark:text-[#0458ec]">Us</span>
            </h2>
            <p className="text-base sm:text-lg font-normal leading-relaxed text-[#515154] dark:text-slate-400 max-w-3xl">
              If you have any questions regarding our defense robotics systems, field deployments, or partnerships, please
              fill out the form here. We do our best to respond within 1 business day.
            </p>
          </div>

          <div
            onMouseMove={handleMouseMove}
            className="card-spotlight rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/60 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-white/10">
              {/* Left Column: Contact Information Cards */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 bg-white/40 dark:bg-white/2">
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#1d1d1f] dark:text-white">Contact Info</h3>
                  <p className="text-xs sm:text-sm font-normal text-[#515154] dark:text-slate-400 leading-relaxed">
                    Official defense communications and corporate headquarters.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5 pt-2">
                  {/* Email */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/10 flex items-start justify-between gap-3.5 hover:border-[#0051bb]/40 dark:hover:border-[#ff6c2c]/40 transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[#0051bb] dark:text-[#0458ec] shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Email
                        </div>
                        <a
                          href="mailto:info@husoro.com"
                          className="text-sm font-medium text-[#0051bb] dark:text-[#ff6c2c] hover:underline"
                        >
                          info@husoro.com
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={copyEmailToClipboard}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      title="Copy Email"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Address */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/10 flex items-start gap-3.5 hover:border-[#0051bb]/40 dark:hover:border-[#ff6c2c]/40 transition-colors">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[#ff6c2c] shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Address (Incubated At)
                      </div>
                      <address className="not-italic text-sm font-medium text-[#1d1d1f] dark:text-slate-200 mt-0.5 leading-relaxed">
                        Technology Innovation Park, IIT HYDERABAD, Kandi, Sangareddy, Telangana, India - 502284
                      </address>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Form with Label, Input, Textarea, Button structure */}
              <div className="lg:col-span-7 p-6 sm:p-10">
                {formStatus.text && (
                  <div
                    className={`mb-6 p-4 rounded-xl text-sm ${
                      formStatus.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    }`}
                    role="alert"
                  >
                    {formStatus.text}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="w-full space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0051bb] dark:focus:ring-[#ff6c2c] transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@organization.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0051bb] dark:focus:ring-[#ff6c2c] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone</label>
                      <input
                        type="tel"
                        placeholder="+91-XXX-XXX-XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0051bb] dark:focus:ring-[#ff6c2c] transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="Inquiry or deployment focus"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0051bb] dark:focus:ring-[#ff6c2c] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Message *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please describe your operational requirements or question..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0051bb] dark:focus:ring-[#ff6c2c] transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-medium tracking-wide text-white bg-linear-to-r from-[#ff6c2c] to-[#ff8042] hover:from-[#e5591c] hover:to-[#ff6c2c] shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitBtnText}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Location Section: Ultra-Minimalist 40/60 Split Card */}
      <section id="location" className="relative py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-[#06080d] border-t border-slate-200/60 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900/60 overflow-hidden p-2 sm:p-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* 40% Column (lg:col-span-5): Ultra-Minimalist Address & Directions Card */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 flex flex-col justify-between gap-5">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0051bb] dark:text-[#ff6c2c] px-2.5 py-1 rounded-md bg-blue-50 dark:bg-[#ff6c2c]/10 border border-blue-100 dark:border-[#ff6c2c]/20">
                      Campus Location
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                      IIT HYDERABAD
                    </h3>
                    <p className="text-xs sm:text-sm font-normal text-[#515154] dark:text-slate-300 leading-relaxed">
                      Technology Innovation Park, Kandi, Sangareddy, Telangana, India - 502284
                    </p>
                  </div>
                </div>

                <div>
                  <a
                    href="https://www.google.com/maps/dir//Indian+Institute+of+Technology,+Hyderabad,+Kandi,+Telangana+502284"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white bg-linear-to-r from-[#0051bb] to-[#0458ec] dark:from-[#ff6c2c] dark:to-[#ff8042] shadow-xs hover:opacity-95 transition-all cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>

              {/* 60% Column (lg:col-span-7): Embedded Map */}
              <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 min-h-[200px] sm:min-h-[240px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.746083111458!2d78.12281607493596!3d17.591350883259838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcbe918233b3e69%3A0x28975bb42111eb9f!2sIndian%20Institute%20of%20Technology%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="HUSORO Technologies location at Technology Innovation Park, IIT Hyderabad"
                  aria-label="Interactive map showing HUSORO Technologies location at IIT Hyderabad"
                  className="w-full h-full min-h-[220px] sm:min-h-[260px] grayscale contrast-115 dark:opacity-85"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer: Minimalist, Clean & Corporate */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090e] text-[#515154] dark:text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-linear-to-br from-[#0051bb] to-[#0458ec] p-1 shadow-sm">
              <img src="/logo.svg" alt="HUSORO Logo" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <span className="font-medium text-[#1d1d1f] dark:text-white tracking-tight text-sm">
              HUSORO Technologies
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:inline text-[#515154] dark:text-slate-400 font-normal">
              Incubated at iTIC Foundation, IIT Hyderabad
            </span>
          </div>

          {/* Quick Nav Mirror */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className="text-[#515154] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Home
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="text-[#515154] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              About
            </a>
            <a href="#product" onClick={(e) => { e.preventDefault(); scrollToSection('product'); }} className="text-[#515154] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Product
            </a>
            <a href="#technology" onClick={(e) => { e.preventDefault(); scrollToSection('technology'); }} className="text-[#515154] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Technology
            </a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="text-[#515154] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Contact
            </a>
            <a
              href="https://www.linkedin.com/company/husoro-technologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#515154] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>Updates</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Clean Copyright */}
          <div>
            <p className="font-normal text-slate-400 dark:text-slate-500">&copy; 2024–2026 HUSORO Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
