import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import heroBg from '../assets/hero-bg.jpg';
import durgaImg from '../assets/durga.png';
import trishulImg from '../assets/trishul.png';
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpg';
import slide3 from '../assets/slide3.jpg';
import slide4 from '../assets/slide4.jpg';
import slide5 from '../assets/slide5.jpg';
import tradition from '../assets/tradition.jpg';
const slides = [slide1, slide2, slide3, slide4, slide5];

const pujadays = [
  { name: 'Mahalaya', nameBn: 'মহালয়া', date: '02 Oct', color: '#C0392B' },
  { name: 'Maha Panchami', nameBn: 'মহা পঞ্চমী', date: '06 Oct', color: '#922b21' },
  { name: 'Maha Sasthi', nameBn: 'মহা ষষ্ঠী', date: '09 Oct', color: '#C0392B' },
  { name: 'Maha Saptami', nameBn: 'মহা সপ্তমী', date: '10 Oct', color: '#922b21' },
  { name: 'Maha Astami', nameBn: 'মহা অষ্টমী', date: '11 Oct', color: '#C0392B' },
  { name: 'Maha Navami', nameBn: 'মহা নবমী', date: '12 Oct', color: '#922b21' },
  { name: 'Maha Dashami', nameBn: 'মহা দশমী', date: '13 Oct', color: '#C0392B', wide: true },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sponsors, setSponsors] = useState([]);
  const [settings, setSettings] = useState({});
  const [gallery, setGallery] = useState([]);
  const [events, setEvents] = useState([]);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // ── Countdown logic ──────────────────────────────
  const PUJA_DAYS = [
    { key: 'dateMailaya',  label: 'Mahalaya',      labelBn: 'মহালয়া' },
    { key: 'datePanchami', label: 'Maha Panchami', labelBn: 'মহা পঞ্চমী' },
    { key: 'dateSasthi',   label: 'Maha Sasthi',   labelBn: 'মহা ষষ্ঠী' },
    { key: 'dateSaptami',  label: 'Maha Saptami',  labelBn: 'মহা সপ্তমী' },
    { key: 'dateAstami',   label: 'Maha Astami',   labelBn: 'মহা অষ্টমী' },
    { key: 'dateNavami',   label: 'Maha Navami',   labelBn: 'মহা নবমী' },
    { key: 'dateDashami',  label: 'Maha Dashami',  labelBn: 'মহা দশমী' },
  ];

  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!settings || !Object.keys(settings).length) return;

    const computeCountdown = () => {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      // Check if today IS a puja day
      const todayDay = PUJA_DAYS.find(d => settings[d.key] === todayStr);
      if (todayDay) {
        setCountdown({ type: 'today', label: todayDay.label, labelBn: todayDay.labelBn });
        return;
      }

      // Find next upcoming puja day
      const upcoming = PUJA_DAYS
        .filter(d => settings[d.key] && settings[d.key] > todayStr)
        .sort((a, b) => settings[a.key].localeCompare(settings[b.key]))[0];

      if (!upcoming) {
        setCountdown({ type: 'none' });
        return;
      }

      const target = new Date(settings[upcoming.key] + 'T00:00:00');
      const diff = target - now;
      if (diff <= 0) { setCountdown({ type: 'today', label: upcoming.label, labelBn: upcoming.labelBn }); return; }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ type: 'countdown', label: upcoming.label, labelBn: upcoming.labelBn, days, hours, minutes, seconds, dateStr: settings[upcoming.key] });
    };

    computeCountdown();
    countdownRef.current = setInterval(computeCountdown, 1000);
    return () => clearInterval(countdownRef.current);
  }, [settings]);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
    api.get('/sponsors').then(r => setSponsors(r.data)).catch(() => {});
    api.get('/gallery?limit=6').then(r => setGallery(r.data.slice(0, 6))).catch(() => {});
    api.get('/events').then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Interactive 3-Card Scroll Showcase ──
  const showcaseRef = useRef(null);
  const [showcaseStep, setShowcaseStep] = useState(0);

  const DEFAULT_SHOWCASE_CARDS = [
    { imageUrl: durgaImg, title: 'মা দুর্গার প্রতিমা দর্শন', description: 'ঐতিহ্যবাহী শারদীয় দুর্গোৎসবের শুভ আগমন' },
    { imageUrl: trishulImg, title: 'মহিষাসুরমর্দিনী শক্তি', description: 'শুভ শক্তির বিজয় ও অশুভ শক্তির বিনাশ' },
    { imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop', title: 'মহালয়ার পূত প্রভাত', description: 'শরৎশুভ্র আগমনী সুর ও শুভ আবাহন' },
    
    { imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=800&auto=format&fit=crop', title: 'কাশফুলের শুভ্রতা', description: 'শরতের মেঘ ও কাশফুলের অপার দোলা' },
    { imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop', title: 'ঢাক ও কাঁসরের ধ্বনি', description: 'পুজোর তালে তালে মেতে ওঠা আনন্দ' },
    { imageUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?q=80&w=800&auto=format&fit=crop', title: 'সন্ধি পূজার প্রদীপ', description: '১০৮ পদ্ম ও প্রদীপের মাঙ্গলিক আলো' },
    
    { imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', title: 'ধুনুচি নাচ ও আনন্দ', description: 'ঐতিহ্যবাহী শারদীয় নৃত্যের উৎসব' },
    { imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', title: 'মহা অষ্টমীর অঞ্জলি', description: 'ভক্তি ও শ্রদ্ধায় পুষ্পাঞ্জলি নিবেদন' },
    { imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop', title: 'ভোগ ও প্রসাদ বিতরণ', description: 'সকল ভক্তদের জন্য মহাপ্রসাদ সেবন' },

    { imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop', title: 'সাংস্কৃতিক সন্ধ্যা', description: 'সঙ্গীত, নাটক ও সংস্কৃতির মেলবন্ধন' },
    { imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop', title: 'আলোকসজ্জা ও পরিবেশ', description: 'রোশনাইয়ে মোড়া উৎসবের আঙিনা' },
    { imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop', title: 'পারিবারিক মিলনমেলা', description: 'প্রজন্মের পর প্রজন্ম ধরে একত্রিত আনন্দ' },

    { imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop', title: 'সিঁদুর খেলা', description: 'বিজয়ার মিষ্টি মুখ ও সোহাগের রঙ' },
    { imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop', title: 'প্রতিমা নিরঞ্জন', description: 'আসছে বছর আবার হবে প্রীতির প্রতিশ্রুতি' },
    { imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop', title: 'শুভ বিজয়া প্রীতি', description: 'জ্যেষ্ঠদের প্রণাম ও কনিষ্ঠদের ভালোবাসা' },
  ];

  useEffect(() => {
    let ticking = false;
    const handleScrollShowcase = () => {
      if (!ticking && showcaseRef.current) {
        window.requestAnimationFrame(() => {
          const rect = showcaseRef.current.getBoundingClientRect();
          const totalScrollable = showcaseRef.current.offsetHeight - window.innerHeight;
          if (totalScrollable > 0) {
            const scrolled = Math.max(0, -rect.top);
            const progress = Math.min(1, scrolled / totalScrollable);
            const step = Math.min(14, Math.floor(progress * 15));
            setShowcaseStep(step);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScrollShowcase, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollShowcase);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={{ background: '#fff' }}>
      {/* HERO BANNER */}
      <section className="hero-section" style={{
        position: 'relative', overflow: 'hidden', width: '100%',
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: `center ${Math.min(scrollY * 0.2, 100)}px`,
        backgroundRepeat: 'no-repeat',
        display: 'flex', alignItems: 'center',
        minHeight: 'calc(100vh - 70px)',
      }}>
        {/* Durga Image - Left */}
        <div className="hero-durga-col" style={{
          transform: `translate3d(0, ${-Math.min(scrollY * 0.22, 160)}px, 0) scale(${1 + Math.min(scrollY * 0.0003, 0.08)})`,
          willChange: 'transform',
        }}>
          <img src={durgaImg} alt="Maa Durga" className="hero-durga-img" />
        </div>

        {/* Bengali Text - Right */}
        <div className="hero-text-col" style={{
          transform: `translate3d(0, ${-Math.min(scrollY * 0.28, 200)}px, 0)`,
          willChange: 'transform',
        }}>
          <div className="hero-title-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            {/* Animated Trishul Header */}
            <div className="trishul-header-wrap">
              <img src={trishulImg} alt="Trishul" className="hero-trishul-img" />
            </div>

            <h1 className="hero-bn-title">
              <span className="type-line-1">চৌধুরী বাড়ির</span>
              <br />
              <span className="type-line-2">দুর্গোৎসব</span>
            </h1>

            {/* Subtitle / Tagline Block */}
            <div className="hero-subtext-wrap">
              <p className="hero-subtext-en">Where Tradition Lives, Devotion Begins.</p>
              <p className="hero-subtext-bn">✦ মা আসছেন, আবার আলোয় ভরে উঠবে আমাদের চারপাশ ✦</p>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME SECTION - Slides */}
      <section style={{ background: '#fff', padding: '0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px' }} className="welcome-grid">
          {/* Left: Welcome text */}
          <div style={{
            background: '#FDF6EC', padding: '60px 50px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Mandala decorations */}
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', opacity: 0.08, background: 'radial-gradient(circle, #C0392B 2px, transparent 2px) 0 0 / 12px 12px' }}></div>
            <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '180px', height: '180px', opacity: 0.08, background: 'radial-gradient(circle, #C0392B 2px, transparent 2px) 0 0 / 12px 12px' }}></div>

            <p style={{ color: '#7a5c4f', fontWeight: '500', marginBottom: '8px', fontSize: '1rem' }}>Welcome to</p>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: '#C0392B', fontWeight: '900',
              lineHeight: 1.15, marginBottom: '16px',
              textTransform: 'uppercase',
            }}>
              CHOWDHURYBATI<br />DURGA PUJA
            </h1>
            <p style={{ color: '#7a5c4f', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '30px', maxWidth: '380px' }}>
              Celebrate the divine energy of Durga Maa with Chowdhurybati Durga Puja.
              Where every moment is a joyous embrace of heritage and festivity.
            </p>
            <p style={{ fontFamily: 'Hind Siliguri, sans-serif', color: '#3d2b1f', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '30px', maxWidth: '380px' }}>
              {settings.aboutTextBn || 'মা দুর্গার দিব্য শক্তির সাথে চৌধুরীবাটি দুর্গাপূজায় যোগ দিন।'}
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/about" className="btn btn-primary">About</Link>
              <Link to="/gallery" className="btn btn-outline">Gallery</Link>
            </div>
          </div>

          {/* Right: Slideshow */}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: '400px' }}>
            {slides.map((slide, i) => (
              <img key={i} src={slide} alt={`Slide ${i + 1}`}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: i === currentSlide ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                }} />
            ))}
            {/* Slide dots */}
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  style={{
                    width: i === currentSlide ? '24px' : '8px', height: '8px',
                    borderRadius: '4px', border: 'none',
                    background: i === currentSlide ? '#C0392B' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', transition: 'all 0.3s',
                  }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COUNTDOWN SECTION */}
      {countdown && countdown.type !== 'none' && (
        <section className="countdown-sec">
          <div className="container" style={{ textAlign:'center' }}>

            {countdown.type === 'today' ? (
              /* ── Today IS a puja day ── */
              <div>
                <p style={{ color:'#C0392B', fontSize:'0.75rem', fontWeight:'700', letterSpacing:'4px', textTransform:'uppercase', marginBottom:'8px' }}>Today is</p>
                <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(1.8rem, 5vw, 3rem)', color:'#C0392B', fontStyle:'italic', marginBottom:'6px' }}>
                  {countdown.label}
                </h2>
                <p style={{ fontFamily:'Hind Siliguri, sans-serif', fontSize:'clamp(1rem, 2.5vw, 1.4rem)', color:'#922b21', marginBottom:'16px' }}>{countdown.labelBn}</p>
                <p style={{ color:'#C0392B', fontSize:'0.85rem', letterSpacing:'2px', opacity: 0.5 }}>✦ জয় মা দুর্গা ✦</p>
              </div>
            ) : (
              /* ── Countdown to next puja day ── */
              <div>
                <p style={{ color:'#C0392B', fontSize:'0.72rem', fontWeight:'700', letterSpacing:'4px', textTransform:'uppercase', marginBottom:'6px' }}>Countdown to</p>
                <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(1.4rem, 3.5vw, 2.2rem)', color:'#C0392B', fontStyle:'italic', marginBottom:'2px' }}>
                  {countdown.label}
                </h2>
                <p style={{ fontFamily:'Hind Siliguri, sans-serif', color:'#922b21', fontSize:'0.9rem', marginBottom:'16px' }}>{countdown.labelBn}</p>

                <div className="countdown-grid">
                  {[
                    { value: countdown.days,    label: 'Days' },
                    { value: countdown.hours,   label: 'Hours' },
                    { value: countdown.minutes, label: 'Minutes' },
                    { value: countdown.seconds, label: 'Seconds' },
                  ].map(({ value, label }) => (
                    <div key={label} className="countdown-box">
                      <div className="countdown-num">
                        {String(value).padStart(2, '0')}
                      </div>
                      <div className="countdown-lbl">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ width:'80px', height:'1px', background:'linear-gradient(to right, transparent, #C0392B, transparent)', margin:'14px auto 0' }} />
                <p style={{ color:'#C0392B', fontSize:'0.7rem', letterSpacing:'2px', marginTop:'10px', opacity: 0.45 }}>✦ জয় মা দুর্গা ✦</p>
              </div>
            )}
          </div>
        </section>
      )}



      {/* YOUTUBE VIDEO SECTION */}
      <section style={{ background: '#FDF6EC', padding: '60px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }} className="video-grid container">
          <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', aspectRatio: '16/9' }}>
            <iframe
              width="100%" height="100%"
              src={settings.youtubeUrl || 'https://www.youtube.com/shorts/f_i60KU7nrU?feature=share'}
              title="Durga Puja" frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen style={{ display: 'block' }}
            />
          </div>
          <div>
            <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '0.85rem', color: '#C0392B', fontWeight: '600', marginBottom: '8px' }}>
              এই পুজো সম্পর্কে — Chowdhury Bari Durga Utsav-এ আপনাকে স্বাগতম!
            </p>
            <p style={{ fontFamily: 'Hind Siliguri, sans-serif', color: '#3d2b1f', lineHeight: 1.9, fontSize: '0.92rem' }}>
              {settings.aboutTextBn || 'প্রতি বছর দুর্গাপূজা উপলক্ষে চৌধুরীবাটিতে আয়োজিত হয় এই মহোৎসব। সংস্কৃতি, ঐতিহ্য ও আনন্দের এক অপূর্ব মিলনমেলা।'}
            </p>
          </div>
        </div>
      </section>

      {/* TRADITIONS SECTION */}
      <section style={{ padding: '60px 0', background: '#fff' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }} className="tradition-grid container">
          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '320px' }}>
            <img src={tradition} alt="Tradition" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: '#1a0a00', marginBottom: '20px', fontStyle: 'italic' }}>
              Keeping our traditions alive!
            </h2>
            <p style={{ fontFamily: 'Hind Siliguri, sans-serif', color: '#3d2b1f', lineHeight: 1.9, fontSize: '0.9rem', marginBottom: '24px' }}>
              প্রজন্মের পর প্রজন্ম ধরে চৌধুরীবাটিতে দুর্গাপূজার এই ঐতিহ্য অব্যাহত রয়েছে। বিসর্জন, সন্ধিপূজা, কুমারীপূজা — প্রতিটি আচার-অনুষ্ঠানে মিশে আছে আমাদের সংস্কৃতি ও বিশ্বাসের গভীর বন্ধন।
            </p>
            <Link to="/about" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#C0392B', fontWeight: '600', textDecoration: 'none',
              borderBottom: '2px solid #C0392B', paddingBottom: '2px',
            }}>
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* FESTIVAL HIGHLIGHTS */}
      <section style={{ background: '#F5E6CC', padding: '60px 0' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#1a0a00', marginBottom: '30px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            FESTIVAL HIGHLIGHTS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="highlights-grid">
            <div style={{ background: '#C0392B', color: '#fff', padding: '30px 24px', borderRadius: '8px' }}>
              <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>প্রতিমা দর্শন</h3>
              <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.7 }}>পঞ্চমী থেকে দশমী পর্যন্ত নিখুঁত প্রতিমা দর্শনের সুযোগ</p>
            </div>
            <div style={{ background: '#D4AF37', color: '#1a0a00', padding: '30px 24px', borderRadius: '8px' }}>
              <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>সাংস্কৃতিক অনুষ্ঠান</h3>
              <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.7 }}>সঙ্গীত, নৃত্য ও বিভিন্ন সাংস্কৃতিক পরিবেশনা</p>
            </div>
            <div style={{ background: '#FDF6EC', color: '#3d2b1f', padding: '30px 24px', borderRadius: '8px', border: '2px solid #e8c9a0' }}>
              <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>ভোগ বিতরণ</h3>
              <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '0.85rem', color: '#7a5c4f', lineHeight: 1.7 }}>সকল ভক্তদের জন্য প্রসাদ ও ভোগ পরিবেশন</p>
            </div>
          </div>
        </div>
      </section>

      {/* PURE SINGLE PHOTO FULL-SCREEN STACKING DECK SHOWCASE (15 Photos Stacking 1-by-1) */}
      <div ref={showcaseRef} style={{ position: 'relative', height: '420vh', background: '#FDF6EC' }}>
        <div style={{ position: 'sticky', top: 0, height: '95vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: '16px 20px' }}>
          
          {/* Single Large Photo Deck Frame */}
          <div style={{ width: '100%', maxWidth: '1100px', height: '80vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="showcase-single-deck">
            {(() => {
              const allCards = (settings.showcaseCards && settings.showcaseCards.length > 0)
                ? settings.showcaseCards
                : DEFAULT_SHOWCASE_CARDS;
              
              const padded = [...allCards];
              while (padded.length < 15) {
                padded.push(DEFAULT_SHOWCASE_CARDS[padded.length % DEFAULT_SHOWCASE_CARDS.length]);
              }
              const currentPhoto = padded[showcaseStep] || padded[0];

              return (
                <div
                  key={showcaseStep}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
                    transform: 'translate3d(0, 0, 0)',
                    willChange: 'transform, opacity',
                    animation: `singlePhotoStack 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards`,
                    border: '3px solid #E8D5C4',
                  }}
                  className="showcase-single-item"
                >
                  <img
                    src={currentPhoto.imageUrl}
                    alt="Puja Photo Showcase"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Minimal 15-Dot Progress Indicator Bar */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90%' }}>
            {Array.from({ length: 15 }).map((_, s) => (
              <div
                key={s}
                style={{
                  width: s === showcaseStep ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: s === showcaseStep ? '#C0392B' : '#D4AF37',
                  opacity: s === showcaseStep ? 1 : 0.35,
                  transition: 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              />
            ))}
          </div>

        </div>
      </div>

      {/* HAPPY DURGA PUJA BANNER */}
      <section style={{ background: '#fff', padding: '50px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }} className="happy-grid container">
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#C0392B', marginBottom: '16px' }}>
              Happy Durga Puja!
            </h2>
            <p style={{ color: '#7a5c4f', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Let's celebrate Puja together. Feel the traditions and blessings of Maa Durga. We welcome everyone to join our festivities and be part of this divine celebration.
            </p>
          </div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '250px' }}>
            <img src={slide3} alt="Happy Durga Puja" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* PUJA DAYS */}
      <section style={{ background: '#FDF6EC', padding: '60px 0' }}>
        <div className="container">
          <h2 className="section-title">Puja Days</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }} className="pujadays-grid">
            {(events.length > 0 ? events : pujadays).slice(0, 6).map((day, i) => (
              <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: '#fff' }}>
                <div style={{ height: '160px', overflow: 'hidden', background: '#f0e0d0' }}>
                  {day.image
                    ? <img src={day.image} alt={day.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <img src={slides[i % slides.length]} alt={day.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  }
                </div>
                <div style={{ padding: '14px 16px', background: '#fff' }}>
                  <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontWeight: '700', color: '#C0392B', fontSize: '0.95rem' }}>
                    {day.nameBn || day.name}|{day.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Wide Dashami */}
          {(events.length === 0) && (
            <div style={{ marginTop: '20px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: '#fff' }}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img src={slide2} alt="Maha Dashami" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '14px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontWeight: '700', color: '#C0392B', fontSize: '1.1rem' }}>
                  মহা দশমী | 13 Oct
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* JOY MAA DURGA */}
      <section style={{ padding: '60px 0', textAlign: 'center', background: '#fff' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: '#C0392B', fontStyle: 'italic',
          fontWeight: '400',
        }}>
          Joy Maa Durga
        </h2>
      </section>


      {/* SPONSORS CAROUSEL */}
      {sponsors.length > 0 && (
        <section style={{ background: '#fff', padding: '40px 0', borderTop: '1px solid #f0e0d0', borderBottom: '1px solid #f0e0d0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#7a5c4f', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>Our Sponsors & Partners</p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#1a0a00', fontSize: '1.3rem', marginTop: '4px' }}>Supported By</h3>
          </div>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Left fade overlay */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%', background: 'linear-gradient(to right, #fff 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
            {/* Right fade overlay */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%', background: 'linear-gradient(to left, #fff 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
            <div className="sponsor-track">
              {[...sponsors, ...sponsors, ...sponsors].map((s, i) => (
                <div key={i} className="sponsor-item">
                  {s.website ? (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
                      <img src={s.url} alt={s.name} style={{ height: '70px', width: '140px', objectFit: 'contain' }} />
                      <p style={{ fontSize: '0.75rem', color: '#7a5c4f', marginTop: '8px', fontWeight: '600' }}>{s.name}</p>
                    </a>
                  ) : (
                    <>
                      <img src={s.url} alt={s.name} style={{ height: '70px', width: '140px', objectFit: 'contain' }} />
                      <p style={{ fontSize: '0.75rem', color: '#7a5c4f', marginTop: '8px', fontWeight: '600' }}>{s.name}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      <section style={{ background: '#FDF6EC', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#1a0a00', marginBottom: '16px' }}>
            Reach out to us
          </h2>
          <a href={`mailto:${settings.email || 'chowdhurybatidurgautsav@gmail.com'}`}
            style={{ color: '#C0392B', fontSize: '1rem', fontWeight: '500', display: 'block', marginBottom: '24px' }}>
            {settings.email || 'chowdhurybatidurgautsav@gmail.com'}
          </a>
          <Link to="/contact" className="btn btn-primary">Contact Us</Link>
        </div>
      </section>

      <style>{`
        /* ── Hero ── */
        .hero-section {
          min-height: calc(100vh - 70px);
          padding: 20px 40px;
        }

        .hero-durga-col {
          width: 58%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 10px 0 10px 10px;
          flex-shrink: 0;
        }
        .hero-durga-img {
          width: 100%;
          max-width: 980px;
          max-height: calc(100vh - 50px);
          height: auto;
          object-fit: contain;
          display: block;
          margin-left: -35px;
          image-rendering: -webkit-optimize-contrast;
          filter: contrast(1.04) saturate(1.06) drop-shadow(0 8px 24px rgba(0,0,0,0.12));
          transition: transform 0.3s ease;
        }
        .hero-text-col {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 40px;
        }
        .hero-title-wrapper {
          transform: translateY(-80px);
        }
        .hero-bn-title {
          font-family: 'Lipishree Unicode', 'Lipishree', serif !important;
          font-size: clamp(3.2rem, 7.8vw, 6.6rem);
          font-weight: 400;
          color: #E8000B;
          line-height: 1.4;
          margin: 0;
          text-shadow: 0 4px 15px rgba(232, 0, 11, 0.12);
        }

        /* ── 4-Second Handwriting Typing Animation (Zero Top Clipping) ── */
        .type-line-1 {
          display: inline-block;
          opacity: 0;
          clip-path: inset(-80px 100% -80px -80px);
          padding-top: 12px;
          padding-bottom: 15px;
          padding-right: 35px;
          padding-left: 10px;
          margin-top: 0;
          margin-bottom: -10px;
          animation: typeWrite 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s forwards;
        }
        .type-line-2 {
          display: inline-block;
          opacity: 0;
          clip-path: inset(-80px 100% -80px -80px);
          padding-top: 12px;
          padding-bottom: 15px;
          padding-right: 35px;
          padding-left: 10px;
          margin-top: -10px;
          margin-bottom: -10px;
          animation: typeWrite 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) 2.0s forwards;
        }

        @keyframes typeWrite {
          0% {
            clip-path: inset(-80px 100% -80px -80px);
            opacity: 1;
          }
          100% {
            clip-path: inset(-80px -80px -80px -80px);
            opacity: 1;
          }
        }

        /* ── Animated Trishul Header (Above Text, Pointing Right, ~5px Ultra-Tight Gap) ── */
        .trishul-header-wrap {
          width: 100%;
          text-align: center;
          margin-bottom: -145px;
          opacity: 0;
          animation: trishulFadeIn 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s forwards;
        }
        .hero-trishul-img {
          width: 350px;
          height: auto;
          transform: rotate(90deg);
          filter: drop-shadow(0 4px 14px rgba(232, 0, 11, 0.28));
          display: inline-block;
        }

        @keyframes trishulFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ── Hero Subtext Tagline ── */
        .hero-subtext-wrap {
          text-align: center;
          margin-top: 28px;
          opacity: 0;
          animation: subtextFadeIn 1s ease-in-out 3.5s forwards;
        }
        .hero-subtext-en {
          font-family: 'Playfair Display', serif;
          font-size: clamp(0.78rem, 1.3vw, 0.98rem);
          font-style: italic;
          font-weight: 400;
          color: #7a5c4f;
          letter-spacing: 2.5px;
          margin-bottom: 5px;
        }
        .hero-subtext-bn {
          font-family: 'Hind Siliguri', 'Tiro Bangla', sans-serif;
          font-size: clamp(0.74rem, 1.15vw, 0.88rem);
          font-weight: 400;
          color: #8C2D23;
          letter-spacing: 1.5px;
        }

        @keyframes subtextFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Single Photo Deck Stacking Animations & Mobile Rules ── */
        @keyframes singlePhotoStack {
          0% {
            opacity: 0;
            transform: translate3d(0, 60px, 0) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* ── Tablet ── */
        @media (max-width: 900px) {
          .hero-section { min-height: calc(100vh - 70px); padding: 20px; }
          .hero-durga-col { width: 48%; }
          .hero-durga-img { max-width: 480px; max-height: calc(100vh - 140px); }
          .hero-text-col { padding: 20px 10px; }
          .hero-bn-title { font-size: clamp(2.5rem, 7vw, 4.5rem); }
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .hero-section {
            flex-direction: column !important;
            justify-content: flex-start !important;
            min-height: calc(100vh - 70px) !important;
            padding: 16px 12px 30px !important;
          }
          .hero-durga-col {
            width: 100% !important;
            padding: 8px 0 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin-bottom: 0px !important;
          }
          .hero-durga-img {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 58vh !important;
            margin: 12px auto 0 !important;
            display: block !important;
            transform: scale(1.05);
          }
          .hero-text-col {
            width: 100% !important;
            padding: 0 10px !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .hero-title-wrapper {
            transform: translateY(-75px) !important;
          }
          .hero-bn-title {
            font-size: clamp(3.2rem, 13.5vw, 4.8rem) !important;
            line-height: 1.35 !important;
          }
          .trishul-header-wrap {
            margin-bottom: -95px !important;
          }
          .hero-trishul-img {
            width: 220px !important;
          }
          .hero-subtext-wrap {
            margin-top: 32px !important;
          }
          .showcase-single-deck {
            height: 74vh !important;
          }
          .showcase-single-item {
            border-radius: 14px !important;
            border-width: 2px !important;
          }
        }

        .sponsor-track {
          display: flex;
          align-items: center;
          gap: 0px;
          width: max-content;
          animation: marquee 18s linear infinite;
          padding: 16px 0;
        }
        .sponsor-track:hover { animation-play-state: paused; }
        .sponsor-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          background: #fff;
          border: 1.5px solid #f0e0d0;
          border-radius: 12px;
          padding: 18px 24px;
          width: 180px;
          margin: 0 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .sponsor-item:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(192,57,43,0.15);
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .countdown-sec {
          background: #fff;
          padding: 28px 0;
          margin-top: 20px;
        }
        .countdown-grid {
          display: flex;
          justify-content: center;
          gap: clamp(10px, 2vw, 20px);
          flex-wrap: wrap;
        }
        .countdown-box {
          background: #FDF6EC;
          border: 1.5px solid #e8c9a0;
          border-radius: 10px;
          padding: 12px 22px;
          min-width: clamp(65px, 12vw, 95px);
          box-shadow: 0 2px 8px rgba(192,57,43,0.06);
          text-align: center;
        }
        .countdown-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #C0392B;
          line-height: 1;
        }
        .countdown-lbl {
          color: #7a5c4f;
          font-size: 0.68rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 6px;
        }

        @media (max-width: 600px) {
          .countdown-sec {
            padding: 16px 0 !important;
            margin-top: 10px !important;
          }
          .countdown-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 6px !important;
            padding: 0 4px !important;
          }
          .countdown-box {
            padding: 8px 2px !important;
            min-width: 0 !important;
            border-radius: 8px !important;
          }
          .countdown-num {
            font-size: 1.2rem !important;
          }
          .countdown-lbl {
            font-size: 0.55rem !important;
            letter-spacing: 0.5px !important;
            margin-top: 2px !important;
          }
        }

        @media (max-width: 768px) {
          .welcome-grid, .video-grid, .tradition-grid, .happy-grid { grid-template-columns: 1fr !important; }
          .highlights-grid { grid-template-columns: 1fr !important; }
          .pujadays-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .pujadays-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
