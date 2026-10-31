const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

// Human-friendly event codes: uppercase letters + digits, no ambiguous chars
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

const photoSchema = new mongoose.Schema({
  supabasePath: { type: String, required: true },
  publicUrl: { type: String, required: true },
  vectorIds: [{ type: String }], // IDs stored in pgvector
  uploadedAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    unique: true,
    default: () => nanoid(),
    uppercase: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  photos: [photoSchema],
  photoCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);
