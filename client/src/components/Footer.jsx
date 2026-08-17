import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import logo from '../assets/logo.png';

export default function Footer() {
  const [settings, setSettings] = useState({ email: 'chowdhurybatidurgautsav@gmail.com', address: 'Durgapur, West Bengal', facebook: '', instagram: '', youtube: '' });

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <img src={logo} alt="Logo" style={{ height: '42px', width: '42px', objectFit: 'contain' }} />
              <div>
                <div style={{ fontWeight: '700', color: '#F0D060', fontSize: '0.88rem' }}>Chowdhury Bari</div>
                <div style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '0.82rem', color: '#e8c9a0' }}>দুর্গোৎসব</div>
              </div>
            </div>
            <p className="footer-brand-desc">
              Celebrating the divine energy of Maa Durga with love, tradition and festivity every year.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" style={socialStyle}>f</a>}
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" style={socialStyle}>in</a>}
              {settings.youtube && <a href={settings.youtube} target="_blank" rel="noreferrer" style={{ ...socialStyle, background: '#C0392B' }}>▶</a>}
            </div>
          </div>

          {/* 3 Link Columns Side by Side */}
          <div className="footer-links-grid">
            {/* Features */}
            <div className="footer-col">
              <h4 className="footer-head">Features</h4>
              <ul className="footer-list">
                {[['/', 'Home'], ['/gallery', 'Gallery'], ['/events', 'Events'], ['/team', 'Team'], ['/contact', 'Contact']].map(([path, label]) => (
                  <li key={path}><Link to={path} className="footer-link">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Latest News */}
            <div className="footer-col">
              <h4 className="footer-head">Latest News</h4>
              <ul className="footer-list">
                <li className="footer-text-item">Puja {settings.pujaYear || 2026} Preparations</li>
                <li className="footer-text-item">Cultural Program Schedule</li>
                <li className="footer-text-item">Bhog Distribution Info</li>
                <li className="footer-text-item">New Gallery Photos Added</li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-col">
              <h4 className="footer-head">Support</h4>
              <ul className="footer-list">
                <li><Link to="/contact" className="footer-link">Contact</Link></li>
                <li><Link to="/about" className="footer-link">About Us</Link></li>
                <li><a href={`mailto:${settings.email}`} className="footer-link footer-email">{settings.email}</a></li>
              </ul>
              <p className="footer-address">
                {settings.addressBn || 'চৌধুরীবাটি, দীর্ঘগ্রাম, পশ্চিমবঙ্গ, ভারত'}
              </p>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Chowdhury Bari Durga Utsav. All rights reserved. &nbsp;|&nbsp;
            <span style={{ fontFamily: 'Hind Siliguri, sans-serif' }}>জয় মা দুর্গা 🙏</span>
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: #1a0a00;
          color: #f5e6cc;
          padding: 45px 0 20px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.1fr 2.9fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .footer-brand-desc {
          font-size: 0.84rem;
          color: #c9a87c;
          line-height: 1.6;
          margin: 0;
        }
        .footer-head {
          color: #F0D060;
          fontSize: 0.95rem;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .footer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0;
          margin: 0;
        }
        .footer-link {
          color: #c9a87c;
          font-size: 0.84rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #F0D060;
        }
        .footer-text-item {
          color: #c9a87c;
          font-size: 0.84rem;
          line-height: 1.4;
        }
        .footer-address {
          color: #c9a87c;
          font-size: 0.8rem;
          margin-top: 8px;
          font-family: 'Hind Siliguri', sans-serif;
          line-height: 1.5;
        }
        .footer-bottom {
          border-top: 1px solid #3d2b1f;
          padding-top: 18px;
          text-align: center;
          color: #7a5c4f;
          font-size: 0.8rem;
        }

        /* ── Mobile 3-Column Layout ── */
        @media (max-width: 768px) {
          .site-footer {
            padding: 28px 0 16px;
          }
          .footer-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 20px;
          }
          .footer-brand-desc {
            font-size: 0.78rem;
            line-height: 1.45;
          }
          .footer-links-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 10px !important;
          }
          .footer-head {
            font-size: 0.78rem !important;
            margin-bottom: 8px !important;
          }
          .footer-list {
            gap: 6px !important;
          }
          .footer-link, .footer-text-item {
            font-size: 0.70rem !important;
            line-height: 1.35 !important;
          }
          .footer-email {
            font-size: 0.65rem !important;
            word-break: break-all !important;
          }
          .footer-address {
            font-size: 0.68rem !important;
            margin-top: 6px !important;
          }
          .footer-bottom {
            padding-top: 14px;
            font-size: 0.72rem;
          }
        }
      `}</style>
    </footer>
  );
}

const socialStyle = {
  width: '32px', height: '32px', borderRadius: '50%',
  background: '#3d2b1f', color: '#F0D060',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none',
};
