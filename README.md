# Feedants – Competition Details (Full-Stack Module)

A functional, data-driven **Competition Details** screen: React Native (Expo) app + Node.js/Express API + MongoDB.
Nothing on the screen is hardcoded – prize pool, fee, spots, dates, judge, winners, rewards, reviews, referral link and the
user's own registration/submission state all come from the backend.

```
React Native (Expo) ──REST/JSON──▶ Express API ──▶ MongoDB
                                    ├─ auth (JWT)
                                    ├─ competitions (+ reviews)
                                    ├─ payment-order + register (atomic spot reservation)
                                    └─ submissions (multipart upload)
```

## Features
- Dynamic competition data served from MongoDB (seeded, not embedded in the app)
- JWT signup/login; session restored on launch; logged-out users can browse
- Registration with payment (mock by default, Razorpay test mode supported on the backend)
- Live spot availability (`remainingSpots` computed server-side) and progress bar
- Countdown driven by the **server clock** (device clock skew is corrected); banner switches to "Registration closed" at zero and the screen refetches
- Lifecycle derived from dates: registration window and submission window are independent (they overlap in the design)
- Button state machine: Register Now → Register • ₹99 → Processing… → Registered/Upload Submission → Submission Uploaded, plus Competition Full / Registration Closed / Registration Opens Soon / Submission opens … / Submission Closed
- Submission upload with server + client validation (type, size, window, one per user)
- Paginated reviews, referral copy/share, refund policy, previous winners with video links, ENG/हिंदी UI toggle, pull-to-refresh
- Loading, error (with retry), offline and not-found states

## Run it

### Prerequisites
Node 18+, MongoDB running locally (or an Atlas URI), Expo Go on a phone (or an emulator).

### Backend
```bash
cd backend
cp .env.example .env        # set JWT_SECRET, MONGODB_URI
npm install
npm run seed                # creates the competition + demo users
npm run dev                 # http://localhost:5000  (GET /health)
```
| Variable | Purpose |
|---|---|
| `PORT` | API port (5000) |
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | token signing |
| `PAYMENT_MODE` | `mock` (default) or `razorpay` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | only for `razorpay` mode |
| `CORS_ORIGIN`, `REFERRAL_BASE_URL`, `UPLOAD_DIR` | optional |

Seed logins: `demo@feedants.com / Demo@1234` (not registered) and `priya@feedants.com / Demo@1234` (already registered, so the competition shows **1/20 booked, 19 left**). Seed dates are relative to *now*, so the countdown is always live (~1d 6h left). Re-run `npm run seed` to reset.

### Frontend
```bash
cd frontend
cp .env.example .env        # EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:5000/api
npm install
npx expo install --fix      # aligns package versions with your Expo SDK
npx expo start
```
On a **physical phone use your computer's LAN IP, not `localhost`**. Android emulator: `http://10.0.2.2:5000/api`.

## API
All responses: `{ success, data }` or `{ success:false, error:{ code, message, details? } }`.

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/auth/signup`, `/login` · `GET /api/auth/me` | – / – / ✔ | account + session |
| `GET /api/competitions` | – | paginated summaries |
| `GET /api/competitions/:idOrSlug` | optional | full details + `userState` + `serverTime` |
| `GET /api/competitions/:id/reviews?page&limit` | – | paginated reviews + average |
| `POST /api/competitions/:id/payment-order` | ✔ | validates eligibility, creates payment order |
| `POST /api/competitions/:id/register` `{orderId,paymentId,signature}` | ✔ | verifies payment, reserves spot, registers; returns fresh details |
| `GET /api/competitions/:id/registration-status` | ✔ | `{registered,status,hasSubmitted}` |
| `POST /api/competitions/:id/submissions` (multipart `file`) | ✔ | upload (registered users, submission window, one per user) |
| `GET /api/competitions/:id/submissions/me` | ✔ | my submission |

Error codes used by the UI: `COMPETITION_NOT_FOUND`, `INVALID_COMPETITION_ID`, `ALREADY_REGISTERED`, `COMPETITION_FULL` (`refundRequired`), `REGISTRATION_CLOSED`, `REGISTRATION_NOT_STARTED`, `PAYMENT_VERIFICATION_FAILED`, `INVALID_ORDER`, `NOT_REGISTERED`, `SUBMISSION_NOT_STARTED`, `SUBMISSION_CLOSED`, `DUPLICATE_SUBMISSION`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `AUTH_REQUIRED`, `INVALID_TOKEN`, `VALIDATION_ERROR`.

## Database design
| Collection | Key points |
|---|---|
| `competitions` | all display content, dates, `maxParticipants`, `registeredCount` (atomic counter), submission rules; unique `slug`; date-order validation |
| `users` | `passwordHash` (bcrypt, `select:false`), unique `email`, `referralCode` |
| `registrations` | **unique `{userId, competitionId}`**, **unique `paymentId`**, `orderId`, `amountPaid` |
| `paymentorders` | order lifecycle `CREATED → PROCESSING → PAID` (`FAILED`, `REFUND_PENDING`), bound to user + competition |
| `submissions` | **unique `{userId, competitionId}`**, file metadata |
| `reviews` | index `{competitionId, createdAt:-1}`, paginated |

Lifecycle is **derived from dates on every request** (never stored), so it cannot go stale and needs no cron.

## Concurrency & consistency (the "last spot" problem)
`registrationService.registerForCompetition`:
1. The payment order is claimed atomically (`CREATED → PROCESSING`), so double-taps/retries can only be processed once.
2. Payment signature is verified server-side (HMAC-SHA256 for Razorpay).
3. The spot is reserved with **one conditional update**, no read-then-write:
   `findOneAndUpdate({ _id, $expr: { $lt: ['$registeredCount','$maxParticipants'] } }, { $inc: { registeredCount: 1 } })` – returns `null` when full. (`$expr` compares against the document's own limit rather than a hardcoded 20.)
4. The unique indexes are the final backstop (duplicate registration → `ALREADY_REGISTERED`).
5. If creating the registration fails, the reserved spot is released.

If payment succeeded but the competition filled up in between, the API returns `COMPETITION_FULL` with `refundRequired` and marks the order `REFUND_PENDING`. If the confirm call fails on the network after payment, the app offers a safe retry (same order, idempotent server-side).

## Assumptions
- One featured competition is opened by slug (`EXPO_PUBLIC_COMPETITION_SLUG`); navigation to Home/Explore/Create is out of scope, so those bottom-nav items are visual only. Profile opens login/logout.
- Registration requires an account and payment; the entry fee is > 0.
- **Payments default to mock mode**: the app shows a test checkout and the backend accepts the fixed signature `mock_signature`. This is only for demos – never deploy with `PAYMENT_MODE=mock`. In `razorpay` mode the backend creates real test orders and verifies signatures; the app needs `react-native-razorpay` in a dev build (not Expo Go) to open the real checkout – the returned `{paymentId, signature}` plugs into the same `/register` call.
- Only users who registered can submit; one submission per user; submissions may open before registration closes (as in the design).
- Times are shown in the device's local time zone. Only UI labels are translated (ENG/हिंदी); competition content is English.
- Images/videos in the seed are placeholders (pravatar, a sample MP4). Winner/intro/payout videos open in the system player.

## Technical decisions & trade-offs
- **Expo** for a quick setup; plain `fetch` wrapper with timeouts and typed errors instead of a data-fetching library (fewer dependencies; a cache like React Query would be the next step).
- **Server-authoritative UI**: the client derives *which button to show* (`utils/ctaState.js`, pure function), the server always re-checks every rule.
- **Denormalised `registeredCount`** for O(1) reads at the cost of keeping it consistent (handled with atomic ops and rollback). Counting registrations on each request would be simpler but slow under load.
- **Local disk uploads** keep the demo self-contained; not suitable for multiple instances.
- Mock payment gateway keeps the demo runnable without keys, at the cost of not exercising the real SDK on-device.

## Scalability notes
Stateless API (JWT, no sessions) behind a load balancer; indexes on every hot query; atomic updates instead of transactions; unique constraints as invariants; pagination on lists; rate limiting (global + auth); centralised error handling and input validation (zod); env-based config; lean queries; `Cache-Control: no-store` only on the per-user response.

## What I'd improve for production
- Razorpay webhooks (`payment.captured`) + a reconciliation job so a paid user is registered even if the app never calls `/register`; automated refunds for `REFUND_PENDING`.
- Direct-to-S3/GCS signed-URL uploads with virus scanning and magic-byte file sniffing (mime type is currently client-reported); video transcoding.
- Redis: cache the public part of the competition, rate-limit counters, and a waiting-list/queue for hot competitions; a read replica for reads.
- Refresh tokens + secure storage (Keychain/Keystore) instead of AsyncStorage; email verification; referral crediting.
- Server-side localisation of competition content; push notifications for deadlines/results; analytics and Sentry.
- Automated tests (Jest + supertest with mongodb-memory-server, including a concurrent "last spot" test; React Native Testing Library for the CTA states), CI, Docker.
