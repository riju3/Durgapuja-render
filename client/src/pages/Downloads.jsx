import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import heroBg from '../assets/hero-bg.jpg';

const typeColor = { image: '#2980b9', pdf: '#C0392B', doc: '#27ae60', caption_only: '#D4AF37' };
const typeIcon = { image: '🖼️', pdf: '📄', doc: '📝', caption_only: '📌' };
const typeLabel = { image: 'Image', pdf: 'PDF', doc: 'Document', caption_only: 'Notice' };

function PageHeader({ title }) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: `url(${heroBg})`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
    }}>
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: '900', color: '#E8000B',
          marginBottom: '10px', letterSpacing: '1px',
        }}>{title}</h1>
        <div className="page-header-underline" />
      </div>
      <style>{`
        .page-header-underline {
          height: 3px; width: 60px; background: #C0392B;
          margin: 0 auto; border-radius: 2px;
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

export default function Downloads() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/downloads').then(r => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDownload = async (item) => {
    try {
      await api.patch(`/downloads/${item._id}/download`);
      const link = document.createElement('a');
      link.href = item.fileUrl; link.target = '_blank';
      link.download = item.fileName || item.title;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, downloadCount: (i.downloadCount || 0) + 1 } : i));
    } catch { window.open(item.fileUrl, '_blank'); }
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div>
      <PageHeader title="Downloads" />
      <section style={{ padding: '60px 0', background: '#FDF6EC', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {[['all','All','📋'],['image','Images','🖼️'],['pdf','PDFs','📄'],['doc','Docs','📝'],['caption_only','Notices','📌']].map(([val,label,icon]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: '9px 22px', border: '2px solid #C0392B', borderRadius: '30px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', background: filter===val ? '#C0392B' : '#fff', color: filter===val ? '#fff' : '#C0392B' }}>
                {icon} {label}
              </button>
            ))}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#C0392B' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ fontSize: '3rem' }}>📭</p>
              <p style={{ color: '#7a5c4f' }}>No items found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
              {filtered.map(item => (
                <div key={item._id} style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 4px 18px rgba(0,0,0,0.09)', overflow: 'hidden', border: '1px solid #f0e0d0' }}>
                  {item.type === 'image' && item.fileUrl && (
                    <div onClick={() => setLightbox(item)} style={{ cursor: 'zoom-in', height: '180px', overflow: 'hidden' }}>
                      <img src={item.fileUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  {(item.type === 'pdf' || item.type === 'doc') && (
                    item.thumbnailUrl ? (
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        <img src={item.thumbnailUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ height: '100px', background: `linear-gradient(135deg, ${typeColor[item.type]}22, ${typeColor[item.type]}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>
                        {typeIcon[item.type]}
                      </div>
                    )
                  )}
                  {item.type === 'caption_only' && (
                    item.thumbnailUrl ? (
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        <img src={item.thumbnailUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ height: '80px', background: 'linear-gradient(135deg, #D4AF3722, #D4AF3744)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📌</div>
                    )
                  )}
                  <div style={{ padding: '18px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', marginBottom: '8px', background: `${typeColor[item.type]}18`, color: typeColor[item.type], border: `1px solid ${typeColor[item.type]}44` }}>
                      {typeIcon[item.type]} {typeLabel[item.type]}
                    </span>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#1a0a00', fontSize: '1rem', marginBottom: '8px' }}>{item.title}</h3>
                    {item.caption && <p style={{ color: '#7a5c4f', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '12px' }}>{item.caption}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f0e0d0' }}>
                      <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {item.fileUrl && item.type !== 'caption_only' ? (
                        <button onClick={() => handleDownload(item)} style={{ padding: '7px 16px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>⬇️ Download</button>
                      ) : item.type === 'image' ? (
                        <button onClick={() => setLightbox(item)} style={{ padding: '7px 16px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>🔍 View</button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', flexDirection: 'column', gap: '16px' }}>
          <img src={lightbox.fileUrl} alt={lightbox.title} style={{ maxHeight: '75vh', maxWidth: '90vw', borderRadius: '10px' }} onClick={e => e.stopPropagation()} />
          <p style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>{lightbox.title}</p>
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </div>
  );
}
