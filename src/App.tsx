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
  Maximize,
  Minimize,
  Copy,
} from 'lucide-react';

const BRAND_LOGO = 'https://res.cloudinary.com/dfr0zghtc/image/upload/v1794060891/Gemini_Generated_Image_tatgbctatgbctatg_kltjho.jpg';

// WhatsApp number for inquiry redirection (can be updated with official number)
const WHATSAPP_NUMBER = '919876543210';

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
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const [submitBtnText, setSubmitBtnText] = useState('Send Message');

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

  // Track fullscreen changes across standard and vendor prefixes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const video = videoRef.current;
    const onWebkitBegin = () => setIsFullscreen(true);
    const onWebkitEnd = () => setIsFullscreen(false);
    if (video) {
      video.addEventListener('webkitbeginfullscreen', onWebkitBegin);
      video.addEventListener('webkitendfullscreen', onWebkitEnd);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', onWebkitBegin);
        video.removeEventListener('webkitendfullscreen', onWebkitEnd);
      }
    };
  }, []);

  // Toggle video full screen across desktop and mobile devices
  const toggleFullscreen = async () => {
    const container = videoContainerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const isCurrentlyFs = !!(
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
    );

    if (isCurrentlyFs) {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    } else {
      // Desktop / Android fullscreen request on the container
      if (container.requestFullscreen) {
        try {
          await container.requestFullscreen();
          setIsFullscreen(true);
          return;
        } catch {
          // fallback to video element
        }
      } else if ((container as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        try {
          await (container as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
          setIsFullscreen(true);
          return;
        } catch {
          // fallback to video element
        }
      }

      // iOS Safari fallback (only video elements can go fullscreen on iPhone)
      const webkitVideo = video as unknown as {
        webkitEnterFullscreen?: () => void;
      };
      if (webkitVideo.webkitEnterFullscreen) {
        webkitVideo.webkitEnterFullscreen();
      } else if (video.requestFullscreen) {
        await video.requestFullscreen().catch(() => {});
      }
    }
  };

  // Contact Form Submission with WhatsApp redirection
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: null, text: '' });
    setWhatsappRedirectUrl(null);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormStatus({ type: 'error', text: 'Please fill in your name, email, subject, and message.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSubmitting(true);
    setSubmitBtnText('Sending...');

    // Format all inquiry fields for WhatsApp
    const whatsappText =
      `*New Message - HUSORO Technologies*\n\n` +
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
      text: 'Opening WhatsApp with your message ready...',
    });

    // Directly redirect to WhatsApp
    setTimeout(() => {
      window.location.href = targetUrl;
      setSubmitBtnText('Message Sent');
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

  // Core technologies explained in plain, simple English
  const coreTechnologies = [
    {
      title: 'Radar That Sees Underground',
      description: 'Scans beneath the soil to spot hidden plastic and metal landmines without touching them.',
      icon: Radar,
    },
    {
      title: 'Smart Sensor Fusion',
      description: 'Combines radar and sensors so the robot clearly identifies real threats and avoids false alarms from rocks or trash.',
      icon: Layers,
    },
    {
      title: 'Drives Autonomously or by Remote',
      description: 'Can drive itself across rocks, sand, and rough dirt, or be driven safely by an operator from a distance.',
      icon: Radio,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 selection:bg-[#ff6c2c]/30 selection:text-white transition-colors duration-300 relative overflow-x-hidden font-sans">
      {/* 1. Floating Frosted-Glass Header Pill (21st.dev / Tailwind UI Pattern) */}
      <div className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <header
          className={`max-w-6xl mx-auto pointer-events-auto rounded-2xl transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 ${
            isScrolled || mobileMenuOpen
              ? 'bg-[#080d1a]/55 backdrop-blur-md border border-white/10 shadow-xl'
              : 'bg-transparent border-0 shadow-none backdrop-blur-none'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left Group: Brand Logo & Left-Aligned Nav Links (Silhouetted over Dark Antenna Area) */}
            <div className="flex items-center gap-6 lg:gap-10">
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
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-200 shrink-0">
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
                  <span className="font-extrabold tracking-tight text-base sm:text-lg font-ubuntu bg-linear-to-r from-amber-100 via-[#ffd285] to-[#ff8c42] bg-clip-text text-transparent drop-shadow-sm">
                    HUSORO
                  </span>
                </div>
              </a>

              {/* Zone 2: Navigation Links Moved to the Left next to HUSORO */}
              <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5 bg-transparent border-0 p-0">
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
                      className={`relative px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold tracking-normal transition-all whitespace-nowrap shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
                        isScrolled
                          ? isActive
                            ? 'bg-amber-400/20 text-[#ffd285] shadow-xs border border-amber-400/30 backdrop-blur-xs'
                            : 'text-amber-100/85 hover:text-white hover:bg-white/10'
                          : isActive
                            ? 'text-transparent bg-linear-to-r from-[#ffd285] to-[#ff8c42] bg-clip-text font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] after:content-[\'\'] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-linear-to-r after:from-[#ffd285] after:to-[#ff8c42] after:rounded-full after:shadow-sm'
                            : 'text-amber-100/90 hover:text-white transition-colors'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Zone 3: Mobile Toggle */}
            <div className="flex md:hidden items-center shrink-0">
              {/* Mobile Menu Hamburger with 44px touch target */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-w-11 min-h-11 flex items-center justify-center p-2 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 drop-shadow-sm cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu: Seamlessly part of the single outer frosted card */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-white/10 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
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
                    className={`px-3 py-2.5 min-h-11 flex items-center rounded-xl text-base transition-colors ${
                      isActive
                        ? 'bg-amber-400/10 text-transparent bg-linear-to-r from-[#ffd285] to-[#ff8c42] bg-clip-text font-bold border border-amber-400/25'
                        : 'text-amber-100/90 hover:text-white hover:bg-white/5 active:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-[#ffd285] to-[#ff8c42] shadow-[0_0_8px_#ffd285]" />
                      )}
                      <span>{item.label}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </header>
      </div>

      {/* 2. Hero Section: Cinematic Flexible Sentence Rover Background */}
      <section
        id="home"
        className="relative min-h-[52vh] sm:min-h-[64vh] lg:min-h-[72vh] flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 overflow-hidden"
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
            className="w-full h-full object-cover object-center filter brightness-100 contrast-105 scale-100"
            referrerPolicy="no-referrer"
          />

          {/* Tactical Blue Ambient Light Field (Left) */}
          <div
            className="absolute -top-24 -left-24 w-70 sm:w-120 md:w-145 h-70 sm:h-120 md:h-145 bg-linear-to-br from-[#0051bb]/45 via-[#0458ec]/30 to-transparent rounded-full blur-[90px] sm:blur-[110px] pointer-events-none mix-blend-screen animate-pulse-slow-blue"
            aria-hidden="true"
          />

          {/* Defense Radar Orange Glow Flare (Right) */}
          <div
            className="absolute top-1/4 -right-20 w-65 sm:w-110 md:w-135 h-65 sm:h-110 md:h-135 bg-linear-to-bl from-[#ff6c2c]/40 via-[#ff8042]/25 to-transparent rounded-full blur-[90px] sm:blur-[110px] pointer-events-none mix-blend-screen animate-pulse-slow-orange"
            aria-hidden="true"
          />

          {/* Optical Scanning Light Beam (Vertical Radar Sweep) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="w-full h-20 sm:h-24 bg-linear-to-b from-transparent via-[#0458ec]/20 to-[#ff6c2c]/15 animate-scanline-sweep blur-sm" />
          </div>

          {/* Angled High-Tech Shimmer Light Beam */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="w-1/3 h-[200%] bg-linear-to-r from-transparent via-cyan-400/20 to-transparent animate-beam-sweep blur-md" />
          </div>

          {/* Edge blend into lower section with zero top darkening under the header */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Subtle Canvas Radar Grid Background */}
        <RadarCanvas darkMode={true} />

        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center md:justify-end">
          <div className="w-full md:max-w-xl lg:max-w-2xl text-center md:text-left filter drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]">
            <h1 className="font-ubuntu text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none uppercase bg-linear-to-r from-amber-100 via-[#ffd285] to-[#ff8c42] bg-clip-text text-transparent mb-2 sm:mb-3">
              ROBOTS
            </h1>
            <p className="font-ubuntu text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight uppercase text-amber-100/95 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              DESIGNED TO SAVE, PROTECT, &amp; SERVE
            </p>
          </div>
        </div>
      </section>

      {/* 2. About Us Section */}
      <section
        id="about"
        className="relative py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#07090e] text-white overflow-hidden"
        aria-labelledby="about-heading"
      >
        {/* Subtle background ambient radial glow */}
        <div
          className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-blue-500/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl text-center space-y-4 sm:space-y-6">
          <h2
            id="about-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight"
          >
            About <span className="text-[#3b82f6]">HUSORO</span>
          </h2>

          <div className="space-y-4 text-sm sm:text-base font-normal leading-relaxed text-slate-300 max-w-3xl mx-auto">
            <p>
              <strong className="font-semibold text-white">Husoro Technologies</strong> is a deep-tech robotics company building autonomous ground vehicles for defense and high-risk operations.
            </p>

            <p>
              We develop the full stack — mobility, perception, AI, and intelligent sensing — to deploy where human presence is dangerous, inefficient, or impossible.
            </p>

            <p>
              Our first platform, <strong className="font-semibold text-white">M.I.R.A.G.E.</strong>, targets landmine and UXO detection. It is the first of a portfolio of purpose-built UGVs Husoro is developing for real-world defence and critical-use applications.
            </p>

            <p className="text-slate-200">
              Incubated at <span className="text-[#3b82f6] font-medium">iTIC–TiHAN, IIT Hyderabad</span>, we are developing robotics from India for challenges that matter globally.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Product Section: Alternating Zig-Zag (Video Left, Product Specs Right) */}
      <section
        id="product"
        className="relative py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 border-b border-slate-200/90 overflow-hidden"
        aria-labelledby="product-heading"
      >
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-120 sm:w-175 h-90 sm:h-125 bg-[#ff6c2c]/5 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Full-Width Cinematic Video Showcase Card (Desktop & Mobile) */}
          <div className="w-full">
            <div
              ref={videoContainerRef}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black/95 border border-white/15 shadow-[0_0_70px_rgba(255,108,44,0.22)] aspect-video w-full group before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[#ff6c2c]/40 before:to-transparent [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:shadow-none [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:bg-black"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover group-[:fullscreen]:object-contain"
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
              <div className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 flex items-center bg-black/75 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/15 shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="min-w-9 min-h-9 p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="min-w-9 min-h-9 p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="min-w-9 min-h-9 p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    title={isFullscreen ? 'Exit fullscreen' : 'Full screen'}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Minimalist Product Description Below the Video */}
          <div className="max-w-3xl mx-auto text-center mt-8 sm:mt-12 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6c2c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6c2c]" />
              <span>Flagship Landmine-Finding Rover</span>
            </div>

            <h2 id="product-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Product <span className="text-[#ff6c2c]">M.I.R.A.G.E.</span>
            </h2>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide uppercase">
              <span className="text-[#ff6c2c]">M</span>inefield{' '}
              <span className="text-[#ff6c2c]">I</span>ntelligent{' '}
              <span className="text-[#ff6c2c]">R</span>adar and{' '}
              <span className="text-[#ff6c2c]">A</span>utonomous{' '}
              <span className="text-[#ff6c2c]">G</span>round{' '}
              <span className="text-[#ff6c2c]">E</span>xplorer
            </p>

            <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-600 max-w-2xl mx-auto">
              M.I.R.A.G.E. is an autonomous military-grade UGV built for real-time landmine detection and subsurface hazard classification, utilizing ground-penetrating radar to safeguard defense and humanitarian operations without human risk.
            </p>

            <div className="pt-2">
              <button
                onClick={() => scrollToSection('technology')}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#ff6c2c] hover:text-[#ff8042] transition-colors cursor-pointer"
              >
                <span>See how the technology works</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technology Section: Trending Asymmetric 21st.dev Bento Grid */}
      <section
        id="technology"
        className="relative py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#07090e] text-white overflow-hidden"
        aria-labelledby="technology-heading"
      >
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="space-y-2.5 sm:space-y-3 text-center max-w-3xl mx-auto">
            <h2
              id="technology-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight"
            >
              Technology <span className="text-[#3b82f6]">Capabilities</span>
            </h2>
            <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-300 max-w-2xl mx-auto">
              Smart sensors and self-driving robots built to find hidden explosives and protect lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {coreTechnologies.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onMouseMove={handleMouseMove}
                  className="card-spotlight relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0d121f]/90 backdrop-blur-xl border border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1 sm:hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[#3b82f6]/40 before:to-transparent"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 text-[#3b82f6] group-hover:scale-110 group-hover:border-orange-500/40 group-hover:text-[#ff6c2c] group-hover:bg-orange-500/10 transition-all duration-300 shadow-xs">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white leading-snug mb-2 group-hover:text-[#3b82f6] transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-xs sm:text-sm lg:text-base font-normal leading-relaxed text-slate-400">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Contact Section */}
      <section
        id="contact"
        className="relative py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#07090e] text-slate-100 overflow-hidden"
        aria-labelledby="contact-heading"
      >
        {/* Subtle Ambient Radial Glow Container */}
        <div
          className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-[#ff6c2c]/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <h2 id="contact-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              Contact <span className="text-[#3b82f6]">Us</span>
            </h2>
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
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-3 sm:px-4 sm:py-3 rounded-xl bg-[#080c14]/90 border border-slate-700/60 hover:border-slate-600 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/25 text-white text-base sm:text-sm placeholder:text-slate-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-300">Phone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="Your phone number"
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
                        placeholder="What would you like to discuss?"
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
                      placeholder="Tell us about your project, questions, or how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-3 sm:px-4 sm:py-3 rounded-xl bg-[#080c14]/90 border border-slate-700/60 hover:border-slate-600 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/25 text-white text-base sm:text-sm placeholder:text-slate-500 transition-all outline-none resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-12 rounded-xl text-sm font-semibold tracking-wide text-white bg-linear-to-r from-[#ff6c2c] to-[#ff8042] hover:from-[#e5591c] hover:to-[#ff6c2c] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitBtnText}</span>
                  </button>
                </form>
              </div>

              {/* Right Column (lg:col-span-5): Contact Information Cards */}
              <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 bg-white/2 flex flex-col justify-between">
                <div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">Get in Touch</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3.5 pt-3 sm:pt-4">
                    {/* Email */}
                    <div className="group p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#090d16]/90 border border-slate-800/80 hover:border-blue-500/40 hover:bg-[#0c121e] transition-all flex items-center justify-between gap-3 sm:gap-3.5">
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#3b82f6] group-hover:scale-105 group-hover:text-blue-400 transition-all shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
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
                        className="min-w-9 min-h-9 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
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
                      <div className="min-w-0 flex-1">
                        <address className="not-italic text-xs sm:text-sm font-medium text-slate-200 leading-relaxed wrap-break-word">
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

      {/* Footer: Clean Minimalist White Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-200/90 bg-white text-slate-600 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Logo & Brand Wordmark */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg overflow-hidden bg-black border border-slate-200 shadow-xs shrink-0">
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
              <span className="font-bold text-slate-900 tracking-tight text-sm font-ubuntu">
                HUSORO
              </span>
            </div>
          </div>

          {/* Quick Nav Mirror with touch-friendly spacing */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 sm:gap-5 font-medium text-xs sm:text-sm">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className="p-1 text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="p-1 text-slate-600 hover:text-slate-900 transition-colors">
              About
            </a>
            <a href="#product" onClick={(e) => { e.preventDefault(); scrollToSection('product'); }} className="p-1 text-slate-600 hover:text-slate-900 transition-colors">
              Product
            </a>
            <a href="#technology" onClick={(e) => { e.preventDefault(); scrollToSection('technology'); }} className="p-1 text-slate-600 hover:text-slate-900 transition-colors">
              Technology
            </a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="p-1 text-slate-600 hover:text-slate-900 transition-colors">
              Contact
            </a>
            <a
              href="https://www.linkedin.com/company/husoro-technologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
            >
              LinkedIn
            </a>
          </div>

          {/* Clean Copyright */}
          <div>
            <p className="font-normal text-slate-500 text-[11px] sm:text-xs">&copy; 2024 HUSORO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
