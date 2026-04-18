import express from 'express';
import Sponsor from '../models/Sponsor.js';
import { upload } from '../cloudinary.js';
import cloudinaryDefault from '../cloudinary.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET all sponsors
router.get('/', async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort('order');
    res.json(sponsors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload sponsor logo
router.post('/', protect, adminOnly, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    try {
      const { name, website, order } = req.body;
      const sponsor = await Sponsor.create({
        name: name || 'Sponsor',
        url: req.file.path,
        publicId: req.file.filename,
        website: website || '',
        order: order ? Number(order) : 0,
      });
      res.status(201).json(sponsor);
    } catch (dbErr) {
      res.status(500).json({ message: dbErr.message });
    }
  });
});

// DELETE sponsor
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    if (sponsor.publicId) {
      await cloudinaryDefault.uploader.destroy(sponsor.publicId);
    }
    await sponsor.deleteOne();
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
