# FITORA — Your AI-Powered Health Companion

A production-oriented, mobile-first full-stack fitness and health tracking web application designed specifically for **Athletes**, **Senior Citizens**, **Gym Freaks**, and **Everyday Wellness**.

---

## 🌟 Visual & Architectural Overview

- **Design Aesthetic:** Clean white background (`#F7FAF8` / `#FFFFFF`), soft green primary (`#2FA878`), dark green accents (`#176B4D`), subtle blue highlights (`#3197C8`), rounded cards, and modern typography (Plus Jakarta Sans & Outfit).
- **Senior Friendly Mode:** One-tap high-contrast mode with extra-large typography, high-visibility touch targets, and voice text-to-speech companion reading.
- **Emergency SOS Shortcuts:** One-tap access to Indian emergency helplines (**112** National Emergency, **108** Medical Ambulance, **14567** Elder Line) and saved personal emergency contacts with explicit consent.
- **Indian Pricing in ₹ INR:** Free Basic, Freemium (₹99 - ₹199/mo), and Premium (₹299/mo or ₹1,999 Care package) with server-side transaction verification and digital invoice generation.

---

## 🏗️ Technology Stack

### Frontend (`/client`)
- **React 19 & Vite:** Lightning-fast HMR and optimized production bundling.
- **Tailwind CSS v4:** Responsive design system with custom wellness color tokens.
- **React Router v7:** Seamless client-side routing with protected authenticated routes.
- **Lucide React:** Accessible, modern icons.
- **Canvas Confetti:** Rewarding habit streak achievements and checkout confirmations.

### Backend (`/server`)
- **Node.js & Express.js:** REST API architecture with global rate-limiting and CORS.
- **JWT & bcryptjs:** Secure stateless session tokens and password hashing.
- **Prisma ORM & PostgreSQL:** 28 relational tables in `fitora_db` with relational constraints, cascade deletions, and audit logging.
- **node-cron:** Background scheduler executing medicine reminders and daily habit resets.
- **Context-Aware AI Companion Engine:** Intelligent coaching tailored per module with strict medical red-flag detection (chest pain, shortness of breath, severe dizziness triggers immediate emergency alerts).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v18+ (tested on Node v24.19.0)
- **PostgreSQL:** Running on `localhost:5432` with database `fitora_db`.

### 2. Environment Setup
In `server/.env`:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/fitora_db"
JWT_SECRET="fitora_super_secret_jwt_key_2026_wellness_companion"
PORT=5000
NODE_ENV=development
AI_PROVIDER_KEY=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

### 3. Database Initialization & Seeding
From the `server` directory:
```bash
npx prisma generate
npx prisma db push
node src/seed/seed.js
```

### 4. Running the Platform
To run both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
node run-all.js
```
Or run separately:
- Backend: `npm run dev --prefix server`
- Frontend: `npm run dev --prefix client`

---

## 👥 Demo Accounts (One-Click Logins on Login Page)

| Role / Module | Email | Password | Entitlement Tier |
|---|---|---|---|
| **Senior Citizen** | `senior@fitora.com` | `fitora123` | Premium Care Package (₹1,999) |
| **Athlete** | `athlete@fitora.com` | `fitora123` | Freemium (₹99/mo) |
| **Gym Freak** | `gym@fitora.com` | `fitora123` | Premium (₹299/mo) |
| **Normal Everyday** | `user@fitora.com` | `fitora123` | Free Basic (₹0) |
| **Administrator** | `admin@fitora.com` | `admin123` | Full Admin Access |

---

## 🧩 Four Main User Modules

### Module A: Athletes
- **Focus:** High performance, explosive power, VO2 max endurance, and active tissue recovery.
- **Features:** Sport selection, training days and intensity tracking, sports nutrition, supplement guides, and athletic check-ins.

### Module B: Senior Citizens
- **Focus:** Joint mobility, gentle walking, fall prevention, scheduled medicine adherence, and emergency safety.
- **Features:** High-contrast senior UI mode, speech synthesis read-aloud, scheduled medicine reminders with one-click "Mark as Taken", and one-tap 112 / 108 / 14567 emergency dialer.

### Module C: Gym Freaks
- **Focus:** Hypertrophy, progressive overload, resistance splits, and protein timing.
- **Features:** Exercise library with barbell and dumbbell movements, educational somatotype guidance (Ectomorph, Mesomorph, Endomorph), daily protein calculators, and partner gym directory.

### Module D: Normal People
- **Focus:** Sustainable daily wellness, energy balance, and habit streaks.
- **Features:** 20-minute low-impact workouts, water intake logger (+250ml / +500ml), sleep tracking, wholesome recipes, and habit completion tracker.

---

## 🧪 Automated Integration Tests

A comprehensive 10-phase integration test suite runs natively with Node test runner:
```bash
npm test --prefix server
```
**Test Coverage:**
1. Health check & PostgreSQL connectivity
2. JWT Authentication & role resolution
3. Personalized Senior Dashboard aggregation
4. Hydration tracking with automatic target adjustments
5. Daily habit toggling with streak calculation
6. Medicine reminder acknowledgment
7. AI companion context-aware coaching
8. AI safety guardrail (chest pain / shortness of breath triggers immediate emergency warning)
9. Indian subscription checkout order & server-side payment verification
10. Admin statistics and user management privilege isolation

---

## 🛡️ Medical Disclaimer
FITORA is an automated fitness, wellness, and routine companion. It does not diagnose diseases, prescribe medications, or alter clinical treatments. For acute medical warning signs or severe symptoms, users are immediately directed to emergency services.
