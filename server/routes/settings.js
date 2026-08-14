import express from 'express';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB audio limit
});

router.post('/upload-music', protect, adminOnly, uploadMem.single('music'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No audio file provided' });

    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video', // Required by Cloudinary for audio files (mp3, wav, ogg, etc.)
            folder: 'durgapuja_music',
            public_id: `music_${Date.now()}`,
          },
          (err, result) => {
            if (err) {
              console.error('❌ Cloudinary audio upload error:', err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    settings.musicUrl = result.secure_url;
    await settings.save();
    res.json({ message: 'Music uploaded successfully!', musicUrl: settings.musicUrl });
  } catch (err) {
    console.error('❌ Upload music endpoint error:', err);
    res.status(500).json({ message: err.message || 'Music upload failed' });
  }
});

export default router;
