# MoodTracker

Track your mood with a 1-5 rating (shown as faces and words), optional feeling and activity
tags, notes, a 7-day chart, history with filters, and insights about what lifts or drags your mood.

**Stack:** React (JavaScript) + Vite + Tailwind + Chart.js · Node + Express 5 + MongoDB (Mongoose)

```
MoodTracker/
├── backend/
│   ├── server.js            local/Render entry: starts the API, connects to MongoDB (keeps retrying)
│   ├── api/index.js         Vercel entry (serverless), vercel.json sends every request here
│   ├── app.js               Express app: helmet, CORS, rate limits, routes
│   ├── config/              env.js (reads + checks .env)   db.js (connection, retry, explains errors)
│   ├── constants/moods.js   rating range, tag lists, limits
│   ├── models/              User.js, Mood.js
│   ├── validators/          zod schemas for every request
│   ├── middleware/          auth, validate, timezone, requireDb, rate limiters, errors
│   ├── controllers/         authController.js, moodController.js
│   ├── routes/              auth.js, mood.js
│   ├── utils/               time.js (timezone maths), migrateLegacy.js
│   ├── scripts/             setup.js, check-db.js, migrate.js
│   └── tests/               unit + API tests
└── Frontend/
    └── src/
        ├── pages/           Login, Dashboard, History
        ├── components/      auth/, dashboard/, mood/, common/
        ├── services/        api.js (all requests, 401 handling), apiStatus.js
        ├── context/         NotificationContext.jsx
        ├── hooks/ utils/    stats, mood constants, auth storage
        └── config.js        picks the backend URL
```

## 1. Run it on your computer

You need **Node.js 20 or newer** (`node -v`) and a free **MongoDB Atlas** cluster.

### a) Atlas (once)
1. Atlas > **Database Access** > Add user (username + password, letters/numbers only is easiest).
2. Atlas > **Network Access** > Add IP Address > **Allow Access From Anywhere** (`0.0.0.0/0`) > Confirm.
   Wait until the row says **Active**.
3. Atlas > **Database** > **Connect** > **Drivers** > copy the connection string.

### b) Backend
```bash
cd backend
npm install
npm run setup        # paste the connection string + password; it writes .env and tests the connection
npm start
```
You should see `✅ MongoDB connected`. If anything is wrong, the message tells you what to fix.
Run `npm run check-db` any time for a step-by-step diagnosis.

### c) Frontend (second terminal)
```bash
cd Frontend
npm install
npm run dev          # http://localhost:5173
```
No `.env` is needed locally: it talks to `http://localhost:5000/api` by default.

## 2. Deploy both on Vercel

You make **two Vercel projects from the same GitHub repo**: one for `backend`, one for `Frontend`.
Order matters because each needs the other's URL.

**0. Atlas:** Network Access must allow `0.0.0.0/0` (Vercel's IP addresses change).

**1. Backend project** - Vercel > Add New > Project > import your repo
- **Root Directory:** `backend`   ·   **Framework Preset:** Other (leave build settings empty)
- **Environment Variables:** `MONGO_URI` and `JWT_SECRET` (16+ random characters)
- Deploy, then open `https://YOUR-BACKEND.vercel.app/api/health`. You want `"connected": true`.
  (If it says `CONFIG_ERROR`, the message names the missing variable.)

**2. Frontend project** - Add New > Project > same repo
- **Root Directory:** `Frontend`   ·   **Framework Preset:** Vite (auto-detected)
- **Environment Variable:** `VITE_API_BASE_URL` = `https://YOUR-BACKEND.vercel.app/api` (must end with `/api`)
- Deploy. Note the frontend's address, e.g. `https://YOUR-FRONTEND.vercel.app`.

**3. Tell the backend who may call it** - backend project > Settings > Environment Variables:
add `CORS_ORIGINS` = `https://YOUR-FRONTEND.vercel.app`, then **Deployments > latest > Redeploy**
(changed variables only apply to new deployments; the same is true for the frontend variable).

Use the **short production address** (Settings > Domains) in both variables, not the long
per-deployment URLs: Vercel's default Deployment Protection puts a login page in front of those,
which breaks API calls.

The backend runs as a serverless function (`backend/api/index.js` + `backend/vercel.json`); it
reconnects to MongoDB on demand, so there is nothing to keep alive. Tip: in the backend project,
Settings > Functions, pick the region closest to your Atlas cluster.

*(Alternative: backend on Render - Root Directory `backend`, Build `npm install`, Start `npm start`,
same three variables. Both options use the same code.)*

## 3. Troubleshooting
| You see | Do this |
|---|---|
| `injecting env (0)` / "empty" / "UTF-16" / "MONGO_URI is missing" | `npm run setup` |
| "Could not reach MongoDB" | Atlas Network Access: allow `0.0.0.0/0` and wait for **Active**; cluster not Paused; no VPN |
| "rejected the username or password" | Use the *database user's* password (Atlas > Database Access), then `npm run setup` |
| "Can't reach the server at ..." in the app | Backend not running, or `VITE_API_BASE_URL` wrong (on Vercel: redeploy after changing it) |
| Browser says "blocked by CORS" | Set `CORS_ORIGINS` on the backend to the frontend's short production URL, then Redeploy |
| API returns a Vercel login page / HTML | You used a long deployment URL; use the production domain |
| `/api/health` shows `CONFIG_ERROR` | The message names the missing environment variable |
| "The server can't reach its database" | Backend is up but MongoDB isn't; fix as above, it reconnects by itself |
| "Port 5000 is already in use" | The backend is already running in another terminal |

## 4. Tests
```bash
cd backend
npm test                                   # unit tests (no database needed)
TEST_MONGO_URI=mongodb://127.0.0.1:27017 npm test   # + full API tests on a local MongoDB (uses a throw-away database)
```
(On Windows CMD: `set TEST_MONGO_URI=mongodb://127.0.0.1:27017` first, then `npm test`.)

## 5. API (all `/api/moods/*` need `Authorization: Bearer <token>`; the app also sends `X-Timezone`)
| Method + path | What it does |
|---|---|
| `POST /auth/signup` · `POST /auth/login` · `GET /auth/verify` | accounts |
| `POST /moods` | add `{ rating 1-5, emotions[], activities[], note }` (max 10 per day) |
| `GET /moods?page&limit&from&to&rating&emotion&activity` | history, paginated + filters |
| `GET /moods/dashboard` | 10 newest + 30 days of history |
| `GET /moods/daily-count` | today's count |
| `GET /moods/insights` | what lifts / drags your mood (90 days, tags with 3+ entries) |
| `PUT /moods/:id` · `DELETE /moods/:id` | edit / delete your own entry |
| `GET /health` | server + database status |

Old entries saved with the previous -5..+5 scale are converted automatically when the server starts
(`npm run migrate` does the same by hand).
