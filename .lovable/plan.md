

## Plan: Replace Audit Page with Updated Diagnostic

### Overview
Rewrite `src/pages/Audit.tsx` to match the uploaded HTML diagnostic. Key differences from current implementation:

### What changes

**Questions (Q1–Q10 scored, Q11–Q15 contextual)**
- Q1–Q10: Replace all 15 scored questions with the HTML's 10 scored questions (0/5/10 points, max 100). Topics: Regulatory Compliance, Risk Documentation, Workflow Integration, Early Hazard ID, Burnout Prevention, Cost Tracking, Insurance Strategy, Talent Retention, Stakeholder Assurance, Proactive Sustainability.
- Q11–Q14: 4 contextual radio questions (Production Environment, Critical Objective, Biggest Obstacle, Implementation Approach) — not scored.
- Q15: Free-text textarea ("Is there anything else we should know?").
- Add "Part 1: The Defensible Maturity Index" and "Part 2: Production Context" section headers.

**Scoring (3 tiers instead of 4, out of 100)**
- Safe Architecture (80+, green): Strong foundations, defensible safety architecture.
- Process Friction (50–79, amber): Good intentions but vulnerable, system redesign needed.
- Statutory Liability (0–49, red): Significant regulatory exposure, immediate intervention required.

**Results page**
- Score display: `{score}/100` with color-coded background (emerald/amber/rose).
- "The Three Insights" section: Dynamic text for Legal (based on Q1), Operational (based on Q4), Financial (based on Q7).
- "Recommended Next Step" based on Q14 (budget preference) and Q11 (environment): High-value → One-to-One Meeting, Mid-tier → Group Webinar, Lower-tier → Free toolkit/video guide.
- Contact links: Email (mailto) and LinkedIn.
- Retake button.

**Supabase persistence** — unchanged pattern, still saves name/email/score/level/responses.

**State changes**
- Add `contextAnswers: Record<number, string>` for Q11–Q14 (string values, not numeric).
- Add `freeText: string` for Q15.
- Include all answers in the `responses` JSON saved to Supabase.

### Files changed
- `src/pages/Audit.tsx` — full rewrite

