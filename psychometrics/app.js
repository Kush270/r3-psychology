// Authenticated psychometrics app: take DASS-21 / K10 / PCL-5, save results
// per signed-in user in Supabase, and review them in a history view.

const app = document.getElementById("app");
const db = () => window.AppAuth.client;
let userId = null;

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtDate = (iso) =>
  new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

// ---------- Test definitions ----------

const DASS_SCALE = [
  "Did not apply to me at all",
  "Applied to me to some degree / some of the time",
  "Applied to me to a considerable degree / good part of time",
  "Applied to me very much / most of the time"
];

const FREQ5_K10 = ["None of the time", "A little of the time", "Some of the time", "Most of the time", "All of the time"];
const FREQ5_PCL = ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"];

function opts(descriptions, startAt) {
  return descriptions.map((label, i) => ({ value: i + startAt, label }));
}

const TESTS = {
  dass21: {
    code: "dass21",
    name: "DASS-21",
    tag: "Mood & Stress",
    blurb: "The Depression, Anxiety, and Stress Scale. 21 items measuring three related negative emotional states.",
    instruction: "Please read each statement and select the option which indicates how much it applied to you <strong>over the past week</strong>.",
    options: opts(DASS_SCALE, 0),
    questions: [
      "I found it hard to wind down",
      "I was aware of dryness of my mouth",
      "I couldn't seem to experience any positive feeling at all",
      "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)",
      "I found it difficult to work up the initiative to do things",
      "I tended to over-react to situations",
      "I experienced trembling (e.g. in the hands)",
      "I felt that I was using a lot of nervous energy",
      "I was worried about situations in which I might panic and make a fool of myself",
      "I felt that I had nothing to look forward to",
      "I found myself getting agitated",
      "I found it difficult to relax",
      "I felt down-hearted and blue",
      "I was intolerant of anything that kept me from getting on with what I was doing",
      "I felt I was close to panic",
      "I was unable to become enthusiastic about anything",
      "I felt I wasn't worth much as a person",
      "I felt that I was rather touchy",
      "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart skipping a beat)",
      "I felt scared without any good reason",
      "I felt that life was meaningless"
    ],
    score(answers) {
      const dIdx = [3, 5, 10, 13, 16, 17, 21];
      const aIdx = [2, 4, 7, 9, 15, 19, 20];
      const sIdx = [1, 6, 8, 11, 12, 14, 18];
      let dSum = 0, aSum = 0, sSum = 0;
      Object.entries(answers).forEach(([key, value]) => {
        const num = parseInt(key.replace("q", ""), 10);
        const val = parseInt(value, 10);
        if (dIdx.includes(num)) dSum += val;
        if (aIdx.includes(num)) aSum += val;
        if (sIdx.includes(num)) sSum += val;
      });
      const D = dSum * 2, A = aSum * 2, S = sSum * 2;
      const level = (val, t) => {
        const table = {
          D: [[9, "Normal"], [13, "Mild"], [20, "Moderate"], [27, "Severe"]],
          A: [[7, "Normal"], [9, "Mild"], [14, "Moderate"], [19, "Severe"]],
          S: [[14, "Normal"], [18, "Mild"], [25, "Moderate"], [33, "Severe"]]
        }[t];
        for (const [max, name] of table) if (val <= max) return name;
        return "Extremely Severe";
      };
      return {
        score: `D:${D} A:${A} S:${S}`,
        interpretation: `Depression: ${D} (${level(D, "D")}) | Anxiety: ${A} (${level(A, "A")}) | Stress: ${S} (${level(S, "S")})`,
        display: [
          { label: "Depression", value: D, level: level(D, "D") },
          { label: "Anxiety", value: A, level: level(A, "A") },
          { label: "Stress", value: S, level: level(S, "S") }
        ]
      };
    }
  },

  k10: {
    code: "k10",
    name: "K10",
    tag: "General Distress",
    blurb: "The Kessler Psychological Distress Scale. A global measure of distress from questions about anxiety and depressive symptoms.",
    instruction: "These questions ask about how you have been feeling <strong>during the past 30 days</strong>.",
    options: opts(FREQ5_K10, 1),
    questions: [
      "About how often did you feel tired out for no good reason?",
      "About how often did you feel nervous?",
      "About how often did you feel so nervous that nothing could calm you down?",
      "About how often did you feel hopeless?",
      "About how often did you feel restless or fidgety?",
      "About how often did you feel so restless you could not sit still?",
      "About how often did you feel depressed?",
      "About how often did you feel that everything was an effort?",
      "About how often did you feel so sad that nothing could cheer you up?",
      "About how often did you feel worthless?"
    ],
    score(answers) {
      const total = Object.values(answers).reduce((a, v) => a + parseInt(v, 10), 0);
      let interpretation;
      if (total <= 19) interpretation = "Likely to be well. Your score suggests a low level of psychological distress.";
      else if (total <= 24) interpretation = "Likely to have a mild mental disorder. Monitoring and low-intensity support may be beneficial.";
      else if (total <= 29) interpretation = "Likely to have a moderate mental disorder. Clinical consultation is recommended.";
      else interpretation = "Likely to have a severe mental disorder. Professional psychological support is highly recommended.";
      const level = total <= 19 ? "Well" : total <= 24 ? "Mild" : total <= 29 ? "Moderate" : "Severe";
      return { score: String(total), interpretation, display: [{ label: "Total Score", value: total, level }] };
    }
  },

  pcl5: {
    code: "pcl5",
    name: "PCL-5",
    tag: "Trauma Response",
    blurb: "The PTSD Checklist. A 20-item self-report measure assessing the DSM-5 symptoms of post-traumatic stress disorder.",
    instruction: "How much have you been bothered by each problem <strong>in the past month</strong>?",
    options: opts(FREQ5_PCL, 0),
    questions: [
      "Repeated, disturbing, and unwanted memories of the stressful experience?",
      "Repeated, disturbing dreams of the stressful experience?",
      "Suddenly feeling or acting as if the stressful experience were actually happening again?",
      "Feeling very upset when something reminded you of the stressful experience?",
      "Having strong physical reactions when something reminded you of the stressful experience?",
      "Avoiding memories, thoughts, or feelings related to the stressful experience?",
      "Avoiding external reminders of the stressful experience (people, places, etc.)?",
      "Trouble remembering important parts of the stressful experience?",
      "Having strong negative beliefs about yourself, other people, or the world?",
      "Blaming yourself or someone else for the stressful experience or what happened after?",
      "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
      "Loss of interest in activities that you used to enjoy?",
      "Feeling distant or cut off from other people?",
      "Trouble experiencing positive feelings (e.g., unable to feel happiness or love)?",
      "Irritable behavior, feeling angry, or acting aggressively?",
      "Taking too many risks or doing things that could cause you harm?",
      "Being “superalert” or watchful or on guard?",
      "Feeling jumpy or easily startled?",
      "Having difficulty concentrating?",
      "Trouble falling or staying asleep?"
    ],
    score(answers) {
      const total = Object.values(answers).reduce((a, v) => a + parseInt(v, 10), 0);
      const interpretation = total < 33
        ? "Your score is below the typical clinical threshold for PTSD. However, if these symptoms cause distress, professional consultation is recommended."
        : "Your score is above the clinical threshold (33), suggestive of probable PTSD. We recommend discussing this with a professional.";
      const level = total < 33 ? "Below threshold" : "Above threshold";
      return { score: String(total), interpretation, display: [{ label: "Total Score", value: total, level }] };
    }
  }
};

// ---------- Data ----------

async function fetchResults() {
  const { data, error } = await db()
    .from("psychometric_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

async function saveResult(test, result, answers) {
  const { data, error } = await db()
    .from("psychometric_results")
    .insert({
      user_id: userId,
      test_code: test.code,
      test_name: test.name,
      score: result.score,
      interpretation: result.interpretation,
      answers
    })
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

async function deleteResult(id) {
  const { error } = await db().from("psychometric_results").delete().eq("id", id).eq("user_id", userId);
  if (error) console.error(error);
}

// ---------- Views ----------

function setActiveNav(view, testCode) {
  document.querySelectorAll("#nav-links a").forEach((a) => a.classList.remove("active"));
  const sel = testCode ? `[data-test="${testCode}"]` : `[data-view="${view}"]`;
  document.querySelector(`#nav-links a${sel}`)?.classList.add("active");
}

async function renderHub() {
  setActiveNav("hub");
  app.innerHTML = `<div class="pm-loading">Loading your assessments…</div>`;
  const results = await fetchResults();
  const latestByTest = {};
  results.forEach((r) => { if (!latestByTest[r.test_code]) latestByTest[r.test_code] = r; });

  const cards = Object.values(TESTS).map((t) => {
    const last = latestByTest[t.code];
    const lastLine = last
      ? `<p class="pm-last">Last taken ${fmtDate(last.created_at)} · Score ${escapeHtml(last.score)}</p>`
      : `<p class="pm-last">Not taken yet</p>`;
    return `
      <article class="pm-card">
        <span class="tag">${escapeHtml(t.tag)}</span>
        <h3>${escapeHtml(t.name)}</h3>
        <p>${escapeHtml(t.blurb)}</p>
        ${lastLine}
        <a href="#" class="btn-text" data-test="${t.code}">Start assessment →</a>
      </article>`;
  }).join("");

  app.innerHTML = `
    <header class="pm-header">
      <span class="tag">Private · saved to your account</span>
      <h1>My Assessment Center</h1>
      <p>Complete a validated questionnaire and your score is saved securely to your login, so you can track your "internal weather" over time. View past scores any time under <strong>My Results</strong>.</p>
    </header>
    <div class="pm-grid">${cards}</div>`;
}

function renderAssessment(testCode) {
  const test = TESTS[testCode];
  if (!test) return renderHub();
  setActiveNav(null, testCode);

  const questionsHtml = test.questions.map((q, i) => {
    const qNum = i + 1;
    const optionsHtml = test.options.map((o) => `
      <label class="pm-option">
        <input type="radio" name="q${qNum}" value="${o.value}" required>
        <span class="num">${o.value}</span>
        <span class="txt">${escapeHtml(o.label)}</span>
      </label>`).join("");
    return `
      <div class="pm-question">
        <p class="q-text"><strong>${qNum}.</strong> ${escapeHtml(q)}</p>
        <div class="pm-options">${optionsHtml}</div>
      </div>`;
  }).join("");

  app.innerHTML = `
    <header class="pm-header">
      <span class="tag">${escapeHtml(test.tag)}</span>
      <h1>${escapeHtml(test.name)}</h1>
      <p>${test.instruction}</p>
    </header>
    <form id="pm-form">
      ${questionsHtml}
      <div class="pm-actions">
        <span class="pm-error" id="pm-error" hidden>Please answer every question.</span>
        <a href="#" class="btn-text" data-view="hub">Cancel</a>
        <button type="submit" class="btn-primary">Save my results</button>
      </div>
    </form>`;

  document.getElementById("pm-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const errorEl = document.getElementById("pm-error");
    if (!form.checkValidity()) {
      errorEl.hidden = false;
      form.reportValidity();
      return;
    }
    errorEl.hidden = true;
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";

    const answers = Object.fromEntries(new FormData(form).entries());
    const result = test.score(answers);
    const saved = await saveResult(test, result, answers);
    if (!saved) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save my results";
      errorEl.textContent = "Could not save — please try again.";
      errorEl.hidden = false;
      return;
    }
    renderResult(saved);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderResult(row) {
  setActiveNav("history");
  const test = TESTS[row.test_code];
  const display = test ? test.score(row.answers || {}).display : [{ label: "Score", value: row.score, level: "" }];
  const circles = display.map((d) => `
    <div class="pm-score-item">
      <div class="pm-circle"><span>${escapeHtml(String(d.value))}</span></div>
      <span class="pm-score-label">${escapeHtml(d.label)}</span>
      ${d.level ? `<span class="pm-score-level">${escapeHtml(d.level)}</span>` : ""}
    </div>`).join("");

  app.innerHTML = `
    <header class="pm-header">
      <h1>Result saved</h1>
      <p>This result is stored to your account. Review it any time under My Results.</p>
    </header>
    <div class="pm-result-card">
      <h2>${escapeHtml(row.test_name)}</h2>
      <p class="pm-date">${fmtDate(row.created_at)}</p>
      <div class="pm-scores">${circles}</div>
      <div class="pm-interpret">
        <h3>What this means</h3>
        <p>${escapeHtml(row.interpretation)}</p>
      </div>
      <div class="pm-actions">
        <a href="#" class="btn-text" data-view="hub">Take another</a>
        <a href="#" class="btn-primary" data-view="history" style="text-decoration:none">View all my results</a>
      </div>
    </div>`;
}

async function renderHistory() {
  setActiveNav("history");
  app.innerHTML = `<div class="pm-loading">Loading your results…</div>`;
  const results = await fetchResults();

  if (!results.length) {
    app.innerHTML = `
      <header class="pm-header"><h1>My Results</h1></header>
      <div class="pm-empty">
        <p>You haven't completed any assessments yet.</p>
        <p style="margin-top:14px"><a href="#" class="btn-primary" data-view="hub" style="text-decoration:none">Start an assessment</a></p>
      </div>`;
    return;
  }

  const items = results.map((r) => `
    <div class="pm-history-item" data-id="${r.id}">
      <div>
        <h4>${escapeHtml(r.test_name)}</h4>
        <span class="meta">${fmtDate(r.created_at)}</span>
      </div>
      <span class="score-pill">${escapeHtml(r.score)}</span>
      <p class="interp">${escapeHtml(r.interpretation)}</p>
      <button class="row-del" data-del="${r.id}" title="Delete" aria-label="Delete result">×</button>
    </div>`).join("");

  app.innerHTML = `
    <header class="pm-header">
      <h1>My Results</h1>
      <p>${results.length} saved assessment${results.length === 1 ? "" : "s"}, most recent first.</p>
    </header>
    <div class="pm-history">${items}</div>`;

  app.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!confirm("Delete this saved result?")) return;
      await deleteResult(btn.dataset.del);
      renderHistory();
    });
  });
}

// ---------- Routing ----------

function route(target) {
  if (target.test) return renderAssessment(target.test);
  if (target.view === "history") return renderHistory();
  return renderHub();
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-view], [data-test]");
  if (!link) return;
  event.preventDefault();
  route({ view: link.dataset.view, test: link.dataset.test });
  document.getElementById("nav-links")?.classList.remove("active");
});

// ---------- Boot ----------

(async () => {
  const session = await window.AppAuth.ready;
  userId = session.user.id;
  renderHub();
})();
