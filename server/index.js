import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import galleryRoutes from './routes/gallery.js';
import eventsRoutes from './routes/events.js';
import teamRoutes from './routes/team.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import downloadsRoutes from './routes/downloads.js';
import sponsorsRoutes from './routes/sponsors.js';

dotenv.config();

const app = express();

// CORS - allow both localhost (dev) and Render frontend URL (prod)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (Render uses this)
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Chowdhurybati Durga Puja API 🙏' }));
app.get('/', (req, res) => res.json({ message: 'Chowdhurybati Durga Puja API 🙏' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/downloads', downloadsRoutes);
app.use('/api/sponsors', sponsorsRoutes);

// MongoDB Connection + Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
