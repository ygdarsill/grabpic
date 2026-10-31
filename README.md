# GrabPic 

Zero-cost photo distribution platform. Organizers upload event photos in bulk; attendees take a selfie and instantly get their personalized gallery.

## Architecture

- **Frontend**: React + Vite (Vercel/Netlify)
- **Backend**: Node.js + Express (Render/Railway free tier)
- **Database**: MongoDB Atlas (metadata, users, events)
- **Vector DB + Storage**: Supabase (pgvector for face search, Storage for photos)
- **AI**: face-api.js running client-side (zero server CPU)

---

## Quick Start

### Prerequisites

You'll need accounts (all free):
- [MongoDB Atlas](https://www.mongodb.com/atlas) — you said you have this 
- [Supabase](https://supabase.com) — create a free project
- [Vercel](https://vercel.com) or [Netlify](https://netlify.com) for frontend
- [Render](https://render.com) for backend

---

## Step 1: Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**
3. Paste and run the contents of `supabase_setup.sql`
4. This will:
   - Enable `pgvector` extension
   - Create the `face_vectors` table with a 128-d vector column
   - Create two RPC functions (`upsert_face_vector`, `search_face_vectors`)
   - Create the `grabpic-photos` storage bucket (public)

Get your credentials from **Settings → API**:
- `SUPABASE_URL` — your project URL
- `SUPABASE_SERVICE_KEY` — service_role key (for backend, keeps in env only)
- `VITE_SUPABASE_ANON_KEY` — anon/public key (for frontend direct uploads)

---

## Step 2: Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

**Required `.env` values:**

```env
MONGODB_URI=mongodb+srv://...    # Your Atlas connection string
JWT_SECRET=some-long-random-string
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...      # service_role key
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Step 3: Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in your values
npm install
npm run dev
```

**Required `.env` values:**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...    # anon/public key
```



---

## User Flows

### Organizer
1. Register at `/register`
2. Create an event → get a unique event code (e.g. `TRIP2026`)
3. Upload photos via drag & drop
   - Photos compressed client-side → uploaded directly to Supabase Storage
   - Faces detected via face-api.js → 128-d vectors stored in pgvector
4. Share event code with attendees

### Attendee
1. Go to `/join` and enter event code
2. Take a selfie (processed in browser — never uploaded)
3. See personalized gallery of only their photos
4. Download individually or all at once

---

## Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on Render
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `.env`
6. Update `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on Vercel
3. Set environment variables (`VITE_*` keys)
4. Deploy — Vercel auto-detects Vite

---

## Free Tier Limits

| Service | Limit | GrabPic usage |
|---------|-------|----------------|
| MongoDB Atlas | 512 MB | Text metadata only — very light |
| Supabase DB | 500 MB | ~10,000+ face vectors per 500 MB |
| Supabase Storage | 1 GB | ~500–2000 compressed photos |
| Render | 750 hrs/mo | Spins down after 15 min idle |
| Vercel | Unlimited static | Frontend only — no limits |

### Cold start note
Render free tier spins down after inactivity. The first request after sleep takes ~30 seconds. The frontend shows a "waking up" message automatically — the `searchByFace` and `getEventByCode` routes have built-in retry tolerance.

---

## Project Structure

```
grabpic/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js    # register, login, me
│   │   │   └── eventController.js  # events CRUD + upload + vector search
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT protect middleware
│   │   ├── models/
│   │   │   ├── User.js             # organizer accounts
│   │   │   └── Event.js            # event spaces + photo records
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── events.js
│   │   ├── config/
│   │   │   └── supabase.js
│   │   └── index.js               # Express app
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UploadZone.jsx     # Drag & drop + compression + face indexing
│   │   │   └── SelfieCapture.jsx  # Webcam + face-api.js extraction
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx  # Organizer event list
│   │   │   ├── EventPage.jsx      # Upload + event management
│   │   │   ├── AttendeePage.jsx   # Event code + selfie
│   │   │   └── GalleryPage.jsx    # Matched photos + download
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── utils/
│   │       ├── api.js             # Axios instance
│   │       ├── faceEngine.js      # face-api.js wrapper
│   │       ├── compress.js        # browser-image-compression wrapper
│   │       └── supabase.js        # Direct upload to Supabase Storage
│   ├── .env.example
│   └── package.json
└── supabase_setup.sql            # Run this first in Supabase SQL Editor
```

---

## Key Design Decisions

**Binary data never touches Node.js** — The backend is a pure JSON router. Images go directly from browser → Supabase Storage via presigned URLs. This keeps backend memory at ~50MB, well within Render's free tier.

**Face recognition runs in the browser** — face-api.js uses SSD MobileNet V1 locally. The attendee's selfie descriptor is extracted client-side and only the 128 floats are sent to the backend. No facial images are transmitted during search.

**Cosine distance threshold of 0.4** — Tunable in `eventController.js`. In cosine distance, 0.0 = identical and 1.0 = orthogonal. Raise the threshold (e.g. 0.5) if attendees miss photos; lower it (0.3) to reduce false positives.

**Batch processing** — Photos are processed 5 at a time in `UploadZone.jsx`. Vector writes are per-photo. Adjust `BATCH_SIZE` in `UploadZone.jsx` based on device capability.
