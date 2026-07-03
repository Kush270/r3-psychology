const searchEngines = [
  { id: "google", name: "Google", queryUrl: "https://www.google.com/search?q={query}" },
  { id: "duckduckgo", name: "DuckDuckGo", queryUrl: "https://duckduckgo.com/?q={query}" },
  { id: "youtube", name: "YouTube", queryUrl: "https://www.youtube.com/results?search_query={query}" },
  { id: "wikipedia", name: "Wikipedia", queryUrl: "https://en.wikipedia.org/wiki/Special:Search?search={query}" },
  { id: "pubmed", name: "PubMed", queryUrl: "https://pubmed.ncbi.nlm.nih.gov/?term={query}" },
  { id: "scholar", name: "Scholar", queryUrl: "https://scholar.google.com/scholar?q={query}" },
  { id: "amazon", name: "Amazon", queryUrl: "https://www.amazon.com/s?k={query}" }
];

const widgetTypes = [
  { type: "search", title: "Quick Search", description: "A focused search box for this tab." },
  { type: "bookmarks", title: "Bookmarks", description: "Grouped links with favicons." },
  { type: "rss", title: "RSS Feed", description: "Mock headlines for a news feed." },
  { type: "note", title: "Sticky Note", description: "Autosaved notes and reminders." },
  { type: "todo", title: "To-do List", description: "Simple checklist with completed filter." },
  { type: "embed", title: "Embed", description: "Safe HTTPS iframe placeholder." },
  { type: "clock", title: "Clock", description: "Local time, date, and timezone." }
];

const els = {
  engine: document.querySelector("#search-engine"),
  globalSearch: document.querySelector("#global-search"),
  searchQuery: document.querySelector("#search-query"),
  syncStatus: document.querySelector("#sync-status"),
  publicToggle: document.querySelector("#public-toggle"),
  visibilityLabel: document.querySelector("#visibility-label"),
  dashboardTitle: document.querySelector("#dashboard-title"),
  tabs: document.querySelector("#tabs"),
  addTab: document.querySelector("#add-tab-button"),
  canvas: document.querySelector("#dashboard-canvas"),
  modal: document.querySelector("#widget-modal"),
  openModal: document.querySelector("#add-widget-button"),
  closeModal: document.querySelector("#close-widget-modal"),
  picker: document.querySelector("#widget-picker"),
  drawer: document.querySelector("#settings-drawer"),
  closeSettings: document.querySelector("#close-settings"),
  settingsButton: document.querySelector("#settings-button"),
  drawerKicker: document.querySelector("#drawer-kicker"),
  drawerTitle: document.querySelector("#drawer-title"),
  settingsContent: document.querySelector("#settings-content"),
  toast: document.querySelector("#toast")
};

// ---- Supabase-backed persistence ----

let userId = null;
let lastSyncedTabIds = new Set();
let lastSyncedWidgetIds = new Set();
let state;
let autosaveTimer;
let clockTimer;

function defaultDashboardShape() {
  const id = crypto.randomUUID();
  return {
    version: 1,
    name: "My Dashboard",
    visibility: "private",
    activeTabId: id,
    theme: { accent: "#2563eb", wallpaper: "" },
    tabs: [{ id, title: "Home", visibility: "private", columnCount: 3, widgets: [] }]
  };
}

function widgetFromRow(row) {
  return {
    id: row.id,
    tabId: row.tab_id,
    type: row.type,
    title: row.title,
    config: row.config,
    layout: row.layout,
    appearance: row.appearance,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function loadDashboard() {
  const client = window.AppAuth.client;
  const [{ data: dashRow }, { data: tabRows }, { data: widgetRows }] = await Promise.all([
    client.from("dashboards").select("*").eq("user_id", userId).maybeSingle(),
    client.from("dashboard_tabs").select("*").eq("user_id", userId).order("sort_order"),
    client.from("dashboard_widgets").select("*").eq("user_id", userId)
  ]);

  const tabs = (tabRows || []).map((t) => ({
    id: t.id,
    title: t.title,
    visibility: t.visibility,
    columnCount: t.column_count,
    widgets: (widgetRows || []).filter((w) => w.tab_id === t.id).map(widgetFromRow)
  }));

  if (!dashRow || tabs.length === 0) {
    return defaultDashboardShape();
  }

  lastSyncedTabIds = new Set(tabs.map((t) => t.id));
  lastSyncedWidgetIds = new Set((widgetRows || []).map((w) => w.id));

  return {
    version: 1,
    name: dashRow.name,
    visibility: dashRow.visibility,
    activeTabId: dashRow.active_tab_id || tabs[0].id,
    theme: dashRow.theme || { accent: "#2563eb", wallpaper: "" },
    tabs
  };
}

function saveDashboard() {
  els.syncStatus.textContent = "Saving";
  clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(syncDashboard, 400);
}

async function syncDashboard() {
  const client = window.AppAuth.client;

  // Tabs first so dashboards.active_tab_id and widgets.tab_id always have a valid FK target.
  if (state.tabs.length) {
    await client.from("dashboard_tabs").upsert(
      state.tabs.map((t, index) => ({
        id: t.id,
        user_id: userId,
        title: t.title,
        visibility: t.visibility,
        column_count: t.columnCount,
        sort_order: index
      }))
    );
  }

  const currentTabIds = new Set(state.tabs.map((t) => t.id));
  const removedTabIds = [...lastSyncedTabIds].filter((id) => !currentTabIds.has(id));
  if (removedTabIds.length) await client.from("dashboard_tabs").delete().in("id", removedTabIds);
  lastSyncedTabIds = currentTabIds;

  await client.from("dashboards").upsert({
    user_id: userId,
    name: state.name,
    visibility: state.visibility,
    active_tab_id: state.activeTabId,
    theme: state.theme,
    updated_at: new Date().toISOString()
  });

  const allWidgets = state.tabs.flatMap((t) => t.widgets);
  if (allWidgets.length) {
    await client.from("dashboard_widgets").upsert(
      allWidgets.map((w) => ({
        id: w.id,
        tab_id: w.tabId,
        user_id: userId,
        type: w.type,
        title: w.title,
        config: w.config,
        layout: w.layout,
        appearance: w.appearance,
        updated_at: w.updatedAt || new Date().toISOString()
      }))
    );
  }

  const currentWidgetIds = new Set(allWidgets.map((w) => w.id));
  const removedWidgetIds = [...lastSyncedWidgetIds].filter((id) => !currentWidgetIds.has(id));
  if (removedWidgetIds.length) await client.from("dashboard_widgets").delete().in("id", removedWidgetIds);
  lastSyncedWidgetIds = currentWidgetIds;

  els.syncStatus.textContent = "Saved";
}

function createWidget(type, tabId, column = 0, configOverride = {}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const defaults = {
    bookmarks: {
      links: [
        link("Gmail", "https://mail.google.com"),
        link("Calendar", "https://calendar.google.com"),
        link("YouTube", "https://youtube.com"),
        link("Wikipedia", "https://wikipedia.org"),
        link("GitHub", "https://github.com"),
        link("ChatGPT", "https://chatgpt.com")
      ],
      displayMode: "grid",
      openInNewTab: true
    },
    rss: {
      feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
      itemLimit: 5,
      showDescription: true,
      showDate: true,
      refreshMinutes: 20,
      items: [
        { title: "World briefing: markets, science, and policy updates", source: "BBC", date: "Today", url: "https://www.bbc.com/news" },
        { title: "Technology teams experiment with smaller, faster product loops", source: "Reuters", date: "Today", url: "https://www.reuters.com/technology/" },
        { title: "Health researchers publish new wellbeing review", source: "PubMed", date: "This week", url: "https://pubmed.ncbi.nlm.nih.gov/" }
      ]
    },
    note: { content: "", format: "plain" },
    todo: {
      showCompleted: true,
      items: [
        { id: crypto.randomUUID(), text: "Review inbox", completed: false, createdAt: now },
        { id: crypto.randomUUID(), text: "Plan tomorrow", completed: false, createdAt: now },
        { id: crypto.randomUUID(), text: "Archive finished links", completed: true, createdAt: now }
      ]
    },
    embed: { url: "https://example.com", height: 260, allowScripts: false },
    clock: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, showSeconds: true, format: "12h" },
    search: { engines: searchEngines, defaultEngineId: "google" }
  };

  return {
    id,
    tabId,
    type,
    title: widgetTypes.find((w) => w.type === type)?.title || "Widget",
    config: { ...defaults[type], ...configOverride },
    layout: { column, order: 0, h: type === "embed" ? 320 : 220 },
    appearance: { color: "#ffffff", collapsed: false },
    createdAt: now,
    updatedAt: now
  };
}

function link(title, url) {
  return { id: crypto.randomUUID(), title, url, description: "", faviconUrl: favicon(url), tags: [] };
}

function favicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

function bindGlobalEvents() {
  els.globalSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    openSearch(els.searchQuery.value, els.engine.value);
    els.searchQuery.value = "";
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      els.searchQuery.focus();
    }
  });

  els.openModal.addEventListener("click", () => els.modal.classList.remove("hidden"));
  els.closeModal.addEventListener("click", () => els.modal.classList.add("hidden"));
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) els.modal.classList.add("hidden");
  });
  els.settingsButton.addEventListener("click", openDashboardSettings);
  els.closeSettings.addEventListener("click", closeDrawer);
  els.publicToggle.addEventListener("change", () => {
    state.visibility = els.publicToggle.checked ? "public" : "private";
    saveDashboard();
    renderHeaderState();
  });
  els.addTab.addEventListener("click", addTab);
}

function renderSearchEngines() {
  els.engine.innerHTML = searchEngines.map((engine) => `<option value="${engine.id}">${engine.name}</option>`).join("");
}

function renderWidgetPicker() {
  els.picker.innerHTML = widgetTypes
    .map(
      (widget) => `
      <button class="picker-card" type="button" data-type="${widget.type}">
        <strong>${widget.title}</strong>
        <span>${widget.description}</span>
      </button>`
    )
    .join("");

  els.picker.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = activeTab();
      tab.widgets.push(createWidget(button.dataset.type, tab.id, shortestColumn(tab)));
      els.modal.classList.add("hidden");
      saveDashboard();
      render();
      showToast("Widget added");
    });
  });
}

function render() {
  renderHeaderState();
  renderTabs();
  renderCanvas();
}

function renderHeaderState() {
  els.dashboardTitle.textContent = state.name;
  els.publicToggle.checked = state.visibility === "public";
  els.visibilityLabel.textContent = state.visibility === "public" ? "Public dashboard" : "Private dashboard";
  document.documentElement.style.setProperty("--accent", state.theme.accent || "#2563eb");
  document.body.style.backgroundImage = state.theme.wallpaper
    ? `linear-gradient(135deg, rgba(248,250,252,.9), rgba(219,234,254,.78)), url("${state.theme.wallpaper}")`
    : "";
}

function renderTabs() {
  els.tabs.innerHTML = state.tabs
    .map(
      (tab, index) => `
      <button class="tab ${tab.id === state.activeTabId ? "active" : ""}" type="button" data-tab-id="${tab.id}">
        <span>${escapeHtml(tab.title)}</span>
        <small>${tab.widgets.length}</small>
        <span class="tab-controls">
          <span data-tab-action="left" data-index="${index}" aria-label="Move left">‹</span>
          <span data-tab-action="right" data-index="${index}" aria-label="Move right">›</span>
          <span data-tab-action="delete" data-index="${index}" aria-label="Delete">×</span>
        </span>
      </button>`
    )
    .join("");

  els.tabs.querySelectorAll("[data-tab-id]").forEach((tabButton) => {
    tabButton.addEventListener("click", (event) => {
      if (event.target.dataset.tabAction) return;
      state.activeTabId = tabButton.dataset.tabId;
      saveDashboard();
      render();
    });
  });

  els.tabs.querySelectorAll("[data-tab-action]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.stopPropagation();
      handleTabAction(control.dataset.tabAction, Number(control.dataset.index));
    });
  });
}

function renderCanvas() {
  const tab = activeTab();
  const columns = Array.from({ length: tab.columnCount }, (_, column) =>
    tab.widgets
      .filter((widget) => (widget.layout.column || 0) === column)
      .sort((a, b) => (a.layout.order || 0) - (b.layout.order || 0))
  );

  els.canvas.style.setProperty("--columns", tab.columnCount);
  els.canvas.innerHTML = columns
    .map(
      (widgets, column) => `
      <div class="widget-column" data-column="${column}">
        ${widgets.map((widget, order) => renderWidgetFrame(widget, order, column)).join("")}
      </div>`
    )
    .join("");

  bindWidgetEvents();
  renderClockFaces();
}

function renderWidgetFrame(widget, order, column) {
  return `
    <article class="widget-card" draggable="true" data-widget-id="${widget.id}" style="--widget-color:${widget.appearance.color || "#ffffff"}">
      <header class="widget-header">
        <button class="drag-handle" type="button" aria-label="Drag widget">☰</button>
        <h2>${escapeHtml(widget.title)}</h2>
        <div class="widget-actions">
          <button type="button" data-widget-action="up" aria-label="Move up">↑</button>
          <button type="button" data-widget-action="down" aria-label="Move down">↓</button>
          <button type="button" data-widget-action="collapse" aria-label="Collapse">${widget.appearance.collapsed ? "+" : "−"}</button>
          <button type="button" data-widget-action="settings" aria-label="Settings">⚙</button>
          <button type="button" data-widget-action="duplicate" aria-label="Duplicate">⧉</button>
          <button type="button" data-widget-action="delete" aria-label="Delete">×</button>
        </div>
      </header>
      <div class="widget-body ${widget.appearance.collapsed ? "collapsed" : ""}">
        ${renderWidgetBody(widget)}
      </div>
      <footer class="widget-footer">
        <button type="button" data-widget-action="left" ${column === 0 ? "disabled" : ""}>Move left</button>
        <button type="button" data-widget-action="right" ${column === activeTab().columnCount - 1 ? "disabled" : ""}>Move right</button>
      </footer>
    </article>
  `;
}

function renderWidgetBody(widget) {
  switch (widget.type) {
    case "bookmarks":
      return renderBookmarks(widget);
    case "rss":
      return renderRss(widget);
    case "note":
      return `<textarea class="note-field" data-note-id="${widget.id}" aria-label="Note">${escapeHtml(widget.config.content || "")}</textarea>`;
    case "todo":
      return renderTodo(widget);
    case "embed":
      return renderEmbed(widget);
    case "clock":
      return `<div class="clock-face" data-clock-id="${widget.id}"></div>`;
    case "search":
      return renderSearchWidget(widget);
    default:
      return `<p>Unsupported widget.</p>`;
  }
}

function renderBookmarks(widget) {
  const mode = widget.config.displayMode || "list";
  return `
    <div class="bookmark-list ${mode}">
      ${widget.config.links
        .map(
          (item) => `
          <a href="${sanitizeUrl(item.url)}" ${widget.config.openInNewTab ? 'target="_blank" rel="noreferrer"' : ""}>
            <img src="${item.faviconUrl || favicon(item.url)}" alt="" />
            <span>${escapeHtml(item.title)}</span>
          </a>`
        )
        .join("")}
    </div>`;
}

function renderRss(widget) {
  return `
    <div class="rss-meta">
      <span>${escapeHtml(widget.config.feedUrl)}</span>
      <button type="button" data-widget-action="refresh">Refresh</button>
    </div>
    <ul class="rss-list">
      ${widget.config.items
        .slice(0, widget.config.itemLimit)
        .map(
          (item) => `
          <li>
            <a href="${sanitizeUrl(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
            <span>${escapeHtml(item.source)} · ${escapeHtml(item.date)}</span>
          </li>`
        )
        .join("")}
    </ul>`;
}

function renderTodo(widget) {
  const items = widget.config.showCompleted ? widget.config.items : widget.config.items.filter((item) => !item.completed);
  return `
    <form class="todo-form" data-todo-form="${widget.id}">
      <input type="text" placeholder="Add a task" aria-label="Add a task" />
      <button type="submit">Add</button>
    </form>
    <ul class="todo-list">
      ${items
        .map(
          (item) => `
          <li>
            <label>
              <input type="checkbox" data-todo-id="${item.id}" data-widget-id="${widget.id}" ${item.completed ? "checked" : ""} />
              <span class="${item.completed ? "done" : ""}">${escapeHtml(item.text)}</span>
            </label>
            <button type="button" data-remove-todo="${item.id}" data-widget-id="${widget.id}" aria-label="Delete task">×</button>
          </li>`
        )
        .join("")}
    </ul>`;
}

function renderEmbed(widget) {
  const url = sanitizeUrl(widget.config.url);
  const valid = url.startsWith("https://");
  if (!valid) return `<div class="empty-state">Embeds require a valid HTTPS URL.</div>`;
  return `
    <div class="embed-frame" style="height:${Number(widget.config.height) || 260}px">
      <iframe src="${url}" sandbox="allow-same-origin allow-forms allow-popups" referrerpolicy="no-referrer" loading="lazy"></iframe>
    </div>
    <p class="embed-note">Some websites block iframe embedding.</p>`;
}

function renderSearchWidget(widget) {
  return `
    <form class="inner-search" data-search-widget="${widget.id}">
      <select aria-label="Search engine">
        ${searchEngines.map((engine) => `<option value="${engine.id}" ${engine.id === widget.config.defaultEngineId ? "selected" : ""}>${engine.name}</option>`).join("")}
      </select>
      <input type="search" placeholder="Search this tab" aria-label="Search query" />
      <button type="submit">Search</button>
    </form>`;
}

function bindWidgetEvents() {
  els.canvas.querySelectorAll("[data-widget-action]").forEach((button) => {
    button.addEventListener("click", () => handleWidgetAction(button.closest("[data-widget-id]").dataset.widgetId, button.dataset.widgetAction));
  });

  els.canvas.querySelectorAll("[data-note-id]").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      const widget = findWidget(textarea.dataset.noteId);
      widget.config.content = textarea.value;
      touch(widget);
      saveDashboard();
    });
  });

  els.canvas.querySelectorAll("[data-todo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      if (!input.value.trim()) return;
      const widget = findWidget(form.dataset.todoForm);
      widget.config.items.push({ id: crypto.randomUUID(), text: input.value.trim(), completed: false, createdAt: new Date().toISOString() });
      input.value = "";
      touch(widget);
      saveDashboard();
      renderCanvas();
    });
  });

  els.canvas.querySelectorAll("[data-todo-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const widget = findWidget(checkbox.dataset.widgetId);
      const item = widget.config.items.find((todo) => todo.id === checkbox.dataset.todoId);
      item.completed = checkbox.checked;
      touch(widget);
      saveDashboard();
      renderCanvas();
    });
  });

  els.canvas.querySelectorAll("[data-remove-todo]").forEach((button) => {
    button.addEventListener("click", () => {
      const widget = findWidget(button.dataset.widgetId);
      widget.config.items = widget.config.items.filter((todo) => todo.id !== button.dataset.removeTodo);
      touch(widget);
      saveDashboard();
      renderCanvas();
    });
  });

  els.canvas.querySelectorAll("[data-search-widget]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openSearch(form.querySelector("input").value, form.querySelector("select").value);
      form.reset();
    });
  });

  els.canvas.querySelectorAll(".widget-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", card.dataset.widgetId));
  });

  els.canvas.querySelectorAll(".widget-column").forEach((column) => {
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      const widget = findWidget(event.dataTransfer.getData("text/plain"));
      widget.layout.column = Number(column.dataset.column);
      widget.layout.order = activeTab().widgets.filter((item) => (item.layout.column || 0) === widget.layout.column).length;
      touch(widget);
      normalizeOrders(activeTab());
      saveDashboard();
      renderCanvas();
    });
  });
}

function handleWidgetAction(widgetId, action) {
  const tab = activeTab();
  const widget = findWidget(widgetId);
  const widgetsInColumn = tab.widgets.filter((item) => (item.layout.column || 0) === (widget.layout.column || 0));
  const index = widgetsInColumn.findIndex((item) => item.id === widgetId);

  if (action === "settings") return openWidgetSettings(widget);
  if (action === "collapse") widget.appearance.collapsed = !widget.appearance.collapsed;
  if (action === "delete") tab.widgets = tab.widgets.filter((item) => item.id !== widgetId);
  if (action === "duplicate") tab.widgets.push({ ...structuredClone(widget), id: crypto.randomUUID(), title: `${widget.title} copy`, createdAt: new Date().toISOString() });
  if (action === "left") widget.layout.column = Math.max(0, (widget.layout.column || 0) - 1);
  if (action === "right") widget.layout.column = Math.min(tab.columnCount - 1, (widget.layout.column || 0) + 1);
  if (action === "up" && index > 0) swapWidgetOrder(widget, widgetsInColumn[index - 1]);
  if (action === "down" && index < widgetsInColumn.length - 1) swapWidgetOrder(widget, widgetsInColumn[index + 1]);
  if (action === "refresh") showToast("RSS refresh is mocked in this prototype");

  normalizeOrders(tab);
  saveDashboard();
  render();
}

function swapWidgetOrder(a, b) {
  const first = a.layout.order || 0;
  a.layout.order = b.layout.order || 0;
  b.layout.order = first;
}

function normalizeOrders(tab) {
  for (let column = 0; column < tab.columnCount; column += 1) {
    tab.widgets
      .filter((widget) => (widget.layout.column || 0) === column)
      .sort((a, b) => (a.layout.order || 0) - (b.layout.order || 0))
      .forEach((widget, order) => {
        widget.layout.order = order;
      });
  }
}

function openWidgetSettings(widget) {
  els.drawerKicker.textContent = "Widget settings";
  els.drawerTitle.textContent = widget.title;
  els.settingsContent.innerHTML = widgetSettingsForm(widget);
  els.drawer.classList.remove("hidden");
  bindSettingsForm(widget);
}

function widgetSettingsForm(widget) {
  const common = `
    <label>Title<input id="widget-title-input" value="${escapeAttr(widget.title)}" /></label>
    <label>Card color<input id="widget-color-input" type="color" value="${escapeAttr(widget.appearance.color || "#ffffff")}" /></label>
  `;
  const forms = {
    bookmarks: `
      <label>Display mode<select id="bookmark-mode"><option value="list">List</option><option value="grid">Grid</option><option value="compact">Compact</option></select></label>
      <label>Links<textarea id="bookmark-links" rows="8">${escapeHtml(widget.config.links.map((item) => `${item.title} | ${item.url}`).join("\n"))}</textarea></label>
    `,
    rss: `
      <label>Feed URL<input id="rss-url" value="${escapeAttr(widget.config.feedUrl)}" /></label>
      <label>Item limit<input id="rss-limit" type="number" min="1" max="12" value="${widget.config.itemLimit}" /></label>
    `,
    note: `<label>Content<textarea id="note-content" rows="10">${escapeHtml(widget.config.content || "")}</textarea></label>`,
    todo: `<label class="check-row"><input id="todo-show-completed" type="checkbox" ${widget.config.showCompleted ? "checked" : ""} /> Show completed tasks</label>`,
    embed: `
      <label>HTTPS URL<input id="embed-url" value="${escapeAttr(widget.config.url)}" /></label>
      <label>Height<input id="embed-height" type="number" min="160" max="640" value="${widget.config.height}" /></label>
    `,
    clock: `
      <label>Timezone<input id="clock-timezone" value="${escapeAttr(widget.config.timezone)}" /></label>
      <label>Format<select id="clock-format"><option value="12h">12 hour</option><option value="24h">24 hour</option></select></label>
      <label class="check-row"><input id="clock-seconds" type="checkbox" ${widget.config.showSeconds ? "checked" : ""} /> Show seconds</label>
    `,
    search: `<label>Default engine<select id="search-default">${searchEngines.map((engine) => `<option value="${engine.id}">${engine.name}</option>`).join("")}</select></label>`
  };
  return `<form id="settings-form">${common}${forms[widget.type] || ""}<button class="button primary" type="submit">Save changes</button></form>`;
}

function bindSettingsForm(widget) {
  const form = document.querySelector("#settings-form");
  setSelected("#bookmark-mode", widget.config.displayMode);
  setSelected("#clock-format", widget.config.format);
  setSelected("#search-default", widget.config.defaultEngineId);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    widget.title = value("#widget-title-input", widget.title);
    widget.appearance.color = value("#widget-color-input", widget.appearance.color);
    if (widget.type === "bookmarks") {
      widget.config.displayMode = value("#bookmark-mode", widget.config.displayMode);
      widget.config.links = value("#bookmark-links", "")
        .split("\n")
        .map((row) => row.split("|").map((part) => part.trim()))
        .filter((parts) => parts.length >= 2 && isValidUrl(parts[1]))
        .map(([title, url]) => link(title, url));
    }
    if (widget.type === "rss") {
      widget.config.feedUrl = value("#rss-url", widget.config.feedUrl);
      widget.config.itemLimit = Number(value("#rss-limit", widget.config.itemLimit));
    }
    if (widget.type === "note") widget.config.content = value("#note-content", widget.config.content);
    if (widget.type === "todo") widget.config.showCompleted = document.querySelector("#todo-show-completed").checked;
    if (widget.type === "embed") {
      const url = value("#embed-url", widget.config.url);
      widget.config.url = url.startsWith("https://") ? url : widget.config.url;
      widget.config.height = Number(value("#embed-height", widget.config.height));
    }
    if (widget.type === "clock") {
      widget.config.timezone = value("#clock-timezone", widget.config.timezone);
      widget.config.format = value("#clock-format", widget.config.format);
      widget.config.showSeconds = document.querySelector("#clock-seconds").checked;
    }
    if (widget.type === "search") widget.config.defaultEngineId = value("#search-default", widget.config.defaultEngineId);
    touch(widget);
    saveDashboard();
    render();
    showToast("Settings saved");
  });
}

function openDashboardSettings() {
  els.drawerKicker.textContent = "Settings";
  els.drawerTitle.textContent = "Dashboard settings";
  els.settingsContent.innerHTML = `
    <form id="dashboard-settings-form">
      <label>Dashboard name<input id="dashboard-name-input" value="${escapeAttr(state.name)}" /></label>
      <label>Accent color<input id="accent-input" type="color" value="${escapeAttr(state.theme.accent || "#2563eb")}" /></label>
      <label>Wallpaper image URL<input id="wallpaper-input" value="${escapeAttr(state.theme.wallpaper || "")}" placeholder="https://..." /></label>
      <label>Active tab columns<input id="columns-input" type="number" min="1" max="4" value="${activeTab().columnCount}" /></label>
      <button class="button primary" type="submit">Save dashboard</button>
    </form>
    <div class="import-export">
      <button class="button" id="export-button" type="button">Export JSON</button>
      <label>Import JSON<textarea id="import-json" rows="8" placeholder="Paste exported LaunchDesk JSON"></textarea></label>
      <button class="button" id="import-button" type="button">Import</button>
      <button class="button danger" id="reset-button" type="button">Reset prototype</button>
    </div>
  `;
  els.drawer.classList.remove("hidden");
  document.querySelector("#dashboard-settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    state.name = value("#dashboard-name-input", state.name);
    state.theme.accent = value("#accent-input", state.theme.accent);
    const wallpaper = value("#wallpaper-input", "");
    state.theme.wallpaper = wallpaper.startsWith("https://") ? wallpaper : "";
    activeTab().columnCount = Math.min(4, Math.max(1, Number(value("#columns-input", activeTab().columnCount))));
    saveDashboard();
    render();
    showToast("Dashboard updated");
  });
  document.querySelector("#export-button").addEventListener("click", exportJson);
  document.querySelector("#import-button").addEventListener("click", importJson);
  document.querySelector("#reset-button").addEventListener("click", () => {
    state = defaultDashboardShape();
    saveDashboard();
    closeDrawer();
    render();
  });
}

function exportJson() {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), dashboard: state }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "launchdesk-export.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importJson() {
  try {
    const parsed = JSON.parse(document.querySelector("#import-json").value);
    const dashboard = parsed.dashboard || parsed;
    if (!dashboard.tabs || !Array.isArray(dashboard.tabs)) throw new Error("Invalid dashboard");
    state = {
      ...defaultDashboardShape(),
      ...dashboard,
      activeTabId: dashboard.activeTabId || dashboard.tabs[0].id,
      tabs: dashboard.tabs.map((tab) => ({
        ...tab,
        id: tab.id || crypto.randomUUID(),
        widgets: (tab.widgets || []).filter((widget) => widgetTypes.some((item) => item.type === widget.type))
      }))
    };
    saveDashboard();
    closeDrawer();
    render();
    showToast("Dashboard imported");
  } catch {
    showToast("Import failed: invalid JSON");
  }
}

function addTab() {
  const title = prompt("New tab name", "Projects");
  if (!title) return;
  const id = crypto.randomUUID();
  state.tabs.push({ id, title, visibility: "private", columnCount: 3, widgets: [] });
  state.activeTabId = id;
  saveDashboard();
  render();
}

function handleTabAction(action, index) {
  if (action === "delete") {
    if (state.tabs.length === 1) return showToast("Keep at least one tab");
    const [removed] = state.tabs.splice(index, 1);
    if (removed.id === state.activeTabId) state.activeTabId = state.tabs[0].id;
  }
  if (action === "left" && index > 0) [state.tabs[index - 1], state.tabs[index]] = [state.tabs[index], state.tabs[index - 1]];
  if (action === "right" && index < state.tabs.length - 1) [state.tabs[index + 1], state.tabs[index]] = [state.tabs[index], state.tabs[index + 1]];
  saveDashboard();
  render();
}

function renderClockFaces() {
  document.querySelectorAll("[data-clock-id]").forEach((face) => {
    const widget = findWidget(face.dataset.clockId);
    if (!widget) return;
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "2-digit",
      second: widget.config.showSeconds ? "2-digit" : undefined,
      hour12: widget.config.format !== "24h",
      timeZone: widget.config.timezone
    };
    face.innerHTML = `
      <strong>${new Intl.DateTimeFormat(undefined, options).format(now)}</strong>
      <span>${new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: widget.config.timezone }).format(now)}</span>
      <small>${escapeHtml(widget.config.timezone)}</small>`;
  });
}

function openSearch(rawQuery, engineId) {
  const query = rawQuery.trim();
  if (!query) return;
  const engine = searchEngines.find((item) => item.id === engineId) || searchEngines[0];
  window.open(engine.queryUrl.replace("{query}", encodeURIComponent(query)), "_blank", "noopener,noreferrer");
}

function activeTab() {
  return state.tabs.find((tab) => tab.id === state.activeTabId) || state.tabs[0];
}

function findWidget(id) {
  return activeTab().widgets.find((widget) => widget.id === id);
}

function shortestColumn(tab) {
  const counts = Array.from({ length: tab.columnCount }, (_, column) => tab.widgets.filter((widget) => (widget.layout.column || 0) === column).length);
  return counts.indexOf(Math.min(...counts));
}

function touch(widget) {
  widget.updatedAt = new Date().toISOString();
}

function closeDrawer() {
  els.drawer.classList.add("hidden");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.setTimeout(() => els.toast.classList.add("hidden"), 2200);
}

function value(selector, fallback) {
  return document.querySelector(selector)?.value ?? fallback;
}

function setSelected(selector, selected) {
  const element = document.querySelector(selector);
  if (element && selected) element.value = selected;
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function sanitizeUrl(url) {
  return isValidUrl(url) ? url : "#";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function init() {
  renderSearchEngines();
  renderWidgetPicker();
  bindGlobalEvents();
  render();
  clockTimer = window.setInterval(renderClockFaces, 1000);
}

const session = await window.AppAuth.ready;
userId = session.user.id;
state = await loadDashboard();
init();
