import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  pujaYear: { type: Number, default: 2025 },
  youtubeUrl: { type: String, default: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  address: { type: String, default: 'Chowdhurybati, Durgapur, West Bengal' },
  addressBn: { type: String, default: 'চৌধুরীবাটি, দুর্গাপুর, পশ্চিমবঙ্গ' },
  email: { type: String, default: 'chowdhurybatidurgautsav@gmail.com' },
  phone: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  youtube: { type: String, default: '' },
  aboutText: { type: String, default: '' },
  aboutTextBn: { type: String, default: '' },
  // Puja countdown dates (ISO date strings, e.g. "2025-10-02")
  dateMailaya:  { type: String, default: '' },
  datePanchami: { type: String, default: '' },
  dateSasthi:   { type: String, default: '' },
  dateSaptami:  { type: String, default: '' },
  dateAstami:   { type: String, default: '' },
  dateNavami:   { type: String, default: '' },
  dateDashami:  { type: String, default: '' },
  musicUrl:     { type: String, default: '' },
  mapUrl:       { type: String, default: '' },
  traditionCard1: { type: String, default: '' },
  traditionCard2: { type: String, default: '' },
  traditionCard3: { type: String, default: '' },
  // Interactive 3-Card Scroll Showcase (Up to 15 cards)
  showcaseCards: [{
    imageUrl: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  // Dynamic About Page full-width text/image cards
  aboutCards: [{
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 }
  }],
  // Interactive Then vs Now Before/After Comparison Slider
  thenNow: {
    thenImage: { type: String, default: '' },
    thenLabel: { type: String, default: 'THEN · 2019' },
    nowImage: { type: String, default: '' },
    nowLabel: { type: String, default: 'NOW · 2026' }
  },
}, { timestamps: true });


export default mongoose.model('Settings', settingsSchema);
