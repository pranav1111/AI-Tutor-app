# Vocalis AI — Product Document

> Complete codebase reference for the Vocalis AI voice tutoring platform.

---

## 1. Architecture Overview

```
Next.js 16 (App Router) → Clerk (Auth) → Supabase (DB) → Vapi + GPT-4 + ElevenLabs (Voice AI)
```

**Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Clerk, Supabase, Vapi, Sentry

---

## 2. Configuration Files

### `package.json`
- **What it contains:** Project metadata, npm scripts (`dev`, `build`, `start`, `lint`), all dependencies and devDependencies.
- **Key dependencies:** `@clerk/nextjs` (auth), `@supabase/supabase-js` (database), `@vapi-ai/web` (voice AI), `@sentry/nextjs` (error tracking), `lottie-react` (animations), `zod` (validation), `react-hook-form` (forms), `sonner` (toasts).
- **Impact of changes:** Adding/removing dependencies here requires `npm install`. Changing scripts affects how the app is started or built.

### `next.config.ts`
- **What it contains:** Next.js configuration wrapped with Sentry. Sets `ignoreBuildErrors` for TypeScript, allows Clerk images via `remotePatterns`, configures Sentry source maps, tunnel route (`/monitoring`), and webpack tree-shaking.
- **Impact of changes:** Modifying `remotePatterns` affects which external images can load. Changing Sentry config affects error reporting. The `tunnelRoute` bypasses ad-blockers for Sentry.

### `tsconfig.json`
- **What it contains:** TypeScript compiler options — targets ES2017, uses bundler module resolution, enables `@/*` path alias mapping to the project root.
- **Impact of changes:** Changing `paths` breaks all `@/` imports. Changing `strict` mode may surface or hide type errors.

### `postcss.config.mjs`
- **What it contains:** PostCSS plugin config — only loads `@tailwindcss/postcss` for Tailwind v4.
- **Impact of changes:** Removing the Tailwind plugin breaks all CSS utility classes.

### `components.json`
- **What it contains:** shadcn/ui configuration — uses "new-york" style, RSC-compatible, CSS variables enabled, aliases for `@/components`, `@/lib/utils`, `@/components/ui`.
- **Impact of changes:** Changing aliases here breaks shadcn CLI component generation. Existing components are unaffected.

### `.env.local.example`
- **What it contains:** Template for all required environment variables:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — Clerk auth
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — Sign-in redirect path
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
  - `NEXT_PUBLIC_VAPI_WEB_TOKEN` — Vapi voice AI token
- **Impact of changes:** Missing any of these keys causes the corresponding service to fail at runtime.

### `.gitignore`
- **What it contains:** Standard Next.js ignores — `node_modules`, `.next`, `.env.local`, etc.
- **Impact of changes:** Adding files here prevents them from being committed.

---

## 3. Database Schema

### `supabase-schema.sql`
- **What it contains:** SQL to create 3 tables with RLS policies. Run this in the Supabase SQL Editor.

| Table | Columns | Purpose |
|-------|---------|---------|
| `companions` | `id` (UUID PK), `name`, `subject`, `topic`, `voice`, `style`, `duration`, `author`, `created_at` | Stores AI tutor definitions |
| `session_history` | `id` (UUID PK), `companion_id` (FK → companions), `user_id`, `created_at` | Tracks completed voice sessions |
| `bookmarks` | `id` (UUID PK), `companion_id` (FK → companions), `user_id`, `created_at`, UNIQUE(companion_id, user_id) | User-bookmarked companions |

- **Impact of changes:** Adding columns requires updating TypeScript types in `types/index.d.ts` and server actions in `companions.actions.ts`. Changing table names breaks all Supabase queries. RLS policies are set to `USING (true)` — tightening them adds security but requires Supabase JWT integration.

---

## 4. App Router Pages (`app/`)

### `app/layout.tsx` — Root Layout
- **What it contains:** Wraps the entire app in `ClerkProvider` (light theme, teal primary color), renders the `Navbar`, imports global CSS, loads Inter font.
- **Impact of changes:** Changing `ClerkProvider` appearance affects all Clerk UI (sign-in, user button). Removing `Navbar` removes navigation from every page. Changing the metadata affects the browser tab title and SEO. The `icons` metadata controls the favicon.

### `app/page.tsx` — Home Page (`/`)
- **What it contains:** Server component that:
  1. Calls `seedTemplateCompanions()` to ensure Lara/Boris/Suzan exist
  2. Fetches 6 companions via `getAllCompanions({ limit: 6 })`
  3. Fetches 10 recent sessions via `getRecentSessions(10)`
  4. Renders companion cards in a grid and a "Recent Sessions" table
- **Has `export const dynamic = "force-dynamic"` — disables static caching.**
- **Impact of changes:** Changing the `limit` affects how many companions show. Removing `seedTemplateCompanions()` stops auto-seeding template tutors. This is the landing page users see after sign-in.

### `app/globals.css` — Global Styles & Theme
- **What it contains:** The entire design system:
  - CSS custom properties (`:root`) — all color tokens for the light theme
  - `@theme inline` block — maps CSS vars to Tailwind utility classes
  - `body::before` — radial gradient background (teal glow from top)
  - `@layer base` — default styles for `body`, `main`, `h1`
  - `@layer components` — all custom component classes (`.navbar`, `.companion-card`, `.btn-primary`, `.session-container`, `.transcript`, etc.)
  - `@layer utilities` — scrollbar hiding utilities
- **Impact of changes:** This is the MOST SENSITIVE file for visual appearance:
  - Changing `:root` variables changes colors app-wide
  - Changing `body::before` gradients changes the background effect
  - Changing `.companion-card` affects every card on home and library pages
  - Changing `.btn-primary` affects every primary button
  - Changing `main` padding affects spacing on ALL pages

### `app/favicon.svg` & `app/icon.svg` — Browser Tab Icon
- **What it contains:** Simple SVG — teal rounded square with white "V" letter.
- **Impact of changes:** Replacing these changes the browser tab icon. Next.js App Router auto-serves `icon.svg` as the favicon. A copy also exists at `public/favicon.svg`.

### `app/global-error.tsx` — Error Boundary
- **What it contains:** Client component that catches unhandled errors, reports them to Sentry, and renders Next.js default error page.
- **Impact of changes:** Removing this loses error reporting to Sentry for uncaught exceptions.

### `app/companions/page.tsx` — Companion Library (`/companions`)
- **What it contains:** Server component that reads `subject` and `topic` from URL search params, fetches matching companions via `getAllCompanions()`, renders `SearchInput` + `SubjectFilter` + companion card grid.
- **Impact of changes:** This page is the browsing/search interface. Changing filter logic affects which companions appear.

### `app/companions/new/page.tsx` — Create Companion (`/companions/new`)
- **What it contains:** Server component that checks auth (redirects to `/sign-in` if not logged in), checks `newCompanionPermissions()` for subscription limits, renders either the `CompanionForm` or an upgrade prompt.
- **Impact of changes:** Changing permissions logic affects who can create companions. The `mx-auto` class centers the form.

### `app/companions/[id]/page.tsx` — Voice Session (`/companions/:id`)
- **What it contains:** Server component that fetches companion data by ID, gets current user from Clerk, renders an info bar (back link, name, subject badge, topic, duration) and the `CompanionComponent` for the voice session.
- **Impact of changes:** This is where voice tutoring happens. Changing the layout affects the session UI. Removing auth check allows unauthenticated access.

### `app/my-journey/page.tsx` — Profile (`/my-journey`)
- **What it contains:** Server component showing user profile (avatar, name, email), stats (session count, companion count), and two accordion sections: "Recent Sessions" and "My Companions" using `CompanionsList`.
- **Impact of changes:** Changing the accordion structure affects the profile layout. Data comes from `getUserSessions()` and `getUserCompanions()`.

### `app/subscription/page.tsx` — Pricing (`/subscription`)
- **What it contains:** Renders Clerk's `<PricingTable />` component for subscription management.
- **Impact of changes:** Pricing tiers are configured in the Clerk Dashboard, not in code. This page just renders Clerk's built-in pricing UI.

### `app/sign-in/[[...sign-in]]/page.tsx` — Sign In (`/sign-in`)
- **What it contains:** Renders Clerk's `<SignIn />` component, centered on the page.
- **Impact of changes:** The catch-all route `[[...sign-in]]` handles Clerk's multi-step sign-in flow. Styling comes from ClerkProvider's appearance config in `layout.tsx`.

---

## 5. Components (`components/`)

### `Navbar.tsx` — Navigation Bar
- **What it contains:** Logo (from `/images/logo.svg`), "Vocalis AI" text, `NavItems`, and Clerk's `SignInButton`/`UserButton` based on auth state.
- **Impact of changes:** Changing the logo path or text updates branding. Removing `SignedIn`/`SignedOut` breaks auth-aware navigation.

### `NavItems.tsx` — Navigation Links
- **What it contains:** Client component with 3 links: Home (`/`), Companions (`/companions`), My Journey (`/my-journey`). Highlights current route.
- **Impact of changes:** Adding/removing items here changes the navigation menu. Uses `usePathname()` for active state.

### `CompanionCard.tsx` — Companion Card
- **What it contains:** Horizontal card with colored accent bar, name, subject badge, topic, duration, and arrow link. Links to `/companions/:id`.
- **Impact of changes:** Changing the card layout affects how companions appear on home and library pages. The `color` prop drives the accent bar and badge colors.

### `CompanionsList.tsx` — Session History Table
- **What it contains:** Table component showing companion name, topic, subject badge, and duration. Used on the home page and profile page.
- **Impact of changes:** Changing column structure affects session display everywhere it's used.

### `CompanionComponent.tsx` — Voice Session (Core)
- **What it contains:** The most complex client component. Manages:
  - **Call state machine:** INACTIVE → CONNECTING → ACTIVE → FINISHED
  - **Vapi integration:** Starts/stops voice calls via `vapi.start()` / `vapi.stop()`
  - **Transcript:** Listens to `message` events, merges consecutive messages from the same speaker into one paragraph
  - **Lottie animation:** Sound wave animation during speech
  - **Mute toggle:** `vapi.setMuted()` / `vapi.isMuted()`
  - **Session tracking:** Calls `addToSessionHistory()` when call ends
- **Impact of changes:** This is the HEART of the app. Changes here affect:
  - Voice quality (via `configureAssistant` in `utils.ts`)
  - Transcript display logic
  - Session recording
  - UI during active calls

### `CompanionForm.tsx` — Companion Builder Form
- **What it contains:** React Hook Form + Zod validated form with fields: name, subject (dropdown), topic (textarea), voice (male/female), style (formal/casual), duration (number). On submit, calls `createCompanion()` server action.
- **Duplicate name prevention:** Catches errors and shows toast via `sonner`.
- **Impact of changes:** Adding/removing form fields requires updating the Zod schema, the `CreateCompanion` type, and the database schema.

### `SearchInput.tsx` — Search Bar
- **What it contains:** Client component with debounced search (500ms). Updates URL query param `topic` using `@jsmastery/utils`.
- **Impact of changes:** Changing the debounce delay affects search responsiveness. The param name `topic` must match what `getAllCompanions()` expects.

### `SubjectFilter.tsx` — Subject Dropdown
- **What it contains:** Client component using Radix Select. Filters companions by subject via URL query param. "All subjects" clears the filter.
- **Impact of changes:** The subject list comes from `constants/index.ts`. Adding subjects there auto-populates this dropdown.

### `CTA.tsx` — Call to Action
- **What it contains:** Promotional section with heading, description, and "Build a new companion" button linking to `/companions/new`.
- **Impact of changes:** Currently not rendered on any page (was part of an earlier design). Safe to delete or integrate.

### `components/ui/` — shadcn/ui Primitives
13 component files: `accordion`, `button`, `card`, `field`, `form`, `input-group`, `input`, `label`, `select`, `separator`, `sonner`, `table`, `textarea`.
- **Impact of changes:** These are low-level UI primitives used by all other components. Modifying them affects every component that uses them. Generally, avoid editing these directly — use CSS overrides instead.

---

## 6. Library Files (`lib/`)

### `lib/utils.ts` — Utility Functions
- **What it contains:**
  - `cn()` — Tailwind class merger (clsx + tailwind-merge)
  - `getSubjectColor()` — Returns hex color for a subject name
  - `configureAssistant()` — Builds the Vapi assistant configuration:
    - Maps voice gender + style to ElevenLabs voice IDs
    - Configures Deepgram Nova-3 transcriber
    - Sets GPT-4 system prompt with teaching guidelines
    - Returns `CreateAssistantDTO` for Vapi
- **Impact of changes:**
  - Changing `configureAssistant()` affects AI behavior, voice quality, and teaching style
  - Changing the GPT-4 system prompt changes how the tutor speaks
  - Changing voice provider settings affects audio quality

### `lib/supabase.ts` — Database Client
- **What it contains:** Creates a Supabase client using env vars. Auth is handled by Clerk, NOT Supabase Auth.
- **Impact of changes:** Changing this affects ALL database operations. No JWT/RLS integration — relies on open policies.

### `lib/vapi.sdk.ts` — Voice AI Client
- **What it contains:** Initializes the Vapi Web SDK with the `NEXT_PUBLIC_VAPI_WEB_TOKEN`.
- **Impact of changes:** Changing the token or initialization affects all voice calls. This is a client-side module.

### `lib/actions/companions.actions.ts` — Server Actions
- **What it contains:** All database operations as Next.js Server Actions (`'use server'`):

| Function | Purpose | Impact of Changes |
|----------|---------|-------------------|
| `seedTemplateCompanions()` | Inserts Lara/Boris/Suzan if no system companions exist | Changing templates affects default companions |
| `createCompanion()` | Creates a new companion, checks for duplicate names | Removing dupe check allows same-name companions |
| `getAllCompanions()` | Fetches companions with optional subject/topic filters, deduplicates by name | Changing dedup logic affects library display |
| `getCompanion()` | Fetches single companion by ID | Used by voice session page |
| `addToSessionHistory()` | Records a completed session | Removing this stops session tracking |
| `getRecentSessions()` | Fetches recent sessions (all users) | Used on home page |
| `getUserSessions()` | Fetches sessions for a specific user | Used on profile page |
| `getUserCompanions()` | Fetches companions created by a user | Used on profile page |
| `newCompanionPermissions()` | Checks Clerk subscription tier limits (0/3/10/unlimited) | Changing limits affects who can create companions |
| `addBookmark()` / `removeBookmark()` | Adds/removes companion bookmarks | Affects bookmark functionality |
| `getBookmarkedCompanions()` | Fetches user's bookmarked companions | Used for bookmark display |

---

## 7. Constants (`constants/`)

### `constants/index.ts`
- **What it contains:**
  - `subjects` — Array of 6 subjects: maths, language, science, history, coding, economics
  - `subjectsColors` — Color hex codes for each subject (used for badges and accent bars)
  - `voices` — ElevenLabs voice ID mapping: `{ male: { casual, formal }, female: { casual, formal } }`
  - `templateCompanions` — 3 default companions (Lara/Science, Boris/History, Suzan/Maths)
- **Impact of changes:**
  - Adding to `subjects` adds a new option in the subject filter and form dropdown
  - Changing `voices` IDs changes the actual voice used in sessions (must be valid ElevenLabs IDs)
  - Changing `templateCompanions` affects what's seeded on first load

### `constants/soundwaves.json`
- **What it contains:** Lottie animation data for the sound wave visualization during active voice sessions.
- **Impact of changes:** Replacing this changes the animation shown when the AI is speaking.

---

## 8. Type Definitions (`types/`)

### `types/index.d.ts`
- **What it contains:** Global TypeScript interfaces:
  - `Companion` — Shape of a companion record (id, name, subject, topic, duration, voice, style, author, bookmarked)
  - `CreateCompanion` — Fields needed to create a companion
  - `GetAllCompanions` — Query parameters (limit, page, subject, topic)
  - `SavedMessage` — Transcript message (role + content)
  - `CompanionComponentProps` — Props for the voice session component
  - `SearchParams`, `Avatar`, `BuildClient`, `CreateUser` — Various utility types
- **Impact of changes:** Changing these types affects all components and functions that reference them. TypeScript will flag mismatches.

### `types/vapi.d.ts`
- **What it contains:** Type definitions for Vapi message events — `TranscriptMessage`, `FunctionCallMessage`, `FunctionCallResultMessage` with their enums.
- **Impact of changes:** These types must match Vapi SDK's actual message format. Incorrect types cause runtime issues in the transcript handler.

---

## 9. Auth & Middleware

### `proxy.ts` — Clerk Middleware
- **What it contains:** Clerk middleware that runs on every request (except static files). Handles authentication state for all routes.
- **Impact of changes:** Changing the `matcher` pattern affects which routes are protected. Removing this file disables Clerk auth middleware entirely.

---

## 10. Error Tracking (Sentry)

### `instrumentation.ts` — Server Instrumentation
- **What it contains:** Loads Sentry server/edge config based on runtime environment.
- **Impact of changes:** Removing this disables server-side error tracking.

### `instrumentation-client.ts` — Client Instrumentation
- **What it contains:** Initializes Sentry on the client with replay integration, 100% trace sampling, 10% session replay, captures router transitions.
- **Impact of changes:** Changing `tracesSampleRate` affects performance monitoring coverage. The DSN points to your Sentry project.

### `sentry.server.config.ts` / `sentry.edge.config.ts`
- **What it contains:** Sentry init for server and edge runtimes. Both use the same DSN, 100% trace sampling, PII enabled.
- **Impact of changes:** Changing the DSN disconnects error reporting. Lowering sample rates reduces monitoring coverage.

---

## 11. Static Assets (`public/`)

| Path | Purpose |
|------|---------|
| `public/images/logo.svg` | Main logo in the navbar (Vocalis AI brand mark) |
| `public/images/cta.svg` | CTA section illustration |
| `public/images/limit.svg` | Companion limit reached illustration |
| `public/favicon.svg` | Browser tab icon (copy of `app/icon.svg`) |
| `public/icons/*.svg` | 17 icon SVGs — subject icons (maths, science, coding, etc.), UI icons (mic-on/off, search, plus, clock, etc.) |
| `public/readme/*.png` | README screenshots (homepage, companion-builder, session) |

- **Impact of changes:** Replacing `logo.svg` changes the navbar branding. Subject icons (`science.svg`, `maths.svg`, etc.) are displayed in the voice session avatar — their filenames must match the subject names in `constants/index.ts`.

---

## 12. Data Flow Diagram

```
User opens app
    │
    ├─→ layout.tsx loads ClerkProvider + Navbar
    │
    ├─→ page.tsx (Home)
    │       ├─→ seedTemplateCompanions() → Supabase INSERT (if first load)
    │       ├─→ getAllCompanions() → Supabase SELECT → CompanionCard grid
    │       └─→ getRecentSessions() → Supabase SELECT → CompanionsList table
    │
    ├─→ /companions (Library)
    │       ├─→ SearchInput → URL param ?topic=X
    │       ├─→ SubjectFilter → URL param ?subject=X
    │       └─→ getAllCompanions({ subject, topic }) → filtered cards
    │
    ├─→ /companions/new (Create)
    │       ├─→ newCompanionPermissions() → Clerk subscription check
    │       └─→ CompanionForm → createCompanion() → Supabase INSERT → redirect to /companions/:id
    │
    ├─→ /companions/:id (Voice Session)
    │       ├─→ getCompanion(id) → Supabase SELECT
    │       ├─→ CompanionComponent mounts
    │       │       ├─→ User clicks "Start Session"
    │       │       ├─→ configureAssistant() builds Vapi config
    │       │       ├─→ vapi.start() → connects to Vapi → GPT-4 + ElevenLabs
    │       │       ├─→ vapi.on("message") → updates transcript
    │       │       ├─→ vapi.on("speech-start/end") → toggles Lottie animation
    │       │       └─→ User clicks "End" → vapi.stop() → addToSessionHistory()
    │       └─→ Transcript renders merged messages
    │
    └─→ /my-journey (Profile)
            ├─→ getUserSessions(userId) → session history
            └─→ getUserCompanions(userId) → created companions
```

---

## 13. Key Relationships & Dependencies

| If you change... | You must also update... |
|------------------|------------------------|
| Database columns in `supabase-schema.sql` | `types/index.d.ts`, `companions.actions.ts`, any component displaying that data |
| Subject list in `constants/index.ts` | Add matching SVG icon in `public/icons/`, add color in `subjectsColors` |
| ElevenLabs voice IDs in `constants/index.ts` | Nothing else (but verify IDs are valid in ElevenLabs dashboard) |
| Template companions in `constants/index.ts` | Delete existing system companions from DB for re-seeding |
| Color tokens in `globals.css` `:root` | Nothing (all components reference CSS variables) |
| Component class names in `globals.css` | Any component using those class names |
| Clerk subscription features | Update `newCompanionPermissions()` in `companions.actions.ts` |
| Vapi token | Update `.env.local` `NEXT_PUBLIC_VAPI_WEB_TOKEN` |
| GPT-4 system prompt | Edit `configureAssistant()` in `lib/utils.ts` |

---

*Generated on April 30, 2026. Covers the complete Vocalis AI codebase.*
