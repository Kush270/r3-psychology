

## Plan: Replace Landing Page with Diagnostic Tool & Remove Compliance Assessment

### Overview
Replace the root `/` page with the uploaded HTML diagnostic landing page. The "Start Diagnostic" button navigates to `/audit`. Store name, email, and results in Supabase. Remove the Compliance Assessment page entirely.

### Changes

**1. Create `audit_submissions` table (migration)**
```sql
CREATE TABLE public.audit_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  score integer NOT NULL,
  maturity_level text NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Allow anonymous inserts (no auth required for this public diagnostic)
CREATE POLICY "Allow anonymous inserts on audit_submissions"
  ON public.audit_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

**2. Rewrite `src/pages/Home.tsx`** — New landing page matching the uploaded HTML:
- Hook heading: "Are you ready to protect your production's bottom line..."
- Value proposition cards (Legal Compliance, Operational Efficiency, Financial ROI)
- Credibility section (Kush Mohun bio)
- Lead capture form (name + email) → stores in React state, navigates to `/audit` with name/email passed via route state

**3. Rewrite `src/pages/Audit.tsx`** — Update to match uploaded HTML's 15 questions:
- Replace current 10+4+1 question set with the HTML's 15 scored questions (Q1 hardcoded + Q2-Q15 from JS array), all worth 0/5/10 points, max 150
- Four maturity tiers: Defensible Maturity (120+), Proactive Management (80-119), Reactive Compliance (40-79), Initial/At Risk (0-39)
- Results show: score, maturity level, summary, and 3 tailored recommendations
- CTA: "Book Your Strategy Session" email link
- Read name/email from route state; on submit, insert name + email + score + level + responses into `audit_submissions` via Supabase
- Retake button resets state

**4. Update `src/App.tsx`**
- Remove imports and routes for `Assessment` and `AssessmentResults`
- Keep `/audit` route

**5. Update `src/components/AppSidebar.tsx`**
- Remove "Compliance Assessment" from `memberItems`
- Keep "Psychosocial Audit" in both arrays

**6. Clean up**
- Delete `src/pages/Assessment.tsx` and `src/pages/AssessmentResults.tsx` (or leave unused — they'll be unreachable)
- Remove `src/data/assessmentQuestions.ts` and `src/components/assessment/` if no longer referenced

### Files changed
- **Migration SQL**: Create `audit_submissions` table
- `src/pages/Home.tsx` — rewrite as diagnostic landing page
- `src/pages/Audit.tsx` — rewrite with new 15 questions + Supabase persistence
- `src/App.tsx` — remove assessment routes
- `src/components/AppSidebar.tsx` — remove assessment nav item

