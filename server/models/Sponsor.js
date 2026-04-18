import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },       // image URL from Cloudinary
  publicId: { type: String },                  // Cloudinary public ID
  website: { type: String, default: '' },      // optional link
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Sponsor || mongoose.model('Sponsor', sponsorSchema);
