

## Plan: Premium Landing Page for Defensible Maturity Diagnostic

### Overview
Replace the current `Home.tsx` content at `/` with a full-width, high-conversion landing page. The page will remain inside the `SidebarLayout` but use negative margins / full-bleed styling to feel like a standalone page.

**Alternative (recommended):** Move `/` outside the `SidebarLayout` so the landing page renders full-screen without the sidebar, similar to how `Index.tsx` was structured. The sidebar pages (blog, pilot, members, assessment) remain nested.

### Architecture

**1. Update `App.tsx` routing**
- Move `/` outside the `SidebarLayout` wrapper to render full-screen
- Point `/` to a new `LandingPage` component (or rewrite `Home.tsx`)

**2. Create `src/pages/LandingPage.tsx`**
- Full-screen page with Navbar + Footer (reuse existing landing components)
- Five sections, each as inline blocks or extracted components:

**3. Sections**

| Section | Content |
|---------|---------|
| **Hero** | Navy gradient background. H1: the regulatory challenge question. Subheading about the scorecard. Rounded gold CTA button linking to `/assessment`. Subtle motion fade-in. |
| **Three Pillars** | 3-column grid on md+. Cards with icons: Governance Shield, Safety Architecture, Psychosocial Safety Climate. Each with title + 2-line description. |
| **Credibility Stats** | 3 data cards: "$17M+ penalties", "$58,615 median claim cost", "$2.30 ROI per $1". Large stat number + supporting text. |
| **Expert Bio** | Clean card with name, title ("Entrepreneurial Organizational Psychologist"), and a short bio paragraph. |
| **Final CTA Footer** | Repeated "Start Scorecard" button. Three trust markers as subtle badges below. |

**4. Styling approach**
- Deep navy (`hsl(220 60% 14%)`) hero gradient — already exists as `--hero-gradient`
- Gold accent for CTA buttons — already exists as `bg-gold-gradient`
- Playfair Display headings, Inter body — already configured
- Generous vertical padding (py-20 lg:py-28) for cinematic spacing
- Framer Motion `fadeUp` animations on each section

**5. Files changed**
- `src/App.tsx` — move `/` route outside `SidebarLayout`
- `src/pages/Home.tsx` — rewrite as the landing page (or create new `LandingPage.tsx`)
- Reuse `Navbar.tsx` and `Footer.tsx` from existing landing components

### Technical notes
- No new dependencies needed
- Assessment link points to `/assessment` (already routed)
- The existing sidebar pages remain unchanged
- Mobile responsive: single column on small screens, 3-col grid on md+

