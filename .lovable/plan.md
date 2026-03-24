

## Plan: Dynamic Sidebar Navigation Based on Auth State

### What changes
The sidebar will show different navigation items depending on whether the user is authenticated.

**Logged out (default):** Home, Blog, Members Only, Join the Pilot Program (current setup)

**Logged in:** Home, The Neuroscience of Stress

### Implementation

**1. Create the "Neuroscience of Stress" page (`src/pages/NeuroscienceOfStress.tsx`)**
- Extract the authenticated content currently inside `MembersOnly.tsx` (the article sections) into its own standalone page component.
- Include the logout button at the bottom.

**2. Add route in `App.tsx`**
- Register `/members/neuroscience-of-stress` within the `SidebarLayout` routes.

**3. Update `AppSidebar.tsx`**
- Import `useAuth` hook.
- Define two nav item arrays: `guestItems` (current 4 links) and `memberItems` (Home + Neuroscience of Stress).
- Conditionally render based on `user` from `useAuth()`.

**4. Update `MembersOnly.tsx`**
- After successful login, the sidebar automatically updates (via auth context).
- The authenticated content view can either redirect to the Neuroscience page or remain as a hub linking to member pages.

### Technical details
- No new dependencies required.
- Auth state is already available via the `useAuth` context which wraps the entire app.
- The sidebar re-renders reactively when `user` changes.

