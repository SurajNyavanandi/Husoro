import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkNavbar, setDarkNavbar] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalCards = 3;

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitBtnText, setSubmitBtnText] = useState('Submit');

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number>(0);

  // Sync dark mode class on document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Navbar background check on scroll
  useEffect(() => {
    const handleScroll = () => {
      const productElem = document.getElementById('product');
      const techElem = document.getElementById('technology');

      let isDarkSection = false;
      const scrollPos = window.scrollY + 100;

      if (productElem) {
        const top = productElem.offsetTop;
        const bottom = top + productElem.offsetHeight;
        if (scrollPos >= top && scrollPos <= bottom) {
          isDarkSection = true;
        }
      }

      if (techElem) {
        const top = techElem.offsetTop;
        const bottom = top + techElem.offsetHeight;
        if (scrollPos >= top && scrollPos <= bottom) {
          isDarkSection = true;
        }
      }

      setDarkNavbar(isDarkSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for product video autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch((err) => console.log('Initial video play attempt:', err));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch((err) => console.log('Autoplay prevented:', err));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Carousel autoplay
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalCards);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  // Desktop floating particles
  useEffect(() => {
    if (window.innerWidth <= 768) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      const size = Math.random() * 3 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      particlesContainer.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 25000);
    };

    for (let i = 0; i < 15; i++) {
      setTimeout(createParticle, i * 1000);
    }

    const interval = setInterval(createParticle, 2000);

    return () => {
      clearInterval(interval);
      if (particlesContainer.parentNode) {
        particlesContainer.parentNode.removeChild(particlesContainer);
      }
    };
  }, []);

  // Carousel translateX calculation
  const getCarouselTransform = () => {
    const isMobile = window.innerWidth <= 768;
    const cardWidth = isMobile ? Math.min(window.innerWidth * 0.8, 350) + 30 : 830;
    const viewportWidth = window.innerWidth;
    const cardActualWidth = isMobile ? Math.min(window.innerWidth * 0.8, 350) : 800;
    const viewportCenter = viewportWidth / 3 + cardActualWidth * 0.9;
    const cardCenter = cardActualWidth / 2;
    const slideOffset = currentSlide * cardWidth;
    return viewportCenter - cardCenter - slideOffset;
  };

  const [translateX, setTranslateX] = useState(getCarouselTransform());

  useEffect(() => {
    const updateTransform = () => {
      setTranslateX(getCarouselTransform());
    };
    updateTransform();
    window.addEventListener('resize', updateTransform);
    return () => window.removeEventListener('resize', updateTransform);
  }, [currentSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - endX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentSlide < totalCards - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (diffX < 0 && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    }
  };

  // Contact Form Submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: null, text: '' });

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormStatus({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setSubmitting(true);
    setSubmitBtnText('Sending...');

    try {
      const res = await fetch('/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setFormStatus({ type: 'success', text: data.message });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSubmitBtnText('Sent!');
        setTimeout(() => {
          setSubmitBtnText('Submit');
          setSubmitting(false);
        }, 3000);
      } else {
        setFormStatus({ type: 'error', text: data.message || 'Error sending message.' });
        setSubmitBtnText('Submit');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setFormStatus({
        type: 'error',
        text: 'Failed to send message. Please try again or email us directly.',
      });
      setSubmitBtnText('Submit');
      setSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div className="wave-overlay"></div>

      {/* Top Left Logo */}
      <a
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('home');
        }}
        className="logo-container"
        aria-label="HUSORO Technologies Home"
      >
        <img src="/logo.svg" alt="HUSORO Technologies Logo" className="logo" />
        <span className="logo-text">HUSORO</span>
      </a>

      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <ul className={`nav-menu ${darkNavbar ? 'dark-bg' : ''} ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className="nav-link"
            >
              Home
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              className="nav-link"
            >
              About
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#product"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('product');
              }}
              className="nav-link"
            >
              Product
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              className="nav-link"
            >
              Contact
            </a>
          </li>
          <li className="nav-item">
            <a
              href="https://www.linkedin.com/company/husoro-technologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Updates
            </a>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </nav>

      {/* Hero Section */}
      <header id="home" className="animated-container">
        <main className="main-content">
          <section className="section">
            <div className="center-layout">
              <div className="left-content">
                <img src="/logo.svg" alt="HUSORO Technologies Company Logo" className="center-logo" />
                <h1 className="center-husoro">HUSORO</h1>
              </div>
              <div className="right-content">
                <h2 className="tagline">
                  Robots Designed to
                  <br /> Save, Protect, & Serve
                </h2>
              </div>
            </div>
          </section>
        </main>
      </header>

      {/* About Section */}
      <section id="about" className="full-height-section" aria-labelledby="about-heading">
        <div className="about-container">
          <div className="about-left">
            <h2 id="about-heading" className="about-title">
              <span className="about-small">About</span>
              <br />
              <span className="husoro-blue">HUSORO</span>
            </h2>
          </div>
          <div className="about-right">
            <div className="about-description">
              <p>
                Established in 2024, <strong>HUSORO Technologies</strong> is a deep-tech company dedicated to
                advancing the field of <strong>unmanned robotics</strong>. Our mission is to{' '}
                <strong>protect human lives</strong> and transform critical operations through intelligent, reliable,
                and purpose-driven robotic systems.
              </p>
              <p>
                Built on a strong foundation of in-house research and development, HUSORO combines expertise in{' '}
                <strong>AI, autonomy, and advanced sensing</strong> to deliver technologies that are both robust and
                future-ready.
              </p>
              <p>
                With a clear focus on innovation, precision, and real-world impact, HUSORO is shaping the next
                generation of <strong>robotic solutions</strong> where technology serves humanity with trust,
                adaptability, and purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="product-section" aria-labelledby="product-heading">
        <div className="product-container">
          <h2 id="product-heading" className="product-title">
            <span className="product-small">Product</span>
            <br />
            <span className="mirage-orange">M.I.R.A.G.E.</span>
          </h2>
          <div className="product-description">
            <h3 className="mirage-subtitle">
              <span className="first-letter">M</span>inefield <span className="first-letter">I</span>ntelligent{' '}
              <span className="first-letter">R</span>adar and <span className="first-letter">A</span>utonomous{' '}
              <span className="first-letter">G</span>round <span className="first-letter">E</span>xplorer
            </h3>
            <p className="mirage-details">
              <strong>M.I.R.A.G.E.</strong> is an advanced <strong>military-grade UGV</strong> engineered for
              intelligent <strong>landmine detection and classification</strong>. It employs{' '}
              <strong>sensor fusion technology</strong>, combining data from multiple sensors and advanced radar systems
              to accurately identify buried threats in real time. Designed for reliability in challenging terrains,
              M.I.R.A.G.E enhances operational safety, precision, and efficiency in{' '}
              <strong>demining missions</strong>.
            </p>
          </div>
          <div className="video-container">
            <video
              ref={videoRef}
              className="intro-video"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="M.I.R.A.G.E. product demonstration video"
            >
              <source src="https://res.cloudinary.com/dfr0zghtc/video/upload/v1793773090/intro_video_y9ppov.mp4" type="video/mp4" />
              <source src="/intro_video.mp4" type="video/mp4" />
              <p>
                Your browser does not support the video tag.{' '}
                <a href="https://res.cloudinary.com/dfr0zghtc/video/upload/v1793773090/intro_video_y9ppov.mp4" target="_blank" rel="noreferrer">
                  Download the video
                </a>{' '}
                to view M.I.R.A.G.E. in action.
              </p>
            </video>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="technology-section" aria-labelledby="technology-heading">
        <div className="technology-container">
          <h2 id="technology-heading" className="sr-only">
            Technology Features
          </h2>
          <div
            className="cards-container"
            id="cards-container"
            role="region"
            aria-label="Technology features carousel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="cards-wrapper">
              <div
                className="cards-slider"
                id="cards-slider"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition: 'transform 0.5s ease',
                }}
              >
                <article className="tech-card" data-index="0">
                  <h3>Real-Time Landmine Detection</h3>
                  <p>Advanced radar systems detect buried explosive devices with high precision and accuracy.</p>
                </article>
                <article className="tech-card" data-index="1">
                  <h3>Advanced Sensor Fusion Technology</h3>
                  <p>Multiple sensor data combined for enhanced threat identification and reduced false positives.</p>
                </article>
                <article className="tech-card" data-index="2">
                  <h3>Dual-Mode Operation: Autonomous & Manual</h3>
                  <p>Flexible operation modes for different mission requirements and terrain conditions.</p>
                </article>
              </div>
            </div>
          </div>
          <div className="card-dots" role="tablist" aria-label="Technology feature navigation">
            {[0, 1, 2].map((slideIndex) => (
              <button
                key={slideIndex}
                className={`dot ${currentSlide === slideIndex ? 'active' : ''}`}
                onClick={() => setCurrentSlide(slideIndex)}
                role="tab"
                aria-selected={currentSlide === slideIndex}
                aria-label={`Slide ${slideIndex + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section" aria-labelledby="contact-heading">
        <div className="contact-container">
          <h2 id="contact-heading" className="contact-title">
            Contact
          </h2>

          <div className="contact-content">
            <div className="contact-form-container">
              {formStatus.text && (
                <div className={`form-message ${formStatus.type}`} style={{ marginBottom: '15px' }}>
                  {formStatus.text}
                </div>
              )}

              <form className="contact-form" onSubmit={handleContactSubmit} aria-label="Contact form">
                <label htmlFor="name" className="sr-only">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Name"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <label htmlFor="email" className="sr-only">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  className="form-input"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <label htmlFor="subject" className="sr-only">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Subject"
                  className="form-input"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                <label htmlFor="message" className="sr-only">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Message"
                  className="form-textarea"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                  style={{
                    backgroundColor: submitting
                      ? '#6c757d'
                      : submitBtnText === 'Sent!'
                      ? '#28a745'
                      : '#ff6c2c',
                  }}
                >
                  {submitBtnText}
                </button>
              </form>
            </div>

            <div className="contact-divider" aria-hidden="true">
              <div className="divider-line"></div>
              <span className="divider-text">OR</span>
              <div className="divider-line"></div>
              <div className="divider-dot"></div>
            </div>

            <div className="contact-info">
              <p className="email-label">Email us at</p>
              <a href="mailto:info@husoro.com" className="email-link" aria-label="Send email to info@husoro.com">
                info@husoro.com
              </a>

              <address className="corporate-office">
                <h3 className="office-title">Corporate Office</h3>
                <p className="office-address">
                  Plot no. 24 & 25, Road no. 9, Kakatiya Hills,
                  <br /> Jubilee Hills, Hyderabad, India 500081
                </p>
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="location-section" aria-labelledby="location-heading">
        <h2 id="location-heading" className="sr-only">
          Our Location
        </h2>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d266.72235359918153!2d78.39691160365606!3d17.44263243705808!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90cdcee40001%3A0x8679dc09ba021d68!2sProsync%20Consulting!5e0!3m2!1sen!2sin!4v1762513935672!5m2!1sen!2sin"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="HUSORO Technologies office location in Jubilee Hills, Hyderabad"
            aria-label="Interactive map showing HUSORO Technologies office location"
          ></iframe>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src="/logo.svg" alt="HUSORO Technologies Logo" className="footer-logo-img" />
              <span className="footer-logo-text">HUSORO</span>
            </div>
            <nav className="footer-links" aria-label="Footer navigation">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('home');
                }}
                className="footer-link"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about');
                }}
                className="footer-link"
              >
                About
              </a>
              <a
                href="#product"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('product');
                }}
                className="footer-link"
              >
                Product
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}
                className="footer-link"
              >
                Contact
              </a>
            </nav>
            <div className="footer-info">
              <p>
                &copy; 2024 <strong>HUSORO Technologies</strong>. All rights reserved.
              </p>
            </div>
            <div className="theme-toggle-container">
              <button
                id="theme-toggle"
                className="theme-toggle-btn"
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                <span className="toggle-text">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
