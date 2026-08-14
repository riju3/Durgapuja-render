import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import dhakImg from '../assets/dhak.png';
import api from '../utils/api';

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 1000,
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 20px rgba(192,57,43,0.15)',
    borderBottom: '2px solid #C0392B',
  },
  inner: {
    maxWidth: '1200px', margin: '0 auto', padding: '0 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '70px',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
    justifyContent: 'flex-start', marginRight: 'auto',
  },
  brandImg: { height: '120px', width: '80px', objectFit: 'contain' },
  brandText: {
    display: 'flex', flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '0.90rem', fontWeight: '700', color: '#C0392B',
    letterSpacing: '0.5px', lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '0.8rem', color: '#7a5c4f', fontFamily: 'Hind Siliguri, sans-serif',
  },
  links: {
    display: 'flex', alignItems: 'center', gap: '4px', listStyle: 'none',
    marginLeft: 'auto',
  },
  hamburger: {
    display: 'none', flexDirection: 'column', gap: '5px',
    cursor: 'pointer', background: 'none', border: 'none', padding: '5px',
  },
  bar: {
    width: '25px', height: '2px', background: '#C0392B', borderRadius: '2px',
    transition: 'all 0.3s',
  },
};

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [musicUrl, setMusicUrl] = useState('');
  const [musicPlaying, setMusicPlaying] = useState(false);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(musicUrl);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data?.musicUrl) {
        setMusicUrl(r.data.musicUrl);
        const ytId = getYouTubeId(r.data.musicUrl);
        if (!ytId) {
          if (!window._bgAudio) {
            window._bgAudio = new Audio(r.data.musicUrl);
            window._bgAudio.loop = true;
          } else if (window._bgAudio.src !== r.data.musicUrl) {
            window._bgAudio.src = r.data.musicUrl;
          }
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!youtubeId && window._bgAudio) {
      setMusicPlaying(!window._bgAudio.paused);
      const onPlay = () => setMusicPlaying(true);
      const onPause = () => setMusicPlaying(false);
      window._bgAudio.addEventListener('play', onPlay);
      window._bgAudio.addEventListener('pause', onPause);
      return () => {
        if (window._bgAudio) {
          window._bgAudio.removeEventListener('play', onPlay);
          window._bgAudio.removeEventListener('pause', onPause);
        }
      };
    }
  }, [musicUrl, youtubeId]);

  const toggleMusic = () => {
    if (!musicUrl) return;
    if (youtubeId) {
      if (window._bgAudio && !window._bgAudio.paused) {
        window._bgAudio.pause();
      }
      setMusicPlaying(prev => !prev);
    } else {
      if (!window._bgAudio) {
        window._bgAudio = new Audio(musicUrl);
        window._bgAudio.loop = true;
      }
      if (window._bgAudio.paused) {
        window._bgAudio.play().then(() => setMusicPlaying(true)).catch(() => {});
      } else {
        window._bgAudio.pause();
        setMusicPlaying(false);
      }
    }
  };

  const navLinkStyle = ({ isActive }) => ({
    padding: '6px 14px',
    borderRadius: '4px',
    fontWeight: '500',
    fontSize: '0.9rem',
    color: isActive ? '#fff' : '#3d2b1f',
    background: isActive ? '#C0392B' : 'transparent',
    transition: 'all 0.2s',
    textDecoration: 'none',
    display: 'block',
  });

  return (
    <nav style={{ ...styles.nav, boxShadow: scrolled ? '0 4px 20px rgba(192,57,43,0.2)' : styles.nav.boxShadow }}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <img src={logo} alt="Logo" style={styles.brandImg} />
          <div style={styles.brandText}>
            <span style={styles.brandTitle}>Chowdhury Bari Durga Utsav</span>
            <span style={styles.brandSub} className="bengali">চৌধুরী বাড়ির দুর্গোৎসব</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul style={{ ...styles.links, '@media(max-width:768px)': { display: 'none' } }} className="nav-links">
          {[['/', 'Home'], ['/about', 'About'], ['/events', 'Events'], ['/gallery', 'Gallery'], ['/team', 'Team'], ['/contact', 'Contact'], ['/downloads', 'Downloads']].map(([path, label]) => (
            <li key={path}>
              <NavLink to={path} end={path === '/'} style={navLinkStyle}>{label}</NavLink>
            </li>
          ))}
          {isAdmin && (
            <li><NavLink to="/admin" style={navLinkStyle}>Admin</NavLink></li>
          )}
          {user ? (
            <li>
              <button onClick={() => { logout(); navigate('/'); }}
                style={{ padding: '6px 16px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" style={{ padding: '6px 16px', background: '#C0392B', color: '#fff', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem' }}>
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Hamburger */}
        <div style={{ marginLeft: '12px' }}>
          <button style={styles.hamburger} className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span style={styles.bar}></span>
            <span style={styles.bar}></span>
            <span style={styles.bar}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: '#fff', padding: '16px 20px', borderTop: '1px solid #f0e0d0',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {[['/', 'Home'], ['/about', 'About'], ['/events', 'Events'], ['/gallery', 'Gallery'], ['/team', 'Team'], ['/contact', 'Contact'], ['/downloads', 'Downloads']].map(([path, label]) => (
            <NavLink key={path} to={path} end={path === '/'} style={navLinkStyle} onClick={() => setMenuOpen(false)}>{label}</NavLink>
          ))}
          {isAdmin && <NavLink to="/admin" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Admin</NavLink>}
          {user
            ? <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} style={{ padding: '8px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
            : <Link to="/login" onClick={() => setMenuOpen(false)} style={{ padding: '8px', background: '#C0392B', color: '#fff', borderRadius: '4px', fontWeight: '600', textAlign: 'center' }}>Login</Link>
          }
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .nav-links { display: flex !important; }
        }
      `}</style>
    </nav>

    {/* Hidden YouTube background audio iframe */}
    {youtubeId && musicPlaying && (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&loop=1&playlist=${youtubeId}`}
        title="Background Music"
        allow="autoplay"
        style={{ position: 'fixed', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', top: '-100px', left: '-100px' }}
      />
    )}

    {/* Floating Dhak Music Button at Bottom Right Corner of Screen */}
    {musicUrl && (
      <button
        onClick={toggleMusic}
        title={musicPlaying ? 'Pause Music' : 'Play Music'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: '#fff',
          border: musicPlaying ? '2.5px solid #27ae60' : '2.5px solid #C0392B',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
        }}>
        <img
          src={dhakImg}
          alt="Music Dhak"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        {/* Status Badge Dot */}
        <span style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '13px',
          height: '13px',
          borderRadius: '50%',
          background: musicPlaying ? '#27ae60' : '#C0392B',
          border: '2px solid #fff',
        }} />
      </button>
    )}
    </>
  );
}
