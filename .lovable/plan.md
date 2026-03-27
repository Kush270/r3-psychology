

## Plan: Add Psychosocial Audit Page to Navigation

### Overview
Create a new "Psychosocial Audit 2026" page from the provided code and add it to the sidebar navigation for both guest and member users.

### Changes

**1. Create `src/pages/Audit.tsx`**
- Adapt the provided React code to fit the project's conventions (TypeScript, proper types, project styling tokens where appropriate)
- The page is self-contained with 4 steps: welcome → survey (15 Yes/Partially/No questions) → results → contact form
- Keep the provided UI logic and styling intact

**2. Update `src/App.tsx`**
- Import the new `Audit` component
- Add route `/audit` inside the `SidebarLayout` wrapper

**3. Update `src/components/AppSidebar.tsx`**
- Import `ShieldCheck` icon from lucide-react
- Add `{ title: "Psychosocial Audit", url: "/audit", icon: ShieldCheck }` to both `guestItems` and `memberItems` arrays

### Files changed
- `src/pages/Audit.tsx` (new)
- `src/App.tsx` (add route)
- `src/components/AppSidebar.tsx` (add nav item)

