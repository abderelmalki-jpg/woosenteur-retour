# Copilot Instructions for WooSenteur Codebase

## Project Overview
- **Monorepo** with Next.js frontend (`app/`), Firebase Cloud Functions backend (`functions/`), and Android native code (`android/`).
- **Main integrations:** Firebase (auth, Firestore, storage), Stripe, Google Gemini, Genkit AI, WooCommerce API, ReCaptcha.
- **Mobile:** Uses Capacitor for cross-platform builds (Android/iOS/web).

## Key Workflows
- **Frontend dev:**
  - Start: `npm run dev` (Next.js, auto-reloads)
  - Build: `npm run build`
  - Lint: `npm run lint`
- **Backend (Cloud Functions):**
  - Build: `npm run build` in `functions/`
  - Local emulation: `npm run serve` in `functions/`
  - Deploy: `npm run deploy` in `functions/`
- **Deployment:**
  - Vercel (recommended for Next.js): `vercel --prod`
  - Firebase Hosting: `firebase deploy`
  - Netlify: `netlify deploy --prod`
- **Android builds:**
  - Use scripts in `scripts/` and `android/` (see `build-android.ps1`)

## Conventions & Patterns
- **API routes:**
  - Next.js API routes in `app/api/` (frontend serverless)
  - Cloud Functions in `functions/src/` (backend logic)
- **Environment variables:**
  - Sensitive keys in `.env.local` (never commit service account JSON)
  - See `FIREBASE_ADMIN_SETUP.md` for Firebase Admin setup
- **Component structure:**
  - UI components in `components/ui/`, auth in `components/auth/`, dashboard in `components/dashboard/`
  - Use context providers from `contexts/` (e.g., `AuthContext.tsx`)
- **Type safety:**
  - Shared types in `types/`
  - Use Zod for validation
- **AI/Genkit:**
  - Prompts and flows in `lib/genkit/` and `functions/src/`

## Integration Points
- **Firebase:**
  - Admin SDK for backend, client SDK for frontend
  - Firestore rules in `firestore.rules`, Storage rules in `storage.rules`
- **Stripe:**
  - Webhooks and payments handled in backend (see API routes and functions)
- **WooCommerce:**
  - REST API integration in `lib/woocommerce/`
- **ReCaptcha:**
  - Frontend component in `components/ReCaptcha.tsx`, keys in env vars

## Security & Deployment
- **Never commit secrets** (service account JSON, API keys)
- **Headers and rewrites** configured in `firebase.json`
- **Follow deployment guides in `DEPLOYMENT.md` and `FIREBASE_ADMIN_SETUP.md`**

## Examples
- Add a new API route: `app/api/myroute/route.ts`
- Add a new Cloud Function: `functions/src/myFunction.ts`
- Add a new UI component: `components/ui/MyComponent.tsx`

---
For unclear workflows or missing conventions, check `DEPLOYMENT.md`, `FIREBASE_ADMIN_SETUP.md`, or ask for clarification.
