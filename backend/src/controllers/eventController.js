const Event = require('../models/Event');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// ─── Organizer: Create Event ────────────────────────────────────────────────

const createEvent = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Event name required' });

    const event = await Event.create({ name, organizer: req.user._id });
    res.status(201).json({ event });
  } catch (err) {
    console.error('createEvent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Organizer: List Own Events ─────────────────────────────────────────────
//  Return all events owned by the authenticated organizer
const listEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .select('-photos')
      .sort('-createdAt');
    res.json({ events });
  } catch (err) {
    console.error('listEvents:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Organizer: Get Event Detail ─────────────────────────────────────────────

const getEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user._id,
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    console.error('getEvent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Organizer: Rename Event ────────────────────────────────────────────────

const updateEvent = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Event name required' });

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user._id },
      { name },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.json({ event });
  } catch (err) {
    console.error('updateEvent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Organizer: Delete Event ────────────────────────────────────────────────

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Delete face vectors from Supabase to prevent ghost matches
    const { error } = await supabase.from('face_vectors').delete().eq('event_code', event.code);
    if (error) console.error('Failed to delete vectors from Supabase:', error);

    // Delete event from MongoDB
    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('deleteEvent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Organizer: Get Presigned Upload URL ────────────────────────────────────
// The frontend calls this, then uploads directly to Supabase Storage.
// The backend never touches the binary image data.

const getUploadUrl = async (req, res) => {
  try {
    const { eventId, fileName, contentType } = req.body;
    if (!eventId || !fileName || !contentType)
      return res.status(400).json({ message: 'eventId, fileName, contentType required' });

    // Verify organizer owns this event
    const event = await Event.findOne({ _id: eventId, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ext = fileName.split('.').pop();
    const path = `events/${event.code}/${uuidv4()}.${ext}`;
    // Generate a unique file path: events/{eventCode}/{uuid}.{ext}
    const { data, error } = await supabase.storage
      .from('grabpic-photos')
      .createSignedUploadUrl(path);

    if (error) throw error;

    res.json({ uploadUrl: data.signedUrl, path, token: data.token });
  } catch (err) {
    console.error('getUploadUrl:', err);
    res.status(500).json({ message: 'Failed to generate upload URL' });
  }
};

// ─── Organizer: Confirm Upload + Store Vectors ──────────────────────────────
// After direct upload, frontend sends: { eventId, path, embeddings: [[...], ...] }

const confirmUpload = async (req, res) => {
  try {
    const { eventId, path, embeddings } = req.body;
    if (!eventId || !path)
      return res.status(400).json({ message: 'eventId and path required' });

    const event = await Event.findOne({ _id: eventId, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Get public URL from Supabase
    const { data: urlData } = supabase.storage
      .from('grabpic-photos')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    // Only insert face vectors if faces were actually detected.
    // Photos with no detected faces are still saved to the event
    // but no zero vectors are written to pgvector (avoids false matches).
    const vectorIds = [];
    if (embeddings && embeddings.length > 0) {
      for (const embedding of embeddings) {
        // Skip any empty or malformed embeddings
        if (!embedding || !embedding.length || embedding.every(v => v === 0)) continue;
        
        const id = uuidv4();
        const { error } = await supabase.rpc('upsert_face_vector', {
          p_id: id,
          p_event_code: event.code,
          p_photo_url: publicUrl,
          p_embedding: JSON.stringify(embedding),
        });
        if (!error) vectorIds.push(id);
      }
    }

    // Save photo record to MongoDB
    event.photos.push({ supabasePath: path, publicUrl, vectorIds });
    event.photoCount = event.photos.length;
    await event.save();

    res.json({ publicUrl, vectorIds });
  } catch (err) {
    console.error('confirmUpload:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Attendee: Lookup by Event Code (no auth required) ──────────────────────

const getEventByCode = async (req, res) => {
  try {
    const event = await Event.findOne({
      code: req.params.code.toUpperCase(),
      isActive: true,
    }).select('name code photoCount createdAt');

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    console.error('getEventByCode:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Attendee: Vector Search (no auth required) ─────────────────────────────
// Receives 128-d face vector, returns matching photo URLs
// Uses cosine distance via pgvector: 0.0 = identical, 1.0 = orthogonal

const searchByFace = async (req, res) => {
  try {
    const { eventCode, vector } = req.body;
    if (!eventCode || !vector?.length)
      return res.status(400).json({ message: 'eventCode and vector required' });

    const event = await Event.findOne({
      code: eventCode.toUpperCase(),
      isActive: true,
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Call pgvector KNN search via Supabase RPC
    // Cosine distance threshold: 0.4 is well-tuned for face-api.js 128-d descriptors
    const { data, error } = await supabase.rpc('search_face_vectors', {
      p_event_code: event.code,
      p_query_vector: JSON.stringify(vector),
      p_threshold: 0.4,
      p_limit: 100,
    });

    if (error) throw error;
    console.log(`[searchByFace] Event "${event.code}": ${data?.length || 0} vector matches out of ${event.photoCount} photos.`);
    if (data?.length) {
      console.log(`  Best match (cosine distance): ${data[0].distance.toFixed(4)}`);
      console.log(`  Worst match (cosine distance): ${data[data.length - 1].distance.toFixed(4)}`);
    }

    // Deduplicate photo URLs
    const urls = [...new Set((data || []).map((r) => r.photo_url))];
    res.json({ photos: urls, count: urls.length });
  } catch (err) {
    console.error('searchByFace:', err);
    res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getUploadUrl,
  confirmUpload,
  getEventByCode,
  searchByFace,
};
