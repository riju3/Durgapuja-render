import React, { useState, useEffect } from 'react';
import api, { clearMemoryCache } from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [aboutText, setAboutText] = useState('');
  const [aboutTextBn, setAboutTextBn] = useState('');
  const [aboutCards, setAboutCards] = useState([]);
  const [thenNow, setThenNow] = useState({
    thenImage: '',
    thenLabel: 'THEN · 2019',
    nowImage: '',
    nowLabel: 'NOW · 2026'
  });
  const [uploadingThen, setUploadingThen] = useState(false);
  const [uploadingNow, setUploadingNow] = useState(false);

  // Card Form state
  const [cardTitle, setCardTitle] = useState('');
  const [cardContent, setCardContent] = useState('');
  const [cardImage, setCardImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      const data = res.data || {};
      setAboutText(data.aboutText || '');
      setAboutTextBn(data.aboutTextBn || '');
      setAboutCards(data.aboutCards || []);
      if (data.thenNow) {
        setThenNow({
          thenImage: data.thenNow.thenImage || '',
          thenLabel: data.thenNow.thenLabel || 'THEN · 2019',
          nowImage: data.thenNow.nowImage || '',
          nowLabel: data.thenNow.nowLabel || 'NOW · 2026'
        });
      }
    } catch (err) {
      toast.error('Failed to load About settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadThenImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingThen(true);
    try {
      const res = await api.post('/settings/upload-showcase-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setThenNow(prev => ({ ...prev, thenImage: res.data.imageUrl }));
      toast.success('THEN image uploaded!');
    } catch (err) {
      toast.error('THEN image upload failed');
    } finally {
      setUploadingThen(false);
    }
  };

  const handleUploadNowImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingNow(true);
    try {
      const res = await api.post('/settings/upload-showcase-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setThenNow(prev => ({ ...prev, nowImage: res.data.imageUrl }));
      toast.success('NOW image uploaded!');
    } catch (err) {
      toast.error('NOW image upload failed');
    } finally {
      setUploadingNow(false);
    }
  };

  const handleSaveThenNow = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { thenNow });
      clearMemoryCache('/settings');
      toast.success('Then vs Now Slider settings saved!');
    } catch (err) {
      toast.error('Failed to save Then vs Now Slider settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMainAbout = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { aboutText, aboutTextBn });
      clearMemoryCache('/settings');
      toast.success('About text updated successfully!');
    } catch (err) {
      toast.error('Failed to update About text');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/settings/upload-showcase-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCardImage(res.data.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddOrUpdateCard = async () => {
    if (!cardTitle.trim() && !cardContent.trim()) {
      toast.error('Please enter a title or text content');
      return;
    }

    const newCard = {
      title: cardTitle.trim(),
      content: cardContent.trim(),
      image: cardImage.trim(),
      order: editingIndex !== null ? aboutCards[editingIndex].order || 0 : aboutCards.length
    };

    let updatedCards = [];
    if (editingIndex !== null) {
      updatedCards = [...aboutCards];
      updatedCards[editingIndex] = newCard;
    } else {
      updatedCards = [...aboutCards, newCard];
    }

    setSaving(true);
    try {
      await api.put('/settings', { aboutCards: updatedCards });
      setAboutCards(updatedCards);
      clearMemoryCache('/settings');

      // Reset form
      setCardTitle('');
      setCardContent('');
      setCardImage('');
      setEditingIndex(null);

      toast.success(editingIndex !== null ? 'About box updated!' : 'New About box added!');
    } catch (err) {
      toast.error('Failed to save About box');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCard = (index) => {
    const card = aboutCards[index];
    setCardTitle(card.title || '');
    setCardContent(card.content || '');
    setCardImage(card.image || '');
    setEditingIndex(index);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteCard = async (index) => {
    if (!window.confirm('Are you sure you want to delete this About box?')) return;

    const updatedCards = aboutCards.filter((_, i) => i !== index);
    setSaving(true);
    try {
      await api.put('/settings', { aboutCards: updatedCards });
      setAboutCards(updatedCards);
      clearMemoryCache('/settings');
      toast.success('About box deleted!');
    } catch (err) {
      toast.error('Failed to delete About box');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setCardTitle('');
    setCardContent('');
    setCardImage('');
    setEditingIndex(null);
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#C0392B' }}>Loading About settings...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1a0a00', fontSize: '1.8rem', fontWeight: '700' }}>
          About Section Manager
        </h1>
        <p style={{ color: '#7a5c4f', fontSize: '0.9rem', marginTop: '4px' }}>
          Manage your About page descriptions and dynamic full-width text/image cards.
        </p>
      </div>

      {/* Main About Description Form */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '28px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)', borderTop: '4px solid #C0392B',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: '#C0392B', fontWeight: '700', marginBottom: '18px' }}>
          Main About Page Description
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#1a0a00', marginBottom: '8px', fontSize: '0.9rem' }}>
            About Description (English)
          </label>
          <textarea
            rows="4"
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            placeholder="Enter English description about Chowdhury Bari Durga Utsav..."
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8d5c4',
              fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#1a0a00', marginBottom: '8px', fontSize: '0.9rem' }}>
            About Description (Bengali - বাংলা)
          </label>
          <textarea
            rows="4"
            value={aboutTextBn}
            onChange={(e) => setAboutTextBn(e.target.value)}
            placeholder="চৌধুরী বাড়ির দুর্গাপূজা সম্পর্কে বাংলায় বিবরণ লিখুন..."
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8d5c4',
              fontSize: '0.92rem', fontFamily: 'Hind Siliguri, sans-serif', resize: 'vertical'
            }}
          />
        </div>

        <button
          onClick={handleSaveMainAbout}
          disabled={saving}
          style={{
            background: '#C0392B', color: '#fff', padding: '10px 24px', border: 'none',
            borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
          }}
        >
          {saving ? 'Saving...' : 'Save Main Description'}
        </button>
      </div>

      {/* Dynamic Full-Width About Cards Form */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '28px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)', borderTop: '4px solid #D4AF37',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1a0a00', fontWeight: '700', marginBottom: '6px' }}>
          {editingIndex !== null ? 'Edit Full-Width About Box' : 'Add New Full-Width About Box'}
        </h2>
        <p style={{ color: '#7a5c4f', fontSize: '0.85rem', marginBottom: '20px' }}>
          This text box will render full-width (spanning 3 columns) right below the 300+ Years stats cards on the About page.
        </p>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#1a0a00', marginBottom: '6px', fontSize: '0.88rem' }}>
            Box Title (Optional Heading)
          </label>
          <input
            type="text"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder="e.g. Our Heritage & History / আমাদের ঐতিহ্য ও ইতিহাস"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e8d5c4',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#1a0a00', marginBottom: '6px', fontSize: '0.88rem' }}>
            Full Paragraph Text Content (Large Text)
          </label>
          <textarea
            rows="6"
            value={cardContent}
            onChange={(e) => setCardContent(e.target.value)}
            placeholder="Write detailed paragraph text here..."
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8d5c4',
              fontSize: '0.92rem', fontFamily: 'Hind Siliguri, sans-serif', resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#1a0a00', marginBottom: '6px', fontSize: '0.88rem' }}>
            Box Image (Optional Image Attachment)
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ fontSize: '0.85rem' }}
            />
            {uploadingImage && <span style={{ color: '#C0392B', fontSize: '0.85rem' }}>Uploading...</span>}
          </div>
          {cardImage && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={cardImage} alt="Preview" style={{ height: '60px', width: '90px', objectFit: 'cover', borderRadius: '6px' }} />
              <button
                type="button"
                onClick={() => setCardImage('')}
                style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleAddOrUpdateCard}
            disabled={saving || uploadingImage}
            style={{
              background: editingIndex !== null ? '#27ae60' : '#C0392B',
              color: '#fff', padding: '10px 24px', border: 'none',
              borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            {editingIndex !== null ? 'Update Box' : 'Add Full-Width Box'}
          </button>
          {editingIndex !== null && (
            <button
              onClick={handleCancelEdit}
              style={{
                background: '#7f8c8d', color: '#fff', padding: '10px 20px', border: 'none',
                borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Existing Cards List */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1a0a00', fontWeight: '700', marginBottom: '18px' }}>
          Active Full-Width About Boxes ({aboutCards.length})
        </h2>

        {aboutCards.length === 0 ? (
          <p style={{ color: '#7a5c4f', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No full-width text boxes added yet. Use the form above to add custom text boxes.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {aboutCards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  padding: '20px', borderRadius: '10px', background: '#FDF6EC',
                  borderLeft: '5px solid #C0392B', border: '1px solid #e8d5c4',
                  borderLeftWidth: '5px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#C0392B', fontWeight: '700' }}>
                    {card.title || `About Box #${idx + 1}`}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditCard(idx)}
                      style={{ background: '#3498db', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(idx)}
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p style={{ color: '#3d2b1f', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'Hind Siliguri, sans-serif' }}>
                  {card.content}
                </p>

                {card.image && (
                  <div style={{ marginTop: '12px' }}>
                    <img src={card.image} alt={card.title} style={{ height: '100px', borderRadius: '6px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Then vs Now Before/After Comparison Slider Manager */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '28px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)', borderTop: '4px solid #C0392B',
        marginTop: '32px'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: '#C0392B', fontWeight: '700', marginBottom: '6px' }}>
          Interactive "Then vs Now" (Before / After) Comparison Slider
        </h2>
        <p style={{ color: '#7a5c4f', fontSize: '0.85rem', marginBottom: '20px' }}>
          Upload two photos (Past vs Present) to show an interactive drag comparison slider on the About page below the text boxes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* THEN Image Settings */}
          <div style={{ padding: '16px', borderRadius: '8px', background: '#FDF6EC', border: '1px solid #e8d5c4' }}>
            <h3 style={{ fontSize: '1rem', color: '#1a0a00', fontWeight: '700', marginBottom: '10px' }}>
              Left Photo (THEN / Past Image)
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Pill Badge Label</label>
              <input
                type="text"
                value={thenNow.thenLabel}
                onChange={(e) => setThenNow(p => ({ ...p, thenLabel: e.target.value }))}
                placeholder="THEN · 2019"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e8d5c4', fontSize: '0.88rem' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Upload THEN Photo</label>
              <input type="file" accept="image/*" onChange={handleUploadThenImage} style={{ fontSize: '0.82rem' }} />
              {uploadingThen && <span style={{ color: '#C0392B', fontSize: '0.82rem', marginLeft: '6px' }}>Uploading...</span>}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Or Paste THEN Image URL</label>
              <input
                type="text"
                value={thenNow.thenImage}
                onChange={(e) => setThenNow(p => ({ ...p, thenImage: e.target.value }))}
                placeholder="https://res.cloudinary.com/..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e8d5c4', fontSize: '0.85rem' }}
              />
            </div>
            {thenNow.thenImage && (
              <img src={thenNow.thenImage} alt="Then Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} />
            )}
          </div>

          {/* NOW Image Settings */}
          <div style={{ padding: '16px', borderRadius: '8px', background: '#FDF6EC', border: '1px solid #e8d5c4' }}>
            <h3 style={{ fontSize: '1rem', color: '#1a0a00', fontWeight: '700', marginBottom: '10px' }}>
              Right Photo (NOW / Present Image)
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Pill Badge Label</label>
              <input
                type="text"
                value={thenNow.nowLabel}
                onChange={(e) => setThenNow(p => ({ ...p, nowLabel: e.target.value }))}
                placeholder="NOW · 2026"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e8d5c4', fontSize: '0.88rem' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Upload NOW Photo</label>
              <input type="file" accept="image/*" onChange={handleUploadNowImage} style={{ fontSize: '0.82rem' }} />
              {uploadingNow && <span style={{ color: '#C0392B', fontSize: '0.82rem', marginLeft: '6px' }}>Uploading...</span>}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Or Paste NOW Image URL</label>
              <input
                type="text"
                value={thenNow.nowImage}
                onChange={(e) => setThenNow(p => ({ ...p, nowImage: e.target.value }))}
                placeholder="https://res.cloudinary.com/..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e8d5c4', fontSize: '0.85rem' }}
              />
            </div>
            {thenNow.nowImage && (
              <img src={thenNow.nowImage} alt="Now Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} />
            )}
          </div>
        </div>

        <button
          onClick={handleSaveThenNow}
          disabled={saving || uploadingThen || uploadingNow}
          style={{
            background: '#C0392B', color: '#fff', padding: '10px 24px', border: 'none',
            borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
          }}
        >
          {saving ? 'Saving Slider Settings...' : 'Save Then vs Now Slider Settings'}
        </button>
      </div>
    </div>
  );
}
