import React, { useState, useEffect } from 'react';
import api, { getCached, hasCached } from '../utils/api';
import heroBg from '../assets/hero-bg.jpg';
function PageHeader({ title }) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: `url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: '900',
          color: '#E8000B',
          marginBottom: '10px',
          letterSpacing: '1px',
        }}>{title}</h1>
        <div className="page-header-underline" />
      </div>
      <style>{`
        .page-header-underline {
          height: 3px;
          width: 60px;
          background: #C0392B;
          margin: 0 auto;
          border-radius: 2px;
          animation: underlineGrow 1.5s ease-in-out infinite alternate;
        }
        @keyframes underlineGrow {
          0%   { width: 40px; opacity: 0.6; }
          100% { width: 120px; opacity: 1; }
        }
      `}</style>
    </section>
  );
}

export default function Gallery() {
  const [allPhotos, setAllPhotos] = useState([]);
  const [year, setYear] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(!hasCached('/gallery'));

  const availableYears = Array.from(
    new Set(allPhotos.map(p => Number(p.year)).filter(Boolean))
  ).sort((a, b) => b - a);

  useEffect(() => {
    getCached('/gallery')
      .then(r => {
        const data = r.data || [];
        setAllPhotos(data);
        const yrs = Array.from(new Set(data.map(p => Number(p.year)).filter(Boolean))).sort((a, b) => b - a);
        if (yrs.length > 0) {
          setYear(prev => (prev && yrs.includes(Number(prev)) ? prev : yrs[0]));
        } else {
          setYear(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayedPhotos = year
    ? allPhotos.filter(p => Number(p.year) === Number(year))
    : [];

  return (
    <div>
      {/* Hero */}
      <PageHeader title="Gallery" />

      <section style={{ padding: '60px 0', background: '#FDF6EC' }}>
        <div className="container">
          {/* Dynamic Year filter (No 'All' Button) */}
          {availableYears.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
              {availableYears.map(y => (
                <button key={y} onClick={() => setYear(y)}
                  style={{ ...filterBtn, background: Number(year) === Number(y) ? '#C0392B' : '#fff', color: Number(year) === Number(y) ? '#fff' : '#C0392B' }}>
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Year heading */}
          {year && <p style={{ textAlign: 'center', color: '#C0392B', fontWeight: '700', fontSize: '1.1rem', marginBottom: '24px' }}>{year}</p>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#C0392B', fontSize: '1.2rem' }}>Loading...</div>
          ) : displayedPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#7a5c4f' }}>
              <p style={{ fontSize: '1.1rem' }}>No photos available for this year yet.</p>
            </div>
          ) : (
            <div style={{ columns: '3', columnGap: '16px' }} className="gallery-columns">
              {displayedPhotos.map((p, i) => (
                <div key={p._id} onClick={() => setLightbox(i)}
                  style={{ marginBottom: '16px', breakInside: 'avoid', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <img src={p.url} alt={p.caption || 'Gallery'} style={{ width: '100%', display: 'block' }} />
                  {p.caption && (
                    <div style={{ background: '#fff', padding: '8px 12px', fontSize: '0.8rem', color: '#7a5c4f' }}>{p.caption}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button onClick={e => { e.stopPropagation(); setLightbox(l => Math.max(0, l - 1)); }}
            style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer' }}>
            ‹
          </button>
          <img src={photos[lightbox]?.url} alt="" style={{ maxHeight: '85vh', maxWidth: '85vw', borderRadius: '8px', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setLightbox(l => Math.min(photos.length - 1, l + 1)); }}
            style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer' }}>
            ›
          </button>
          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', color: '#fff', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .gallery-columns { columns: 2 !important; } }
        @media (max-width: 480px) { .gallery-columns { columns: 1 !important; } }
      `}</style>
    </div>
  );
}

const filterBtn = {
  padding: '8px 24px', border: '2px solid #C0392B', borderRadius: '30px',
  fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem',
};
