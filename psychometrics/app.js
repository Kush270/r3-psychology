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

// ---------- Schema assessment (YSQ-R, user-provided item set) ----------

const SCHEMA_SCALE = [
  { value: 1, label: "Completely untrue of me" },
  { value: 2, label: "Mostly untrue of me" },
  { value: 3, label: "Slightly more true than untrue" },
  { value: 4, label: "Moderately true of me" },
  { value: 5, label: "Mostly true of me" },
  { value: 6, label: "Describes me perfectly" }
];

const SCHEMA_GROUPS = [
  ["Emotional Deprivation", [
    "I haven't gotten enough love and attention.",
    "For the most part, I haven't had someone to depend on for advice and emotional support.",
    "For much of my life, I haven't had someone who wanted to get close to me and spend a lot of time with me.",
    "For much of my life, I haven't felt that I am special to someone.",
    "I have rarely had a strong person to give me sound advice or direction when I'm not sure what to do."
  ]],
  ["Abandonment", [
    "I worry that people I feel close to will leave me or abandon me.",
    "I don't feel that important relationships will last; I expect them to end.",
    "I feel addicted to partners who can't be there for me in a committed way.",
    "I become upset when someone leaves me alone, even for a short period of time.",
    "I can't let myself get very close to other people, because I can't be sure they'll always be there.",
    "The people close to me have been very unpredictable: one moment they're available and nice to me; the next, they're angry, upset, self-absorbed, fighting, etc.",
    "I need other people so much that I worry about losing them.",
    "I can't be myself or express what I really feel, or people will leave me."
  ]],
  ["Mistrust", [
    "I feel that I cannot let my guard down in the presence of other people, or else they will intentionally hurt me.",
    "It is only a matter of time before someone betrays me.",
    "I have a great deal of difficulty trusting people.",
    "I set up \"tests\" for other people, to see if they are telling me the truth and are well-intentioned.",
    "I subscribe to the belief: \"Control or be controlled.\""
  ]],
  ["Social Isolation", [
    "I'm fundamentally different from other people.",
    "I don't belong; I'm a loner.",
    "I always feel on the outside of groups.",
    "No one really understands me.",
    "I sometimes feel as if I'm an alien."
  ]],
  ["Defectiveness", [
    "No one I desire would want to stay close to me if he/she knew the real me.",
    "I am inherently flawed and defective.",
    "I feel that I'm not lovable.",
    "I am too unacceptable in very basic ways to reveal myself to other people.",
    "When people like me, I feel I am fooling them.",
    "I cannot understand how anyone could love me."
  ]],
  ["Failure", [
    "Almost nothing I do at work (or school) is as good as other people can do.",
    "Most other people are more capable than I am in areas of work (or school) and achievement.",
    "I'm a failure.",
    "I'm not as talented as most people are at their work (or at school).",
    "I often feel embarrassed around other people, because I don't measure up to them in terms of my accomplishments.",
    "I often compare my accomplishments with others and feel that they are much more successful."
  ]],
  ["Dependence / Incompetence", [
    "I do not feel capable of getting by on my own in everyday life.",
    "I believe that other people can take care of me better than I can take care of myself.",
    "I have trouble tackling new tasks outside of work unless I have someone to guide me.",
    "I screw up everything I try, even outside of work (or school).",
    "If I trust my own judgment in everyday situations, I'll make the wrong decision.",
    "I feel that I need someone I can rely on to give me advice about practical issues.",
    "I feel more like a child than an adult when it comes to handling everyday responsibilities.",
    "I find the responsibilities of everyday life overwhelming."
  ]],
  ["Vulnerability to Harm", [
    "I feel that a disaster (natural, criminal, financial, or medical) could strike at any moment.",
    "I worry about being attacked.",
    "I take great precautions to avoid getting sick or hurt.",
    "I worry that I'm developing a serious illness, even though nothing serious has been diagnosed by a physician.",
    "I worry a lot about the bad things happening in the world: crime, pollution, etc.",
    "I feel that the world is a dangerous place."
  ]],
  ["Enmeshment", [
    "My parent(s) and I tend to be overinvolved in each other's lives and problems.",
    "It is very difficult for my parent(s) and me to keep intimate details from each other, without feeling betrayed or guilty.",
    "My parent(s) and I must speak to each other almost every day, or else one of us feels guilty, hurt, disappointed, or alone.",
    "I often feel that I do not have a separate identity from my parents or partner.",
    "It is very difficult for me to maintain any distance from the people I am intimate with; I have trouble keeping any separate sense of myself.",
    "I often feel that I have no privacy when it comes to my parent(s) or partner.",
    "I feel that my parent(s) are, or would be, very hurt about my living on my own, away from them."
  ]],
  ["Subjugation", [
    "I believe that if I do what I want, I'm only asking for trouble.",
    "In relationships, I let the other person have the upper hand.",
    "I've always let others make choices for me, so I really don't know what I want for myself.",
    "I worry a lot about pleasing other people, so they won't reject me.",
    "I will go to much greater lengths than most people to avoid confrontations."
  ]],
  ["Self-Sacrifice", [
    "I give more to other people than I get back in return.",
    "I'm the one who usually ends up taking care of the people I'm close to.",
    "No matter how busy I am, I can always find time for others.",
    "I've always been the one who listens to everyone else's problems.",
    "Other people see me as doing too much for others and not enough for myself.",
    "No matter how much I give; I feel it is never enough."
  ]],
  ["Fear of Losing Control", [
    "I worry about losing control of my actions.",
    "I worry that I might seriously harm someone physically or emotionally if my anger gets out of control.",
    "I feel that I must control my emotions and impulses, or something bad is likely to happen.",
    "A lot of anger and resentment build up inside of me that I don't express."
  ]],
  ["Emotional Constriction", [
    "I am too self-conscious to show positive feelings to others (e.g., affection, showing I care).",
    "I find it embarrassing to express my feelings to others.",
    "I find it hard to be warm and spontaneous.",
    "I control myself so much that people think I am unemotional.",
    "People see me as uptight emotionally."
  ]],
  ["Unrelenting Standards", [
    "I must be the best at most of what I do; I can't accept second best.",
    "I strive to keep almost everything in perfect order.",
    "I have so much to accomplish that there is almost no time to really relax.",
    "I must meet all my responsibilities.",
    "I often sacrifice pleasure and happiness to meet my own standards.",
    "I can't let myself off the hook easily or make excuses for my mistakes.",
    "I always must be Number One, in terms of my performance."
  ]],
  ["Entitlement", [
    "I have a lot of trouble accepting \"no\" for an answer when I want something from other people.",
    "I hate to be constrained or kept from doing what I want.",
    "I feel that I shouldn't have to follow the normal rules and conventions other people do.",
    "I often find that I am so involved in my own priorities that I don't have time to give to friends or family.",
    "People often tell me I am very controlling about the ways things are done.",
    "I can't tolerate other people telling me what to do."
  ]],
  ["Insufficient Self-Control", [
    "I can't seem to discipline myself to complete routine or boring tasks.",
    "Often I allow myself to carry through on impulses and express emotions that get me into trouble or hurt other people.",
    "I get bored very easily.",
    "When tasks become difficult, I usually cannot persevere and complete them.",
    "I can't force myself to do things I don't enjoy, even when I know it's for my own good.",
    "I have rarely been able to stick to my resolutions.",
    "I often do things impulsively that I later regret."
  ]],
  ["Approval Seeking", [
    "It is important to me to be liked by almost everyone I know.",
    "I change myself depending on the people I'm with, so they'll like me more.",
    "My self-esteem is based mostly on how other people view me.",
    "Even if I don't like someone, I still want him or her to like me.",
    "Unless I get a lot of attention from others, I feel less important."
  ]],
  ["Negativity", [
    "You can't be too careful; something will almost always go wrong.",
    "I worry that a wrong decision could lead to disaster.",
    "I often obsess over minor decisions, because the consequences of making a mistake seem so serious.",
    "I feel better assuming things will not work out for me, so that I don't feel disappointed if things go wrong.",
    "I tend to be pessimistic.",
    "If people get too enthusiastic about something, I become uncomfortable and feel like warning them of what could go wrong."
  ]],
  ["Punitiveness (Self)", [
    "If I make a mistake, I deserve to be punished.",
    "There is no excuse if I make mistake.",
    "If I don't do the job, I should suffer the consequences.",
    "It doesn't matter why I make a mistake; I should pay the price when I do something wrong.",
    "I'm a bad person who deserves to be punished."
  ]],
  ["Punitiveness (Other)", [
    "People who don't \"pull their own weight\" should get punished in some way.",
    "Most of the time, I don't accept the excuses other people make. They're just not willing to accept responsibility and pay the consequences.",
    "I hold grudges, even after someone has apologised.",
    "I get angry when people make excuses for themselves or blame other people for their problems."
  ]]
];

const SCHEMA_DESC = {
  "Emotional Deprivation": "The expectation that your need for emotional support, empathy, or guidance won't be adequately met by others.",
  "Abandonment": "The sense that people close to you are unstable or unreliable and will ultimately leave.",
  "Mistrust": "The expectation that others will hurt, abuse, or take advantage of you.",
  "Social Isolation": "The feeling of being fundamentally different from, or not belonging with, other people.",
  "Defectiveness": "The belief that you are inwardly flawed, unlovable, or unworthy.",
  "Failure": "The belief that you are, or will inevitably become, inadequate relative to peers in achievement.",
  "Dependence / Incompetence": "The belief that you can't handle everyday responsibilities competently without a lot of help.",
  "Vulnerability to Harm": "An exaggerated fear that catastrophe could strike at any moment and can't be prevented.",
  "Enmeshment": "Excessive emotional closeness with others at the cost of a separate identity.",
  "Subjugation": "Surrendering your own needs and choices to avoid conflict, anger, or abandonment.",
  "Self-Sacrifice": "Over-focusing on meeting others' needs at the expense of your own.",
  "Fear of Losing Control": "A fear of losing control over your actions, impulses, or emotions.",
  "Emotional Constriction": "Inhibiting spontaneous feeling and expression to avoid disapproval or shame.",
  "Unrelenting Standards": "The drive to meet very high internal standards, often at the cost of health or ease.",
  "Entitlement": "The belief that you're special and shouldn't be bound by the usual rules or limits.",
  "Insufficient Self-Control": "Difficulty tolerating frustration or restraining impulses to reach your goals.",
  "Approval Seeking": "Over-relying on recognition or approval from others for your sense of worth.",
  "Negativity": "A persistent focus on the negative while minimising or discounting the positive.",
  "Punitiveness (Self)": "The belief that mistakes — especially your own — deserve harsh punishment.",
  "Punitiveness (Other)": "The belief that others should be harshly punished for their mistakes."
};

const SCHEMA_ORDER = SCHEMA_GROUPS.map((g) => g[0]);
const SCHEMA_ITEMS = SCHEMA_GROUPS.flatMap(([schema, questions]) => questions.map((text) => ({ schema, text })));

TESTS.schema = {
  code: "schema",
  name: "Schema (YSQ-R)",
  tag: "Early Maladaptive Schemas",
  blurb: "The Young Schema Questionnaire. 116 items mapping 20 early maladaptive schemas — long-standing self-defeating life patterns.",
  instruction: "Rate how well each statement describes you, based on how you have <strong>generally felt over your life</strong>. Go with your first reaction.",
  note: "This is a longer assessment (116 items). Please answer every item — your schema profile is saved to your account when you finish.",
  options: SCHEMA_SCALE,
  questions: SCHEMA_ITEMS.map((it) => it.text),
  score(answers) {
    const sums = {}, counts = {};
    SCHEMA_ORDER.forEach((s) => { sums[s] = 0; counts[s] = 0; });
    Object.entries(answers).forEach(([key, value]) => {
      const item = SCHEMA_ITEMS[parseInt(key.replace("q", ""), 10) - 1];
      if (!item) return;
      sums[item.schema] += parseInt(value, 10);
      counts[item.schema] += 1;
    });
    const ranked = SCHEMA_ORDER
      .map((s) => ({ label: s, value: counts[s] ? Math.round((((sums[s] / counts[s]) - 1) / 5) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
    const top = ranked.slice(0, 3);
    return {
      score: `Top: ${top[0].label} (${top[0].value})`,
      interpretation: `Highest schemas: ${top.map((t) => `${t.label} ${t.value}`).join(", ")}. Scores range 0–100; higher means a more active schema. This is an educational screen, not a diagnosis.`,
      ranked,
      display: ranked
    };
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
      ${test.note ? `<p class="pm-note">${escapeHtml(test.note)}</p>` : ""}
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
  if (row.test_code === "schema") return renderSchemaResult(row);
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

function renderSchemaResult(row) {
  setActiveNav("history");
  const { ranked } = TESTS.schema.score(row.answers || {});
  const bars = ranked.map((r) => `
    <div class="pm-bar-row${r.value >= 50 ? " high" : ""}">
      <span class="pm-bar-label">${escapeHtml(r.label)}</span>
      <span class="pm-bar-track"><i style="width:${r.value}%"></i></span>
      <span class="pm-bar-val">${r.value}</span>
    </div>`).join("");
  const top = ranked.filter((r) => r.value > 0).slice(0, 3);
  const topDesc = top.map((r) => `
    <div class="pm-top-schema">
      <h4>${escapeHtml(r.label)} · ${r.value}</h4>
      <p>${escapeHtml(SCHEMA_DESC[r.label] || "")}</p>
    </div>`).join("");

  app.innerHTML = `
    <header class="pm-header">
      <h1>Result saved</h1>
      <p>Your schema profile is stored to your account. Review it any time under My Results.</p>
    </header>
    <div class="pm-result-card pm-schema-result">
      <h2>${escapeHtml(row.test_name)}</h2>
      <p class="pm-date">${fmtDate(row.created_at)}</p>
      <div class="pm-profile">${bars}</div>
      <div class="pm-interpret">
        <h3>Your strongest schemas</h3>
        ${topDesc || "<p>No pronounced schemas — all scores are low.</p>"}
      </div>
      <p class="pm-disclaimer">Scores range 0–100; higher means the schema is more active for you. This is an educational screening tool, not a clinical diagnosis.</p>
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
