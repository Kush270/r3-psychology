

## Plan: Replace Audit Page with Psychosocial Safety Maturity Diagnostic

### Overview
Rewrite `src/pages/Audit.tsx` with the full diagnostic from the provided HTML. The route (`/audit`) and sidebar entry ("Psychosocial Audit") already exist — no routing or navigation changes needed.

### What changes

**Rewrite `src/pages/Audit.tsx`** to implement:

**Welcome screen** — Title "Psychosocial Safety Maturity Diagnostic", intro text about defensible maturity, and a "Start Diagnostic" CTA button.

**Survey step** — Two parts with a progress bar:
- **Part 1 (Q1–Q10):** 10 scored radio-button questions (A = 10pts, B = 5pts, C = 0pts). Topics: regulatory compliance, risk documentation, workflow integration, early hazard ID, burnout prevention, cost tracking, insurance strategy, talent retention, stakeholder assurance, proactive sustainability. Each option has full descriptive text from the provided content.
- **Part 2 (Q11–Q14):** 4 profiling radio questions (production environment, 90-day objective, biggest obstacle, implementation approach). These are not scored.
- **Q15:** A textarea ("Is there anything else we should know…"). Not scored.

**Results step** — Replaces the current simple percentage display:
- **Score gauge:** Display score out of 100 with color-coded verdict:
  - 80–100 → green "Safe Architecture"
  - 50–79 → amber "Process Friction"  
  - 0–49 → red "Statutory Liability"
- **Three Insights:** Dynamic text for Legal (based on Q1), Operational (based on Q4), Financial (based on Q7).
- **Recommended Next Step:** Tailored CTA based on Q11 (environment) and Q14 (budget preference) — High-value leads get "One-to-One Meeting", mid-tier get "Group Webinar", lower-tier get "Free toolkit".
- **Contact links:** Email and LinkedIn links.
- **Retake button** to reset and restart.

### Files changed
- `src/pages/Audit.tsx` — full rewrite

### Technical notes
- No new dependencies; uses existing `Button`, `Input`, `RadioGroup` (or custom radio buttons), and `Textarea` components
- Keeps the same TypeScript patterns and Tailwind tokens used elsewhere
- No database integration (this audit is stateless / client-side only, matching the current implementation)

