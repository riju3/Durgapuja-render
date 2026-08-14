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
  });
  const [saving, setSaving] = useState(false);

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

        {/* Address */}
        <div style={card}>
          <h3 style={cardTitle}>📍 Address</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="settings-grid">
            <Field label="Address (English)" field="address" placeholder="Chowdhurybati, Durgapur, West Bengal" />
            <Field label="ঠিকানা (বাংলা)" field="addressBn" placeholder="চৌধুরীবাটি, দুর্গাপুর, পশ্চিমবঙ্গ" bengali />
          </div>
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving}
            style={{ padding: '13px 36px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '💾 Save All Settings'}
          </button>
        </div>
      </form>

      {/* ── Manage Admins Section ── */}
      <div style={{ ...card, marginTop: '32px' }}>
        <h3 style={cardTitle}>🛡️ Manage Admins</h3>

        {/* Create New Admin Form */}
        <div style={{ background: '#FDF6EC', borderRadius: '10px', padding: '20px', marginBottom: '24px', border: '1px solid #f0e0d0' }}>
          <h4 style={{ color: '#C0392B', fontWeight: '700', marginBottom: '16px', fontSize: '0.95rem' }}>➕ নতুন Admin তৈরি করো</h4>
          <form onSubmit={handleCreateAdmin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }} className="settings-grid">
              <div>
                <label style={lbl}>Name</label>
                <input
                  type="text" required style={inp}
                  value={newAdmin.name}
                  onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
                  placeholder="Admin এর নাম"
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
                    placeholder="কমপক্ষে ৬ অক্ষর"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#7a5c4f' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={creating}
              style={{ padding: '10px 28px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Creating...' : '✅ Admin তৈরি করো'}
            </button>
          </form>
        </div>

        {/* Existing Admins List */}
        <h4 style={{ color: '#1a0a00', fontWeight: '700', marginBottom: '12px', fontSize: '0.95rem' }}>📋 বর্তমান Admin তালিকা</h4>
        {adminsLoading ? (
          <p style={{ color: '#7a5c4f', fontSize: '0.9rem' }}>Loading...</p>
        ) : admins.length === 0 ? (
          <p style={{ color: '#7a5c4f', fontSize: '0.9rem' }}>কোনো admin নেই।</p>
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
                    {new Date(admin.createdAt).toLocaleDateString('bn-IN')}
                  </span>
                  {currentUser?.id !== admin._id && (
                    <button
                      onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                      style={{ padding: '6px 14px', background: 'transparent', color: '#C0392B', border: '1.5px solid #C0392B', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                      🗑️ সরাও
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

