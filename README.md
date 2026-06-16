# FitCheck.ai

> Your personal AI style assistant — outfit recommendations from your own wardrobe, matched to your skin tone and occasion. Secured with **Google Firebase Authentication**.

---

## What it does

Upload your clothes once. Tell FitCheck.ai where you're going. Get outfit combinations — top + bottom + shoes — picked from your actual wardrobe, scored for color harmony and skin tone compatibility.

**How it works under the hood:**

1. **Google sign-in** — Firebase Authentication handles user identity via Google OAuth popup
2. **Selfie → skin tone** — MediaPipe FaceLandmarker (Tasks API) detects your face, samples forehead and cheek pixels, maps to Fitzpatrick scale
3. **Photo → clothing features** — OpenCV KMeans extracts dominant colors; a vision + label classifier detects category (top / bottom / shoes / dress / outerwear)
4. **Features → vectors** — `sentence-transformers` embeds occasion tags and style labels into a 387-dim vector stored in ChromaDB
5. **Occasion → outfits** — query vector finds the closest items per category; outfit builder ranks combos by vector similarity + skin compatibility + color harmony + occasion match

---

## Project structure

```
fitcheck-ai/
├── backend/                        # FastAPI + Python ML stack
│   ├── main.py                     # All API routes
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── data/
│   │   ├── face_landmarker.task    # MediaPipe face model bundle
│   │   ├── chromadb/               # vector store (persisted)
│   │   └── uploads/                # clothing photos
│   ├── scripts/
│   │   ├── dominant_color.py       # OpenCV KMeans color extraction
│   │   ├── skin_tone_detection.py  # MediaPipe FaceLandmarker (Tasks API) + Fitzpatrick scale
│   │   └── clothing_classifier.py  # top / bottom / shoes detection
│   ├── recommendation/
│   │   ├── embeddings.py           # features → 387-dim vector
│   │   ├── vectorstore.py          # ChromaDB read/write
│   │   └── outfit_builder.py       # combo ranking + scoring
│   └── startup_check.py            # environment verification
├── frontend/                       # React + Vite + Tailwind
│   ├── src/
│   │   ├── main.jsx                # entry point (wrapped with AuthProvider)
│   │   ├── App.jsx                 # routing + nav + auth gate
│   │   ├── lib/
│   │   │   └── firebase.js         # Firebase config + Google Auth
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React auth context (useAuth hook)
│   │   ├── pages/
│   │   │   ├── Onboard.jsx         # profile + skin tone setup (uses Firebase UID)
│   │   │   ├── Wardrobe.jsx        # upload + manage clothes (uses Firebase UID)
│   │   │   └── Recommend.jsx       # occasion → outfit results (uses Firebase UID)
│   │   └── utils/api.js            # axios calls to backend
│   ├── Dockerfile
│   └── nginx.conf                  # SPA routing + API proxy
├── tests/
│   ├── conftest.py                 # synthetic image fixtures
│   ├── test_cv.py                  # 29 CV unit tests
│   ├── test_recommendation.py      # 35 recommendation unit tests
│   └── test_api.py                 # 14 end-to-end API tests
├── docker-compose.yml              # run everything with one command
├── .env.example                    # environment variable template
└── pytest.ini
```

---

## Quick start — Docker (recommended)

**Requirements:** Docker + Docker Compose

```bash
# 1. Clone the repo
git clone https://github.com/your-username/fitcheck-ai.git
cd fitcheck-ai

# 2. Set up environment
cp .env.example .env

# 3. Build and start
docker-compose up --build
```

App is live at **http://localhost**  
API docs at **http://localhost:8000/docs**

To stop:
```bash
docker-compose down
```

Your wardrobe data and uploaded photos persist across restarts via Docker named volumes.

---

## Authentication

FitCheck.ai uses **Google Firebase Authentication** for secure user sign-in.

### How it works

1. Users click **"Sign in with Google"** on the landing page
2. A Google OAuth popup handles authentication
3. On success, the app uses the Firebase `user.uid` as the unique identifier for all backend API calls (wardrobe, recommendations, profile)
4. The nav bar displays the user's Google profile picture, name, and a sign-out button

### Firebase project

| Setting | Value |
|---------|-------|
| Project ID | `fitcheckai-504db` |
| Auth provider | Google (popup flow) |
| SDK | Firebase JS SDK v12+ |

### Key files

| File | Purpose |
|------|--------|
| `frontend/src/lib/firebase.js` | Firebase app init + Google Auth provider |
| `frontend/src/context/AuthContext.jsx` | React context providing `useAuth()` hook |
| `frontend/src/App.jsx` | Auth gate — renders sign-in page or app |

> **Setup:** Make sure Google sign-in is enabled in [Firebase Console](https://console.firebase.google.com/) → Authentication → Sign-in method → Google.

---

## Local development setup

### Backend

**Requirements:** Python 3.11+

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

API available at: **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### Frontend

**Requirements:** Node.js 20+

```bash
cd frontend

# Install dependencies
npm install

# Build frontend (outputs to backend/static/dist/)
npm run build

# Or start dev server (proxies /api/* to backend:8000)
npm run dev
```

Dev server available at: **http://localhost:5173**  
Unified app (backend serves built frontend): **http://localhost:8000**

> Both backend and frontend must be running together for the full app to work.

---

## API reference

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/onboard` | Save user profile + detect skin tone from selfie |
| `POST` | `/wardrobe/add` | Upload clothing item → extract features → store in ChromaDB |
| `GET` | `/wardrobe/{user_id}` | List all wardrobe items |
| `DELETE` | `/wardrobe/{user_id}/{item_id}` | Remove a clothing item |
| `POST` | `/recommend` | Get outfit combos for an occasion |
| `GET` | `/profile/{user_id}` | Get user body profile |

### Example: onboard a user

```bash
curl -X POST http://localhost:8000/onboard \
  -F "user_id=priya" \
  -F "gender=female" \
  -F "body_type=athletic" \
  -F "selfie=@/path/to/selfie.jpg"
```

### Example: add a clothing item

```bash
curl -X POST http://localhost:8000/wardrobe/add \
  -F "user_id=priya" \
  -F "label=navy blue kurta" \
  -F "occasion_tags=wedding,festival" \
  -F "pattern=solid" \
  -F "image=@/path/to/kurta.jpg"
```

### Example: get outfit recommendations

```bash
curl -X POST http://localhost:8000/recommend \
  -F "user_id=priya" \
  -F "occasion=wedding" \
  -F "style_preference=traditional"
```

---

## Running tests

```bash
cd backend

# Install test dependencies
pip install -r ../tests/requirements-test.txt

# Run all 78 tests
pytest ../tests/ -v

# Run by module
pytest ../tests/test_cv.py -v             # 29 CV unit tests
pytest ../tests/test_recommendation.py -v # 35 recommendation tests
pytest ../tests/test_api.py -v            # 14 API integration tests
```

Tests use synthetic in-memory images (no real photos needed) and redirect ChromaDB to a temp directory — production data is never touched.

---

## Outfit scoring

Each recommended outfit combo is scored across four factors:

| Factor | Weight | What it checks |
|--------|--------|----------------|
| Vector similarity | 35% | How closely the item's embedding matches the occasion query |
| Skin compatibility | 25% | Whether the clothing color suits the detected skin tone |
| Color harmony | 20% | Whether top + bottom + shoes colors work well together |
| Occasion match | 20% | Whether the item is tagged for the requested occasion |

---

## Environment variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | `development` or `production` |
| `SECRET_KEY` | — | Random secret for future auth (generate with `openssl rand -hex 32`) |
| `CHROMA_DB_PATH` | `/app/data/chromadb` | Where ChromaDB stores its data |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | sentence-transformers model name |
| `ALLOWED_ORIGINS` | `http://localhost` | Comma-separated CORS origins |
| `MAX_UPLOAD_MB` | `20` | Max clothing photo size in MB |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Authentication | Firebase Authentication (Google OAuth) |
| Backend | FastAPI, Python 3.11 |
| Computer vision | OpenCV, MediaPipe (Tasks API — FaceLandmarker) |
| NLP / embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| Vector database | ChromaDB (cosine similarity) |
| Containerisation | Docker, docker-compose, nginx |
| Testing | pytest, httpx, pytest-asyncio |

---

## UI Screenshots

Interface screenshots (add files under `docs/screenshots/`):

| Screen | Screenshot |
|---|---|
| Google Sign-in | ![Sign-in](docs/screenshots/signin.png) |
| Onboarding | ![Onboarding](docs/screenshots/onboard.png) |
| Wardrobe | ![Wardrobe](docs/screenshots/wardrobe.png) |
| Recommendation | ![Recommendation](docs/screenshots/recommend.png) |

---

## Roadmap


- [x] Backend — FastAPI + ChromaDB + CV/NLP pipeline
- [x] Frontend — React Digital Closet UI (3 pages)
- [x] Docker + docker-compose setup
- [x] Integration test suite (78 tests)
- [x] User authentication — Google sign-in via Firebase
- [x] MediaPipe migration — upgraded to Tasks API (FaceLandmarker)
- [ ] Mobile app — React Native (iOS + Android)
- [ ] Outfit history + favourites
- [ ] Style trend suggestions using NLP on fashion data
- [ ] Body type fit recommendations

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Run tests before committing: `pytest tests/ -v`
4. Open a pull request

---

## License

MIT
