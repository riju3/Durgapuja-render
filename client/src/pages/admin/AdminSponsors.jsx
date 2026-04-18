import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [form, setForm] = useState({ name: '', website: '', order: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSponsors = () => {
    api.get('/sponsors').then(r => setSponsors(r.data)).catch(() => {});
  };

  useEffect(() => { fetchSponsors(); }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select an image'); return; }
    if (!form.name) { toast.error('Please enter sponsor name'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('name', form.name);
      fd.append('website', form.website);
      fd.append('order', form.order || '0');
      await api.post('/sponsors', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Sponsor added! 🎉');
      setForm({ name: '', website: '', order: '' });
      setFile(null);
      setPreview(null);
      fetchSponsors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await api.delete(`/sponsors/${id}`);
      toast.success('Deleted!');
      fetchSponsors();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#C0392B', marginBottom: '24px' }}>
        🤝 Sponsors & Partners
      </h2>

      {/* Upload Form */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color: '#1a0a00', marginBottom: '20px', fontSize: '1rem' }}>Add New Sponsor</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="sponsor-form-grid">
          <div>
            <label style={labelStyle}>Sponsor / Company Name *</label>
            <input style={inputStyle} placeholder="e.g. ABC Company" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Website (optional)</label>
            <input style={inputStyle} placeholder="https://example.com" value={form.website}
              onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Display Order (optional)</label>
            <input style={inputStyle} type="number" placeholder="0" value={form.order}
              onChange={e => setForm(p => ({ ...p, order: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Logo Image * (PNG, JPG, WebP)</label>
            <input type="file" accept="image/*" onChange={handleFile}
              style={{ ...inputStyle, padding: '8px' }} />
          </div>
        </div>

        {preview && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={preview} alt="Preview" style={{ height: '70px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e8d5c4', background: '#f9f9f9', padding: '8px' }} />
            <span style={{ color: '#7a5c4f', fontSize: '0.85rem' }}>Logo preview</span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ marginTop: '20px', padding: '12px 28px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>
          {loading ? 'Uploading...' : '➕ Add Sponsor'}
        </button>
      </div>

      {/* Sponsors List */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color: '#1a0a00', marginBottom: '20px', fontSize: '1rem' }}>
          All Sponsors ({sponsors.length})
        </h3>
        {sponsors.length === 0 ? (
          <p style={{ color: '#7a5c4f', textAlign: 'center', padding: '40px' }}>No sponsors added yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {sponsors.map(s => (
              <div key={s._id} style={{ border: '1px solid #e8d5c4', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#fdfaf7' }}>
                <img src={s.url} alt={s.name}
                  style={{ height: '60px', objectFit: 'contain', marginBottom: '10px', maxWidth: '100%' }} />
                <p style={{ fontWeight: '600', color: '#1a0a00', fontSize: '0.85rem', marginBottom: '4px' }}>{s.name}</p>
                {s.website && <p style={{ fontSize: '0.75rem', color: '#7a5c4f', marginBottom: '8px', wordBreak: 'break-all' }}>{s.website}</p>}
                <button onClick={() => handleDelete(s._id)}
                  style={{ padding: '6px 14px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .sponsor-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: '600', color: '#3d2b1f', marginBottom: '6px', fontSize: '0.85rem' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #e8d5c4', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' };
