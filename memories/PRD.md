## Cosmic Compatibility – Product Requirements Document (Live)

This is a live PRD capturing what’s implemented, how information flows through the system, and what’s next. Keep this document updated as we ship new features.

### 1) Product Overview
- **What**: A platform that helps hiring managers evaluate candidate-manager compatibility using BaZi-based analysis and optional tarot guidance.
- **Who**: Managers and candidates.
- **Why**: Improve hiring decisions with structured compatibility insights and actionable recommendations.

### 2) Goals and Non‑Goals
- **Goals**:
  - Enable managers to store their birth profile, add candidates, and receive AI-generated compatibility analysis.
  - Provide an at-a-glance score and a deeper narrative with recommendations.
  - Offer an optional tarot reading contextualized by the compatibility report.
- **Non‑Goals (current phase)**:
  - No multi-tenant orgs or team collaboration beyond a single manager account.
  - No candidate self-onboarding flow.
  - No analytics dashboards or exports yet.

### 3) Roles and Permissions
- **Manager**: Core user. Creates profile (birth data), adds candidates, generates compatibility reports, and tarot readings.
- **Candidate**: Secondary persona for future expansion (limited functionality now).
- **Access control**: Enforced via Supabase Row-Level Security (RLS) policies so users only access their own records.

### 4) Core User Flows (E2E)
- **Sign up and auth**
  1. User signs up with email/password.
  2. Email confirmation redirects to `/auth/callback` → session exchange → `/auth/select-role`.
  3. User selects role → creates row in `profiles` → redirect `/birth-data`.

- **Profile completion (Manager)**
  1. Enter manager birth data (name, DOB, time, city, timezone; optional company info).
  2. Save creates/updates row in `birth_data` (role inferred from `profiles`).
  3. Redirect to dashboard.

- **Add candidate and generate compatibility**
  1. Manager adds candidate (name, DOB, time, city, timezone).
  2. System fetches manager’s `birth_data` and candidate data.
  3. Calls OpenAI to compute structured analysis JSON + score.
  4. Saves to `compatibility_matches` (score + analysis JSON).
  5. Dashboard/candidate list shows latest score and “View Report”.

- **View compatibility report**
  1. Navigate to `/compatibility/[candidateId]`.
  2. Server verifies candidate belongs to manager and fetches corresponding `compatibility_matches`.
  3. Client page displays score, summary, categories, Yin/Yang, Five Elements, and recommendations.

- **Optional tarot reading**
  1. From the report, manager goes to `/tarot/[matchId]`.
  2. Select a Major Arcana card.
  3. System calls OpenAI to generate a contextual interpretation referencing the match’s analysis and persists to `tarot_readings`.
  4. Redirect to `/tarot/[matchId]/reading/[readingId]` to view the reading.

### 5) Implemented Features (Snapshot)
- Authentication: Sign-up, email confirmation, sign-in, sign-out, basic error page.
- Role selection: Manager or Candidate; persists to `profiles`.
- Manager profile (birth data) collection with Google Places + Time Zone assistance.
- Candidate creation (manager-only) with automatic compatibility calculation.
- Compatibility report viewing (score, narrative, categories, Yin/Yang, Five Elements, recommendations).
- Tarot: card selection → AI interpretation → saved reading → viewing page.
- Dashboard: profile completeness CTA, candidate list, generate or view report.

### 6) Routes and Pages (Next.js App Router)
- Auth:
  - `/auth/sign-up` – create account.
  - `/auth/callback` – exchange code, redirect to role selection.
  - `/auth/login` – sign in.
  - `/auth/sign-up-success` – confirm email sent.
  - `/auth/select-role` – role selection (inserts into `profiles`).
  - `/auth/error` – error surface.
  - `/auth/sign-out` – POST route to end session.
- Onboarding and data:
  - `/birth-data` – complete or edit manager birth data; step 2 prompts first candidate (for managers).
- Dashboard and management:
  - `/dashboard` – role-aware dashboard with candidate list and actions.
  - `/candidates/add` – add candidate (manager only).
- Reports and tarot:
  - `/compatibility/[id]` – compatibility report for candidate `[id]`.
  - `/tarot/[matchId]` – card selection for a specific compatibility match.
  - `/tarot/[matchId]/reading/[readingId]` – tarot interpretation view.

### 7) Data Model (Supabase Postgres)
- `profiles`
  - `id uuid` PK references `auth.users(id)`; `role text` in {manager, candidate}; timestamps.
  - RLS: users can select/insert/update/delete only their own profile.
- `birth_data`
  - `id uuid` PK; `user_id` → `profiles(id)`; `role` mirrors profile; `name`, `dob`, `birth_time`, `birth_city`, `timezone`.
  - Optional company fields: `company_name`, `company_founding_date`, `company_city`, `company_timezone`.
  - RLS: user can access only rows where `auth.uid() = user_id`.
- `candidates`
  - `id uuid` PK; `manager_id` → `profiles(id)`; `name`, `dob`, `birth_time`, `birth_city`, `timezone`.
  - RLS: manager can access only rows where `auth.uid() = manager_id`.
- `compatibility_matches`
  - `id uuid` PK; `manager_id` → `profiles(id)`; `candidate_id` → `candidates(id)`.
  - `score int` (0–100), `analysis jsonb` (structured payload described below).
  - RLS: access limited to `manager_id = auth.uid()`.
- `tarot_readings`
  - `id uuid` PK; `match_id` → `compatibility_matches(id)`.
  - `card_name text`, `meaning text`, `interpretation text`.
  - RLS: select/insert allowed only when `match_id` belongs to the requesting manager.

#### Compatibility analysis JSON structure
Returned by OpenAI and saved to `compatibility_matches.analysis`:
```
{
  "score": number,
  "overall_compatibility": string,
  "categories": {
    "communication": number,
    "decision_style": number,
    "teamwork": number,
    "leadership_harmony": number
  },
  "strengths": string[],
  "challenges": string[],
  "summary": string,
  "recommendations": {
    "communication_style": { "do": string[], "dont": string[] },
    "effective_work_approach": string[],
    "motivators": string[],
    "demotivators": string[],
    "interview_focus": { "areas": string[], "suggested_questions": string[] }
  },
  "yin_yang_balance": {
    "manager": string,
    "candidate": string,
    "compatibility_note": string
  },
  "five_elements": {
    "manager_primary": string,
    "candidate_primary": string,
    "interaction": string
  }
}
```

### 8) System Architecture and Services
- **Frontend**: Next.js (App Router), client/server components, server actions.
- **Auth + DB**: Supabase (Postgres + Auth + RLS). SSR/browser clients via `@supabase/ssr`.
- **AI**: OpenAI Chat Completions (`gpt-4o-mini`) for compatibility analysis and tarot interpretations.
- **Maps/Timezone**: Google Places Autocomplete + Google Time Zone API to assist city selection and timezone detection.

### 9) Information Flow (High-Level)
- Sign-up → Supabase Auth session → role selection → `profiles` row.
- Profile → `birth_data` row (1:1 per manager).
- Candidate added → `candidates` row linked to manager.
- Compatibility generation:
  - Load manager `birth_data` + candidate.
  - OpenAI call → structured JSON.
  - Persist to `compatibility_matches` with score + analysis.
- Tarot reading:
  - Manager selects card → OpenAI call referencing `compatibility_matches.analysis` → save `tarot_readings`.
  - View reading under `/tarot/[matchId]/reading/[readingId]`.

### 10) Security and Privacy
- **RLS**: Strict per-table policies prevent cross-user access.
- **PII**: Birth data and analysis are sensitive. Ensure least-privilege access and secure storage.
- **Secrets**: API keys for OpenAI and Google must be stored in environment variables, never client code (except permissible public Google key).
- **Middleware**: A stricter auth middleware exists (`lib/supabase/middleware.ts`); `middleware.ts` currently allows all traffic while building. Reinstate stricter checks before production.

### 11) Reliability and UX Considerations
- **OpenAI response shape**: We request JSON with a specific schema; implement validation/fallbacks to handle LLM drift.
- **Rate limiting/retries**: Add retry/backoff and graceful error messages for AI and Google API calls.
- **Idempotency**: We already avoid duplicate compatibility reports for the same manager/candidate pairing.
- **Loading states**: Present while generating reports/readings; already implemented in UI.

### 12) Environment Configuration (to reconcile)
- Supabase:
  - Expected server middleware uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
  - Current SSR/client utilities reference `SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY` (likely typos). Action: unify names to `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` for browser, and `SUPABASE_URL`/`SUPABASE_ANON_KEY` server-side.
- OpenAI: `OPENAI_API_KEY`.
- Google Maps: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

### 13) Error Handling
- Auth errors surfaced on `/auth/error` and in form UIs.
- AI/DB errors: surfaced via inline error messages; logged to console on server.
- NotFound/redirects: enforced on report/tarot routes if ownership checks fail.

### 14) Analytics and Metrics (future)
- Track generated reports, average scores, conversion from candidate add → report view → tarot.
- Success criteria: time-to-first-report, NPS-like “decision confidence” metric, number of candidates analyzed.

### 15) Roadmap (Next)
- Reinstate strict middleware auth/role gating in `middleware.ts`.
- Candidate management: edit/delete; notes; stages.
- Sharing/report export: PDF share link with controlled access.
- Improved analysis: validation of LLM JSON, richer charts, historical comparisons.
- Notifications: email on completed analysis, reminders.
- Team accounts and collaboration.

### 16) Open Questions
- Do we support candidate self-onboarding and sharing a one-time link to input birth data?
- Should we cache OpenAI responses or allow regeneration with versioning?
- What retention policy for tarot readings and analysis data?

---
Owner: Keep this doc updated as features evolve. Add new routes, data fields, and flow changes inline.

### Changelog
- 2025-10-18: Initial PRD created; documented flows, schema, routes, architecture, env reconciliation, roadmap, and open questions.
