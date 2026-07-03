# Protopage-Style Personal Dashboard Website — Codex Build Spec

## 1. Product Summary

Build a web app similar in concept to Protopage: a customizable browser-based personal start page where users can organise links, RSS feeds, notes, to-do lists, embedded widgets, and search tools into draggable dashboard tabs.

The app should feel like a personal command centre: fast to load, easy to rearrange, and useful as a browser homepage or new-tab replacement.

The user-provided reference URL redirects to Protopage login, so this spec is based on the public Protopage product model: a private/public start page with widgets, tabs, bookmarks, RSS/news widgets, sticky notes, to-do lists, weather-style widgets, custom search, and configurable layouts.

---

## 2. Working Name

**LaunchDesk**

Codex can rename this later. Use this as the placeholder product name in code, UI, package metadata, and comments.

---

## 3. Core User Story

As a user, I want a single personal homepage where I can:

- Search the web quickly.
- Open my most-used links.
- Read RSS/news feeds.
- Keep notes and reminders.
- Track simple tasks.
- Organise widgets into tabs.
- Rearrange the layout visually.
- Save everything automatically.
- Optionally share selected dashboards publicly.

---

## 4. MVP Scope

### Must Have

1. User authentication.
2. Personal dashboard per user.
3. Tabs/categories for organising content.
4. Draggable/resizable widgets.
5. Add/edit/delete widgets.
6. Widget types:
   - Bookmark list
   - RSS feed reader
   - Sticky note
   - To-do list
   - Embedded webpage / iframe widget
   - Clock/date widget
   - Quick search widget
7. Persistent layout storage.
8. Responsive desktop-first layout with mobile fallback.
9. Public/private dashboard visibility setting.
10. Basic import/export as JSON.

### Should Have

1. Theme customisation.
2. Wallpaper/background image.
3. Widget colour settings.
4. Search engine customisation.
5. Column layout mode.
6. Freeform layout mode.
7. Duplicate widget.
8. Drag widgets between tabs.
9. Keyboard shortcut for search focus.
10. Soft delete / undo delete.

### Not in MVP

1. Browser extension.
2. Team collaboration.
3. Paid subscription.
4. Native mobile app.
5. Full RSS podcast playback.
6. Complex permissions per widget.
7. AI summarisation.

---

## 5. Recommended Tech Stack

### Option A — Fastest Practical Build

Use this unless instructed otherwise.

- **Frontend:** Next.js 15+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **State:** Zustand or React Context for dashboard state
- **Drag/drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Resizable panels:** `react-rnd` or `re-resizable`
- **RSS parsing:** Server route using `rss-parser`
- **Validation:** Zod
- **Deployment:** Vercel

### Option B — Local Prototype Only

- Next.js
- LocalStorage persistence
- No authentication
- Mock RSS feeds

Use Option B only for a throwaway prototype.

---

## 6. Application Structure

```txt
launchdesk/
  app/
    page.tsx
    login/page.tsx
    dashboard/page.tsx
    public/[slug]/page.tsx
    api/
      rss/route.ts
      import/route.ts
      export/route.ts
  components/
    dashboard/
      DashboardCanvas.tsx
      DashboardHeader.tsx
      TabBar.tsx
      WidgetFrame.tsx
      AddWidgetModal.tsx
      WidgetSettingsDrawer.tsx
    widgets/
      BookmarkWidget.tsx
      RssWidget.tsx
      NoteWidget.tsx
      TodoWidget.tsx
      EmbedWidget.tsx
      ClockWidget.tsx
      SearchWidget.tsx
    ui/
      ...shadcn components
  lib/
    supabaseClient.ts
    dashboardStore.ts
    rss.ts
    schema.ts
    defaultDashboard.ts
  types/
    dashboard.ts
  styles/
    globals.css
```

---

## 7. Information Architecture

### Main Routes

| Route | Purpose |
|---|---|
| `/` | Landing page or redirect to dashboard if logged in |
| `/login` | Login/register screen |
| `/dashboard` | Main editable personal dashboard |
| `/public/[slug]` | Read-only public dashboard |
| `/settings` | Account, theme, import/export, privacy |

---

## 8. Dashboard UX

### Top Bar

The top bar should include:

- Product logo/name.
- Universal search box.
- Search engine dropdown.
- Add widget button.
- Theme/settings button.
- Save/sync status.
- User menu.

### Search Behaviour

Default search engines:

- Google
- DuckDuckGo
- YouTube
- Wikipedia
- PubMed
- Google Scholar
- Amazon
- Custom URL template

Search engine object:

```ts
interface SearchEngine {
  id: string;
  name: string;
  queryUrl: string; // Example: https://www.google.com/search?q={query}
  icon?: string;
}
```

When the user types a query and presses Enter, open the selected search URL in a new tab.

---

## 9. Tabs and Categories

### Tab Model

Users can create multiple tabs such as:

- Home
- Work
- News
- Psychology
- Coding
- Finance
- Health
- Projects

Tabs should be reorderable by drag/drop.

Each tab has its own layout and widgets.

### Category Model

MVP can treat category as a simple visibility group:

- `private`
- `public`
- `restricted` — optional later

For MVP, implement:

- Private tabs visible only to owner.
- Public tabs visible through `/public/[slug]`.

Do not implement password-protected restricted tabs in MVP unless the rest is complete.

---

## 10. Layout Modes

Support two layout modes.

### 10.1 Column Mode

This is the safer MVP mode.

- Dashboard has 1–4 columns.
- Widgets sit inside columns.
- Users drag widgets between columns.
- Widget height can be adjusted.
- Width is determined by column.

Use this mode first.

### 10.2 Freeform Mode

Optional stretch feature.

- Widgets have x/y/width/height.
- Users drag anywhere on canvas.
- Snap to grid.
- Store coordinates.

Implement only after column mode works reliably.

---

## 11. Widget System

### Base Widget Interface

```ts
export type WidgetType =
  | 'bookmarks'
  | 'rss'
  | 'note'
  | 'todo'
  | 'embed'
  | 'clock'
  | 'search';

export interface DashboardWidget<TConfig = Record<string, unknown>> {
  id: string;
  tabId: string;
  type: WidgetType;
  title: string;
  config: TConfig;
  layout: {
    column?: number;
    order?: number;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  };
  appearance?: {
    color?: string;
    collapsed?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Widget Frame Requirements

Every widget should have:

- Header with title.
- Drag handle.
- Collapse button.
- Settings button.
- Delete button.
- Optional refresh button.
- Body area.
- Resizable height.

---

## 12. Widget Specs

### 12.1 Bookmark Widget

Purpose: grouped list of links.

Config:

```ts
interface BookmarkWidgetConfig {
  links: {
    id: string;
    title: string;
    url: string;
    description?: string;
    faviconUrl?: string;
    tags?: string[];
  }[];
  displayMode: 'list' | 'grid' | 'compact';
  openInNewTab: boolean;
}
```

Features:

- Add link.
- Edit link.
- Delete link.
- Reorder links.
- Auto-detect favicon using `https://www.google.com/s2/favicons?domain=${domain}` or equivalent.
- Validate URL.

---

### 12.2 RSS Feed Widget

Purpose: show headlines from a feed URL.

Config:

```ts
interface RssWidgetConfig {
  feedUrl: string;
  itemLimit: number;
  showDescription: boolean;
  showDate: boolean;
  refreshMinutes: number;
}
```

Features:

- Server-side RSS fetch through `/api/rss?url=`.
- Parse title, link, date, description, source.
- Cache responses for 10–30 minutes.
- Show error state if feed fails.
- Open articles in new tab.

Important security rule:

- Do not fetch RSS directly from the browser due to CORS and privacy issues.
- Validate URLs server-side.
- Block local/private IP ranges.
- Apply request timeout.

---

### 12.3 Sticky Note Widget

Purpose: editable note.

Config:

```ts
interface NoteWidgetConfig {
  content: string;
  format: 'plain' | 'markdown';
}
```

Features:

- Click-to-edit.
- Autosave after debounce.
- Markdown preview optional.
- Plain text first.

---

### 12.4 To-Do Widget

Purpose: simple checklist.

Config:

```ts
interface TodoWidgetConfig {
  items: {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    dueDate?: string;
  }[];
  showCompleted: boolean;
}
```

Features:

- Add task.
- Mark complete.
- Delete task.
- Reorder tasks.
- Filter completed.

---

### 12.5 Embed Widget

Purpose: display an external HTTPS webpage or embeddable service.

Config:

```ts
interface EmbedWidgetConfig {
  url: string;
  height: number;
  allowScripts: boolean;
}
```

Features:

- Iframe with sandbox restrictions.
- Only allow HTTPS URLs.
- Show fallback message when site blocks iframe embedding.
- Never allow arbitrary inline scripts in MVP.

Iframe security:

```tsx
<iframe
  src={url}
  sandbox="allow-same-origin allow-forms allow-popups"
  referrerPolicy="no-referrer"
/>
```

Do **not** include `allow-scripts` by default.

---

### 12.6 Clock Widget

Purpose: time/date display.

Config:

```ts
interface ClockWidgetConfig {
  timezone: string;
  showSeconds: boolean;
  format: '12h' | '24h';
}
```

Features:

- Local time by default.
- Optional timezone selection.
- Date display.

---

### 12.7 Search Widget

Purpose: dedicated search box within dashboard.

Config:

```ts
interface SearchWidgetConfig {
  engines: SearchEngine[];
  defaultEngineId: string;
}
```

Features:

- Query input.
- Engine selector.
- Open results in new tab.

---

## 13. Database Schema

### `profiles`

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  public_slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `dashboards`

```sql
create table dashboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'My Dashboard',
  visibility text not null default 'private',
  theme jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `tabs`

```sql
create table tabs (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade not null,
  title text not null,
  position int not null default 0,
  visibility text not null default 'private',
  layout_mode text not null default 'columns',
  column_count int not null default 3,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `widgets`

```sql
create table widgets (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid references tabs(id) on delete cascade not null,
  type text not null,
  title text not null,
  config jsonb not null default '{}',
  layout jsonb not null default '{}',
  appearance jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Row-Level Security

Enable RLS on all tables.

Rules:

- Owner can select/insert/update/delete own dashboards, tabs, widgets.
- Public can select dashboards/tabs/widgets where dashboard or tab visibility is public.
- No public insert/update/delete.

---

## 14. Default Seed Dashboard

When a new user signs up, create:

### Tab 1: Home

Widgets:

1. Search widget
2. Bookmarks widget with placeholder links
3. Sticky note widget
4. Clock widget

### Tab 2: News

Widgets:

1. RSS widget with a sample feed
2. Bookmark widget for news sources

### Tab 3: Work

Widgets:

1. To-do widget
2. Bookmark widget
3. Sticky note widget

---

## 15. UI Style Direction

### Visual Style

- Browser-homepage dashboard.
- Dense but readable.
- Soft cards.
- Subtle borders.
- Low-friction interaction.
- Customisable but not chaotic.

### Suggested Tailwind Theme

- Background: neutral slate/gray gradient or user-selected image.
- Widgets: white/dark cards with 80–95% opacity.
- Border radius: `rounded-2xl`.
- Shadow: `shadow-sm` or `shadow-md`.
- Header: compact and sticky.
- Widget header: smaller, utilitarian.

### Responsive Behaviour

Desktop:

- 3-column dashboard default.
- Drag/drop enabled.

Tablet:

- 2 columns.

Mobile:

- 1 column.
- Drag/drop optional or disabled.
- Widgets stack vertically.

---

## 16. User Flows

### 16.1 Create Account

1. User opens site.
2. Clicks sign up.
3. Creates account.
4. App creates default dashboard.
5. Redirects to `/dashboard`.

### 16.2 Add Widget

1. User clicks `Add widget`.
2. Modal opens.
3. User chooses widget type.
4. User fills required fields.
5. Widget appears on current tab.
6. Layout auto-saves.

### 16.3 Edit Widget

1. User clicks widget settings.
2. Settings drawer opens.
3. User edits title/config.
4. Changes autosave.

### 16.4 Reorder Widgets

1. User drags widget by header handle.
2. Widget moves within or between columns.
3. New order saves after drop.

### 16.5 Public Sharing

1. User opens settings.
2. Turns on public sharing.
3. Chooses public slug.
4. Public page becomes available at `/public/[slug]`.
5. Public page is read-only.

---

## 17. Security Requirements

### Critical

1. Sanitize all user-provided URLs.
2. Only allow `https://` embeds.
3. Do not allow arbitrary JavaScript widgets in MVP.
4. RSS proxy must block internal network addresses.
5. Add rate limiting to RSS endpoint.
6. Apply Supabase RLS from the start.
7. Escape/sanitize HTML from RSS descriptions.
8. Iframes must use sandbox restrictions.
9. Use Content Security Policy headers.

### RSS Fetch Rules

Server route should:

- Accept only valid HTTP/HTTPS URLs.
- Prefer HTTPS.
- Reject private IPs and localhost.
- Timeout after 5 seconds.
- Limit response size.
- Parse safely.
- Cache response.

---

## 18. Performance Requirements

- Initial dashboard load under 2 seconds on normal broadband.
- Lazy-load RSS widgets.
- Lazy-load embeds.
- Debounce note/to-do autosaves.
- Avoid re-rendering all widgets on each edit.
- Cache dashboard state locally for perceived speed.
- Show skeleton states while loading.

---

## 19. Accessibility Requirements

- Full keyboard navigation for top search and tabs.
- Visible focus states.
- ARIA labels for widget controls.
- Sufficient contrast in default themes.
- Drag/drop should have fallback controls for moving widgets up/down.
- Buttons must have labels, not icon-only without accessible text.

---

## 20. Import/Export

### Export JSON Shape

```ts
interface DashboardExport {
  version: 1;
  exportedAt: string;
  dashboard: {
    name: string;
    theme: Record<string, unknown>;
    tabs: {
      title: string;
      visibility: 'private' | 'public';
      layoutMode: 'columns' | 'freeform';
      columnCount: number;
      widgets: DashboardWidget[];
    }[];
  };
}
```

### Import Rules

- Validate with Zod.
- Never import raw IDs directly; generate new IDs.
- Sanitize URLs.
- Reject unsupported widget types.

---

## 21. Codex Implementation Plan

### Phase 1 — Static Prototype

Build:

- Next.js app.
- Dashboard page.
- Top bar.
- Tabs.
- Static widget cards.
- Responsive 3-column layout.

Acceptance:

- User can switch tabs.
- Widget types render with mock data.
- UI resembles a start-page dashboard.

---

### Phase 2 — Local State and Widget CRUD

Build:

- Zustand store or React state.
- Add widget modal.
- Edit widget drawer.
- Delete widget.
- LocalStorage persistence.

Acceptance:

- User can add/edit/delete widgets.
- Refreshing page preserves local dashboard.

---

### Phase 3 — Drag/Drop Layout

Build:

- Column mode layout.
- Drag widgets between columns.
- Reorder widgets.
- Persist layout.

Acceptance:

- Drag/drop works smoothly on desktop.
- Layout persists after refresh.

---

### Phase 4 — Supabase Auth and Database

Build:

- Auth flow.
- Database tables.
- RLS policies.
- Dashboard load/save.
- Default dashboard creation.

Acceptance:

- Each user sees only their own dashboard.
- Data persists across browsers.

---

### Phase 5 — RSS and Embeds

Build:

- RSS server route.
- RSS widget config.
- Embed widget with sandbox.
- Error states.

Acceptance:

- User can add RSS feed URL and see headlines.
- Failed feeds show a helpful message.
- Embed widget safely displays supported pages.

---

### Phase 6 — Sharing and Export

Build:

- Public slug.
- Public read-only dashboard page.
- Import/export JSON.

Acceptance:

- User can publish selected dashboard/tabs.
- Public viewer cannot edit.
- JSON export/import works.

---

## 22. First Build Prompt for Codex

Use this prompt inside Codex:

```txt
Build a Next.js 15 TypeScript app called LaunchDesk: a Protopage-style personal dashboard/start page. Implement Phase 1 and Phase 2 first.

Requirements:
- Use Tailwind CSS and shadcn/ui.
- Create a `/dashboard` route.
- Build a top header with logo, search box, selected search engine, Add Widget button, and settings button.
- Build editable tabs.
- Build a 3-column responsive dashboard layout.
- Implement widgets: bookmarks, RSS mock widget, sticky note, to-do list, embed placeholder, clock, and search widget.
- Implement Add Widget modal.
- Implement Edit Widget settings drawer.
- Persist all dashboard state to localStorage for now.
- Use TypeScript interfaces for Dashboard, Tab, Widget, and each widget config.
- Keep components modular under `components/dashboard` and `components/widgets`.
- Do not implement Supabase yet.
- Do not implement arbitrary script widgets.
- Make the UI clean, dense, and homepage-oriented.

After building, provide a short summary of files created and how to run the app.
```

---

## 23. Key Product Decisions

### Decision 1: Do not clone Protopage exactly

Build the same product category, not an exact clone. The goal is a modern personal dashboard/start page with better security and cleaner UX.

### Decision 2: Avoid arbitrary custom script widgets

Protopage-style pages can become powerful when users embed arbitrary scripts, but that is unsafe for an MVP. Use safe widget types first.

### Decision 3: Column mode before freeform mode

Freeform draggable desktops look attractive but create many layout bugs, especially on mobile. Column mode gives 80% of the benefit with much less complexity.

### Decision 4: RSS is a differentiator

Most start pages become simple bookmark grids. RSS widgets make this more useful as an actual command centre.

### Decision 5: Public sharing should be read-only first

Collaboration and restricted permissions can wait. Public sharing is useful enough for MVP.

---

## 24. Future Enhancements

1. Browser extension to add bookmarks/RSS feeds from current tab.
2. AI feed summarisation.
3. Daily digest email.
4. Calendar widget.
5. Weather widget.
6. Stock/crypto watchlist widget.
7. Pomodoro/focus timer widget.
8. Password-protected restricted dashboards.
9. Team dashboards.
10. Widget marketplace.
11. OPML RSS import/export.
12. Bookmark import from browser export file.
13. Mobile PWA install support.
14. New-tab browser extension.
15. Offline mode.

---

## 25. Definition of Done for MVP

MVP is complete when:

- User can sign up/log in.
- User gets a default dashboard.
- User can create/edit/delete/reorder tabs.
- User can add/edit/delete/reorder widgets.
- Bookmarks, notes, tasks, RSS, embeds, clock, and search widgets work.
- Layout persists in database.
- Public read-only sharing works.
- Dashboard is usable on desktop and mobile.
- App has basic security controls for embeds and RSS.
- User can export/import dashboard JSON.

---

## 26. Suggested Initial Default Links for Prototype

Use neutral placeholders:

- Gmail — `https://mail.google.com`
- Calendar — `https://calendar.google.com`
- YouTube — `https://youtube.com`
- Wikipedia — `https://wikipedia.org`
- GitHub — `https://github.com`
- ChatGPT — `https://chatgpt.com`

---

## 27. Notes for Codex

- Prioritise working product over perfect abstraction.
- Keep all widgets data-driven.
- Avoid hard-coding widget-specific layout logic inside the dashboard canvas.
- Use strong TypeScript types early.
- Prefer simple autosave over complex optimistic syncing until Supabase phase.
- Build the MVP in layers: static UI → local state → drag/drop → backend.
- Treat RSS and iframe widgets as security-sensitive.
