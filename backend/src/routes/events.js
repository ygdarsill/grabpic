const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getUploadUrl,
  confirmUpload,
  getEventByCode,
  searchByFace,
} = require('../controllers/eventController');

// Attendee routes (no auth)
router.get('/code/:code', getEventByCode);
router.post('/search', searchByFace);

// Organizer routes (auth required)
router.use(protect);
router.post('/', createEvent);
router.get('/', listEvents);
router.get('/:id', getEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/upload-url', getUploadUrl);
router.post('/confirm-upload', confirmUpload);

module.exports = router;
