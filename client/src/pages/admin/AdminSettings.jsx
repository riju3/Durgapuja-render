import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user: currentUser } = useAuth();

  // ── Website Settings ──────────────────────────────
  const [form, setForm] = useState({
    pujaYear: 2025, youtubeUrl: '', address: '', addressBn: '',
    email: '', phone: '', facebook: '', instagram: '', youtube: '',
    aboutText: '', aboutTextBn: '',
    dateMailaya: '', datePanchami: '', dateSasthi: '', dateSaptami: '',
    dateAstami: '', dateNavami: '', dateDashami: '',
    musicUrl: '',
    mapUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [musicUploading, setMusicUploading] = useState(false);

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('music', file);
    setMusicUploading(true);
    try {
      const res = await api.post('/settings/upload-music', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(p => ({ ...p, musicUrl: res.data.musicUrl }));
      toast.success('Music uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Music upload failed');
    } finally {
      setMusicUploading(false);
    }
  };

  useEffect(() => {
    api.get('/settings').then(r => setForm(r.data)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put('/settings', form);
      toast.success('Settings saved! 🙏');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const Field = ({ label, field, type = 'text', placeholder = '', bengali = false, rows }) => (
    <div>
      <label style={lbl}>{label}</label>
      {rows
        ? <textarea style={{ ...inp, resize: 'vertical' }} rows={rows} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} className={bengali ? 'bengali' : ''} />
        : <input type={type} style={inp} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} className={bengali ? 'bengali' : ''} />
      }
    </div>
  );

  // ── Manage Admins ──────────────────────────────────
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const loadAdmins = () => {
    setAdminsLoading(true);
    api.get('/auth/admins')
      .then(r => setAdmins(r.data))
      .catch(() => toast.error('Could not load admin list'))
      .finally(() => setAdminsLoading(false));
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (newAdmin.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setCreating(true);
    try {
      const res = await api.post('/auth/create-admin', newAdmin);
      toast.success(res.data.message);
      setNewAdmin({ name: '', email: '', password: '' });
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally { setCreating(false); }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (!window.confirm(`"${name}" কে admin থেকে সরাতে চাও?`)) return;
    try {
      const res = await api.delete(`/auth/admins/${id}`);
      toast.success(res.data.message);
      setAdmins(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1a0a00', fontSize: '1.8rem', marginBottom: '24px' }}>Website Settings</h2>
      <form onSubmit={handleSave}>

        {/* General */}
        <div style={card}>
          <h3 style={cardTitle}>⚙️ General Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="settings-grid">
            <Field label="Puja Year" field="pujaYear" type="number" placeholder="2025" />
            <Field label="Contact Email" field="email" type="email" placeholder="your@email.com" />
            <Field label="Phone" field="phone" placeholder="+91 XXXXX XXXXX" />
            <Field label="YouTube Embed URL" field="youtubeUrl" placeholder="https://www.youtube.com/embed/..." />
          </div>
        </div>

        {/* Address & Map */}
        <div style={card}>
          <h3 style={cardTitle}>📍 Address & Google Map</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="settings-grid">
            <Field label="Address (English)" field="address" placeholder="Chowdhurybati, Durgapur, West Bengal" />
            <Field label="ঠিকানা (বাংলা)" field="addressBn" placeholder="চৌধুরীবাটি, দুর্গাপুর, পশ্চিমবঙ্গ" bengali />
          </div>
          <div style={{ marginTop: '16px' }}>
            <Field label="Google Map Link / Embed URL" field="mapUrl" placeholder="https://maps.google.com/maps?q=... or paste <iframe src='...'>" />
            <p style={{ fontSize: '0.78rem', color: '#7a5c4f', marginTop: '4px' }}>Paste a Google Maps share link, embed URL, or iframe HTML tag.</p>
          </div>
          {form.mapUrl && (
            <div style={{ marginTop: '16px' }}>
              <label style={lbl}>Map Preview</label>
              <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e8d5c4', marginTop: '6px' }}>
                <iframe
                  title="Map Preview"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0, display: 'block' }}
                  src={(() => {
                    const match = form.mapUrl.match(/src=["']([^"']+)["']/);
                    return match ? match[1] : form.mapUrl;
                  })()}
                />
              </div>
            </div>
          )}
        </div>

        {/* About Text */}
        <div style={card}>
          <h3 style={cardTitle}>📝 About Text</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="About Text (English)" field="aboutText" rows={4} placeholder="Describe your puja..." />
            <Field label="পরিচিতি (বাংলা)" field="aboutTextBn" rows={4} bengali placeholder="পূজার পরিচিতি..." />
          </div>
        </div>

        {/* Social */}
        <div style={card}>
          <h3 style={cardTitle}>🌐 Social Media Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="settings-grid">
            <Field label="Facebook URL" field="facebook" placeholder="https://facebook.com/..." />
            <Field label="Instagram URL" field="instagram" placeholder="https://instagram.com/..." />
            <Field label="YouTube Channel URL" field="youtube" placeholder="https://youtube.com/..." />
          </div>
        </div>

        {/* Puja Countdown Dates */}
        <div style={card}>
          <h3 style={cardTitle}>Puja Countdown Dates</h3>
          <p style={{ fontSize: '0.82rem', color: '#7a5c4f', marginBottom: '16px' }}>Set the date for each Puja day to power the countdown on the homepage.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="settings-grid">
            {[
              ['Mahalaya',     'dateMailaya'],
              ['Maha Panchami','datePanchami'],
              ['Maha Sasthi',  'dateSasthi'],
              ['Maha Saptami', 'dateSaptami'],
              ['Maha Astami',  'dateAstami'],
              ['Maha Navami',  'dateNavami'],
              ['Maha Dashami', 'dateDashami'],
            ].map(([label, field]) => (
              <div key={field}>
                <label style={lbl}>{label}</label>
                <input type="date" style={inp} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Background Music */}
        <div style={card}>
          <h3 style={cardTitle}>Background Music</h3>
          <p style={{ fontSize: '0.82rem', color: '#7a5c4f', marginBottom: '16px' }}>Upload an audio file (MP3, WAV, OGG, M4A, etc.) or paste an audio URL to play background music when users toggle ON in navbar.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={lbl}>Upload Music File (All Formats Supported)</label>
              <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac" onChange={handleAudioUpload} disabled={musicUploading} style={inp} />
              {musicUploading && <p style={{ fontSize: '0.82rem', color: '#C0392B', marginTop: '4px' }}>Uploading audio file to Cloudinary...</p>}
            </div>
            <div>
              <label style={lbl}>Music File URL or YouTube Link</label>
              <input type="text" style={inp} value={form.musicUrl || ''} onChange={e => setForm(p => ({ ...p, musicUrl: e.target.value }))} placeholder="https://... (Direct audio URL or YouTube link)" />
              <p style={{ fontSize: '0.78rem', color: '#7a5c4f', marginTop: '4px' }}>Supports direct MP3/audio files and YouTube links (e.g. https://youtu.be/...)</p>
            </div>
            {form.musicUrl && (() => {
              const ytMatch = form.musicUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
              const ytId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null;

              return (
                <div>
                  <label style={lbl}>Music Preview</label>
                  {ytId ? (
                    <div style={{ aspectRatio: '16/9', maxWidth: '360px', marginTop: '6px', borderRadius: '8px', overflow: 'hidden' }}>
                      <iframe
                        width="100%" height="100%"
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title="YouTube preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <audio controls src={form.musicUrl} style={{ width: '100%', marginTop: '6px' }} />
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Interactive 3-Card Scroll Showcase Manager */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={cardTitle}>📸 Interactive Scroll Showcase Manager (Up to 15 Photos)</h3>
              <p style={{ fontSize: '0.82rem', color: '#7a5c4f' }}>
                Add up to 15 photos/cards for the homepage 3D scroll showcase. You can upload an image file OR paste direct photo URLs (e.g. Instagram photo links).
              </p>
            </div>
            {(!form.showcaseCards || form.showcaseCards.length < 15) && (
              <button
                type="button"
                style={{ padding: '8px 16px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                onClick={() => setForm(p => ({
                  ...p,
                  showcaseCards: [...(p.showcaseCards || []), { imageUrl: '', title: '', description: '' }]
                }))}
              >
                + Add Card ({form.showcaseCards ? form.showcaseCards.length : 0}/15)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(!form.showcaseCards || form.showcaseCards.length === 0) ? (
              <p style={{ fontSize: '0.88rem', color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                No custom showcase cards added yet. Default Puja images are being displayed on the homepage. Click "+ Add Card" to add your own photos!
              </p>
            ) : (
              form.showcaseCards.map((c, idx) => (
                <div key={idx} style={{ background: '#FDF6EC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e8d5c4', display: 'grid', gridTemplateColumns: '80px 1fr 40px', gap: '16px', alignItems: 'center' }}>
                  {/* Thumbnail Preview */}
                  <div style={{ width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#eee', border: '1px solid #ccc' }}>
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="Card Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.7rem', color: '#aaa' }}>No Image</div>
                    )}
                  </div>

                  {/* Card Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        style={{ ...inp, flex: 1 }}
                        placeholder="Paste Image URL / Instagram photo link (https://...)"
                        value={c.imageUrl || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(p => {
                            const updated = [...(p.showcaseCards || [])];
                            updated[idx] = { ...updated[idx], imageUrl: val };
                            return { ...p, showcaseCards: updated };
                          });
                        }}
                      />
                      <label style={{ padding: '8px 12px', background: '#fff', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', margin: 0, whiteSpace: 'nowrap' }}>
                        📁 Upload File
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append('image', file);
                            try {
                              toast.info('Uploading image...');
                              const res = await api.post('/settings/upload-showcase-image', fd, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              setForm(p => {
                                const updated = [...(p.showcaseCards || [])];
                                updated[idx] = { ...updated[idx], imageUrl: res.data.imageUrl };
                                return { ...p, showcaseCards: updated };
                              });
                              toast.success('Image uploaded!');
                            } catch (err) {
                              toast.error('Upload failed');
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input
                        type="text"
                        style={inp}
                        placeholder="Card Title (Optional)"
                        value={c.title || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(p => {
                            const updated = [...(p.showcaseCards || [])];
                            updated[idx] = { ...updated[idx], title: val };
                            return { ...p, showcaseCards: updated };
                          });
                        }}
                      />
                      <input
                        type="text"
                        style={inp}
                        placeholder="Description (Optional)"
                        value={c.description || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(p => {
                            const updated = [...(p.showcaseCards || [])];
                            updated[idx] = { ...updated[idx], description: val };
                            return { ...p, showcaseCards: updated };
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => {
                      setForm(p => ({
                        ...p,
                        showcaseCards: (p.showcaseCards || []).filter((_, i) => i !== idx)
                      }));
                    }}
                    title="Remove Card"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving}
            style={{ padding: '13px 36px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '💾 Save All Settings'}
          </button>
        </div>
      </form>

      {/* ── Manage Admins Section ── */}
      <div style={{ ...card, marginTop: '32px' }}>
        <h3 style={cardTitle}>Manage Admins</h3>

        {/* Create New Admin Form */}
        <div style={{ background: '#FDF6EC', borderRadius: '10px', padding: '20px', marginBottom: '24px', border: '1px solid #f0e0d0' }}>
          <h4 style={{ color: '#C0392B', fontWeight: '700', marginBottom: '16px', fontSize: '0.95rem' }}>Create New Admin</h4>
          <form onSubmit={handleCreateAdmin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }} className="settings-grid">
              <div>
                <label style={lbl}>Name</label>
                <input
                  type="text" required style={inp}
                  value={newAdmin.name}
                  onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
                  placeholder="Admin's name"
                />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input
                  type="email" required style={inp}
                  value={newAdmin.email}
                  onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label style={lbl}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} required style={{ ...inp, paddingRight: '44px' }}
                    value={newAdmin.password} minLength={6}
                    onChange={e => setNewAdmin(p => ({ ...p, password: e.target.value }))}
                    placeholder="At least 6 characters"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#7a5c4f' }}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={creating}
              style={{ padding: '10px 28px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>

        {/* Existing Admins List */}
        <h4 style={{ color: '#1a0a00', fontWeight: '700', marginBottom: '12px', fontSize: '0.95rem' }}>Current Admin List</h4>
        {adminsLoading ? (
          <p style={{ color: '#7a5c4f', fontSize: '0.9rem' }}>Loading...</p>
        ) : admins.length === 0 ? (
          <p style={{ color: '#7a5c4f', fontSize: '0.9rem' }}>No admins found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {admins.map(admin => (
              <div key={admin._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fff', border: '1px solid #e8d5c4', borderRadius: '8px',
                padding: '12px 16px', gap: '12px', flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#C0392B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem', flexShrink: 0 }}>
                    {admin.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1a0a00', fontSize: '0.92rem' }}>
                      {admin.name}
                      {currentUser?.id === admin._id && <span style={{ marginLeft: '8px', background: '#C0392B', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>You</span>}
                    </div>
                    <div style={{ color: '#7a5c4f', fontSize: '0.82rem' }}>{admin.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#999' }}>
                    {new Date(admin.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  {currentUser?.id !== admin._id && (
                    <button
                      onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                      style={{ padding: '6px 14px', background: 'transparent', color: '#C0392B', border: '1.5px solid #C0392B', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@media(max-width:600px){ .settings-grid{grid-template-columns:1fr !important;} }`}</style>
    </div>
  );
}

const card = { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.07)', marginBottom: '22px' };
const cardTitle = { color: '#1a0a00', fontSize: '1.05rem', fontWeight: '700', marginBottom: '18px' };
const lbl = { display: 'block', fontWeight: '600', color: '#3d2b1f', marginBottom: '6px', fontSize: '0.85rem' };
const inp = { width: '100%', padding: '10px 12px', border: '2px solid #e8d5c4', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

