(function () {
  const SUPABASE_URL = "https://hcktetabnmkupvmobsyg.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_EpMudS-XWR0MNjRydbQSwg_upYj8iKw";

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  const style = document.createElement("style");
  style.textContent = `
    .auth-overlay { position: fixed; inset: 0; background: rgba(205, 220, 230, .55); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: system-ui, sans-serif; }
    .auth-card { background: rgba(255, 255, 255, .8); border: 1px solid rgba(255, 255, 255, .9); border-radius: 22px; padding: 32px; width: 340px; max-width: 90vw; box-shadow: 0 30px 70px -20px rgba(40, 80, 105, .5); }
    .auth-card h2 { margin: 0 0 6px; font: 400 32px/1.05 "Instrument Serif", Georgia, serif; color: #14222a; }
    .auth-card p.auth-sub { margin: 0 0 20px; color: #64748b; font-size: 14px; }
    .auth-card label { display: block; font-size: 13px; margin-bottom: 4px; color: #334155; }
    .auth-card input { width: 100%; box-sizing: border-box; padding: 9px 10px; margin-bottom: 14px; border: 1px solid rgba(60, 90, 105, .35); border-radius: 12px; font-size: 14px; background: rgba(255, 255, 255, .8); }
    .auth-card button.auth-submit { width: 100%; padding: 10px; border: none; border-radius: 999px; background: #14222a; color: #fff; font-weight: 600; cursor: pointer; font-size: 14px; }
    .auth-card button.auth-submit:disabled { opacity: .6; cursor: default; }
    .auth-toggle { margin-top: 14px; font-size: 13px; text-align: center; color: #475569; }
    .auth-toggle button { background: none; border: none; color: #2f6b75; cursor: pointer; font-size: 13px; padding: 0; }
    .auth-error { color: #dc2626; font-size: 13px; margin: -6px 0 14px; min-height: 16px; }
    .auth-note { color: #15803d; font-size: 13px; margin: -6px 0 14px; min-height: 16px; }
    .auth-bar { display: flex; align-items: center; gap: 10px; font: 13px system-ui, sans-serif; }
    .auth-bar--floating { position: fixed; top: 10px; right: 12px; z-index: 9998; background: rgba(255, 255, 255, .6); border: 1px solid rgba(255, 255, 255, .9); border-radius: 999px; padding: 6px 12px; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: 0 10px 22px -14px rgba(50, 90, 115, .5); }
    .auth-bar .auth-home { color: #2f6b75; text-decoration: none; font-weight: 600; white-space: nowrap; }
    .auth-bar .auth-home:hover { text-decoration: underline; }
    .auth-bar .auth-email { color: #64748b; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .auth-bar button { border: 1px solid rgba(255, 255, 255, .9); background: rgba(255, 255, 255, .6); border-radius: 999px; padding: 5px 12px; cursor: pointer; font-size: 12px; white-space: nowrap; }
    .auth-bar button:hover { background: #fff; }
    @media (max-width: 600px) { .auth-bar .auth-email { display: none; } }
  `;
  document.head.appendChild(style);

  function renderOverlay(mode, message) {
    let overlay = document.querySelector(".auth-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "auth-overlay";
      document.body.appendChild(overlay);
    }
    const isSignUp = mode === "signup";
    overlay.innerHTML = `
      <form class="auth-card" id="auth-form">
        <h2>${isSignUp ? "Create account" : "Sign in"}</h2>
        <p class="auth-sub">${isSignUp ? "Set up access to your dashboard and CPD log." : "Sign in to continue."}</p>
        <label>Email<input type="email" name="email" required autocomplete="email" /></label>
        <label>Password<input type="password" name="password" required autocomplete="${isSignUp ? "new-password" : "current-password"}" minlength="${isSignUp ? "12" : "6"}" /></label>
        ${isSignUp ? '<p class="auth-sub">Use at least 12 characters. By creating an account, you acknowledge the <a href="../privacy.html">privacy notice</a>, including that assessment answers may be stored as sensitive health information.</p>' : ""}
        <div class="${message && message.isError === false ? "auth-note" : "auth-error"}">${message ? escapeHtml(message.text) : ""}</div>
        <button class="auth-submit" type="submit">${isSignUp ? "Sign up" : "Sign in"}</button>
        <div class="auth-toggle">
          ${isSignUp ? "Already have an account?" : "Need an account?"}
          <button type="button" id="auth-toggle-mode">${isSignUp ? "Sign in" : "Sign up"}</button>
        </div>
      </form>`;

    overlay.querySelector("#auth-toggle-mode").addEventListener("click", () => renderOverlay(isSignUp ? "signin" : "signup"));

    overlay.querySelector("#auth-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = overlay.querySelector(".auth-submit");
      submitButton.disabled = true;
      const formData = new FormData(event.target);
      const email = formData.get("email");
      const password = formData.get("password");

      const { data, error } = isSignUp
        ? await client.auth.signUp({ email, password })
        : await client.auth.signInWithPassword({ email, password });

      if (error) {
        submitButton.disabled = false;
        renderOverlay(mode, { text: error.message, isError: true });
        return;
      }

      if (isSignUp && !data.session) {
        renderOverlay("signin", { text: "Check your email to confirm your account, then sign in.", isError: false });
        return;
      }
      // If session came back immediately (email confirmation disabled), onAuthStateChange below handles closing the overlay.
    });
  }

  function renderBar(session) {
    const slot = document.getElementById("auth-slot");
    let bar = document.querySelector(".auth-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = slot ? "auth-bar" : "auth-bar auth-bar--floating";
      (slot || document.body).appendChild(bar);
    }
    bar.innerHTML = `<a class="auth-home" href="../index.html">← Home</a><span class="auth-email">${escapeHtml(session.user.email)}</span><button type="button" id="auth-signout">Sign out</button>`;
    bar.querySelector("#auth-signout").addEventListener("click", () => client.auth.signOut());
  }

  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      location.reload();
      return;
    }
    if (session) {
      document.querySelector(".auth-overlay")?.remove();
      renderBar(session);
      resolveReady(session);
    }
  });

  client.auth.getSession().then(({ data }) => {
    if (!data.session) renderOverlay("signin");
  });

  window.AppAuth = { client, ready };
})();
