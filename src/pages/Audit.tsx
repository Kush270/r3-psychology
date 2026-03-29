import { useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, ArrowRight, Mail, RotateCcw, Scale, Zap, DollarSign, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Scored Questions (Q1–Q10, 0/5/10 each, max 100) ── */

interface ScoredQuestion {
  id: number;
  q: string;
  options: { v: number; t: string }[];
}

const scoredQuestions: ScoredQuestion[] = [
  {
    id: 1,
    q: "Regulatory Compliance: Are you currently identifying and controlling psychosocial risks as mandated by OHS Regulations?",
    options: [
      { v: 10, t: "A) Yes; we have an active identification and control framework for all core hazards." },
      { v: 5, t: 'B) We have a general "wellness" policy but no specific psychosocial risk register.' },
      { v: 0, t: "C) No; we are currently unaware of our specific statutory duties under the 2025 Regulations." },
    ],
  },
  {
    id: 2,
    q: "Risk Documentation: Do you have a formal system for documenting risks like bullying, harassment, or fatigue to prevent grievances?",
    options: [
      { v: 10, t: 'A) Yes; we maintain a "succinct chronology of documentary evidence" for all hazard identification.' },
      { v: 5, t: "B) We have high-level policy manuals but no documented record of specific hazard reviews." },
      { v: 0, t: "C) No; we do not keep written records of psychosocial hazards or control implementation." },
    ],
  },
  {
    id: 3,
    q: "Workflow Integration: Are you integrating psychosocial safety measures directly into existing workflows?",
    options: [
      { v: 10, t: "A) Yes; hazards are integrated into operational tools like call sheets and daily safety briefings." },
      { v: 5, t: "B) Safety is discussed only during periodic HR updates or annual performance reviews." },
      { v: 0, t: "C) No; psychological safety is treated as a separate initiative unrelated to daily work." },
    ],
  },
  {
    id: 4,
    q: 'Early Hazard Identification: Have you implemented a process for early identification to reduce conflicts or "walk-offs"?',
    options: [
      { v: 10, t: 'A) Yes; we use "Work-as-Done" mapping to identify systemic friction before injuries occur.' },
      { v: 5, t: "B) We investigate hazards only after a formal complaint or injury report is filed." },
      { v: 0, t: "C) No; we handle these incidents as isolated interpersonal personality clashes." },
    ],
  },
  {
    id: 5,
    q: "Burnout Prevention: Do you have active measures in place to prevent team burnout during high-intensity periods?",
    options: [
      { v: 10, t: 'A) Yes; we use Level 2 Redesign controls like "Surge-Mode" rules to adjust task-loads.' },
      { v: 5, t: "B) We rely on Level 3 Administrative controls like resilience workshops and EAP access." },
      { v: 0, t: 'C) No; we expect a "heroic" culture where staff absorb extra work without system changes.' },
    ],
  },
  {
    id: 6,
    q: 'Cost Tracking: Are you tracking the "invisible" costs of neglect, such as the financial impact of high turnover?',
    options: [
      { v: 10, t: "A) Yes; the financial impact of absenteeism, turnover, and claims is quantified for leadership." },
      { v: 5, t: "B) We track high-level HR metrics but do not link them to psychosocial hazard costs." },
      { v: 0, t: "C) No; we do not track the economic repercussions of psychological safety failures." },
    ],
  },
  {
    id: 7,
    q: "Insurance Strategy: Can you demonstrate proactive risk management to insurers to argue for lower premiums?",
    options: [
      { v: 10, t: "A) Yes; we use quantified safety data to prove hazard reduction to our insurers." },
      { v: 5, t: "B) We report hazard data to insurers only reactively following a significant claim." },
      { v: 0, t: "C) No; we have no strategy to link proactive safety to insurance cost reduction." },
    ],
  },
  {
    id: 8,
    q: "Talent Retention: Does your production leverage its reputation for safety to aid in talent retention?",
    options: [
      { v: 10, t: "A) Yes; our Psychosocial Safety Climate (PSC) is a documented key for attracting high-quality staff." },
      { v: 5, t: "B) We mention safety in job previews but lack data to prove a healthy culture." },
      { v: 0, t: 'C) No; high turnover is accepted as an unavoidable "industry standard".' },
    ],
  },
  {
    id: 9,
    q: "Stakeholder Assurance: Have you established a status to present to investors and broadcasters to minimize risk?",
    options: [
      { v: 10, t: 'A) Yes; we provide "Defensible Maturity" scores to Boards to confirm governance compliance.' },
      { v: 5, t: "B) We provide safety updates to stakeholders only if a specific incident is queried." },
      { v: 0, t: "C) No; stakeholders are not currently updated on the organization\u2019s psychosocial risk profile." },
    ],
  },
  {
    id: 10,
    q: 'Proactive Sustainability: Has your company moved away from "firefighting" toward long-term people sustainability?',
    options: [
      { v: 10, t: "A) Yes; our strategy focuses on Work Redesign to prevent harm through system architecture." },
      { v: 5, t: 'B) We are still in a "reactive" mode, fixing systems only after a breakdown occurs.' },
      { v: 0, t: "C) No; individual employees remain responsible for their own coping and resilience." },
    ],
  },
];

/* ── Context Questions (Q11–Q14, not scored) ── */

interface ContextQuestion {
  id: number;
  q: string;
  options: string[];
}

const contextQuestions: ContextQuestion[] = [
  {
    id: 11,
    q: "Which best describes your current production environment?",
    options: [
      "Independent feature or short film.",
      "Mid-sized commercial or TV production.",
      "Major studio/High-End TV (HETV) production.",
      "Production service company/Executive leadership.",
    ],
  },
  {
    id: 12,
    q: "Which describes your most critical objective for the next 90 days?",
    options: [
      "Ensuring 100% regulatory compliance with new OHS laws.",
      'Guaranteeing on-time delivery by reducing mid-shoot disruptions or "walk-offs".',
      'Protecting the budget by lowering "invisible" costs like turnover or insurance premiums.',
      'Achieving a "Psychosocial Safety Assessed" status to attract investors or broadcasters.',
    ],
  },
  {
    id: 13,
    q: "What is the biggest obstacle currently preventing your set from being fully safety-compliant and efficient?",
    options: [
      'A "reactive" or "firefighting" culture that ignores risks until they become crises.',
      "Lack of a formal system for documenting risks like chronic fatigue or harassment.",
      'Interpersonal conflicts that lead to last-minute "people issues".',
      'Budget constraints that make "soft" initiatives feel like a luxury rather than a necessity.',
    ],
  },
  {
    id: 14,
    q: "Which approach to implementing these safety measures would suit your production best?",
    options: [
      'Self-guided: "I want a toolkit or software to do it myself"',
      'Training: "I want workshops for my HODs and crew"',
      'Consulting: "I want one-to-one expert guidance for my production"',
      'Fully Managed: "I want a \'done for you\' service to handle all assessments and documentation"',
    ],
  },
];

/* ── Scoring helpers ── */

interface Verdict {
  level: string;
  summary: string;
  bgClass: string;
}

function getVerdict(score: number): Verdict {
  if (score >= 80)
    return {
      level: "Safe Architecture",
      summary: "Congratulations, you have strong foundations. You are building a defensible safety architecture that protects both staff and executives.",
      bgClass: "bg-emerald-500",
    };
  if (score >= 50)
    return {
      level: "Process Friction",
      summary: "You have good intentions but remain vulnerable. System redesign is needed to move from a Compliance Gap to defensible compliance.",
      bgClass: "bg-amber-500",
    };
  return {
    level: "Statutory Liability",
    summary: "Warning: You have significant regulatory exposure. Immediate systemic intervention is required to avoid potential prosecution.",
    bgClass: "bg-rose-500",
  };
}

function getLegalInsight(q1: number): string {
  return q1 === 10
    ? "Your documentation is on track with OHS regulations, providing a solid legal defense framework."
    : "You lack a specific psychosocial risk register. Without this documentation, you are highly exposed to statutory breaches under the 2025 Regulations.";
}

function getOpsInsight(q4: number): string {
  return q4 === 10
    ? "Your early identification processes are successfully preventing systemic friction from turning into costly 'walk-offs'."
    : "Relying on formal complaints rather than proactive mapping is likely causing hidden operational friction, leading to interpersonal conflicts and lost time.";
}

function getFinancialInsight(q7: number): string {
  return q7 === 10
    ? "You are successfully leveraging your safety data to negotiate better premiums and appeal to risk-averse stakeholders."
    : "By not tracking the 'invisible' costs of psychosocial hazards, you are missing opportunities to reduce insurance premiums and prove ROI to broadcasters/investors.";
}

function getNextStep(q11: string, q14: string): string {
  if (q14.startsWith("Fully Managed") || (q11.includes("Major studio") && !q14.startsWith("Self-guided"))) {
    return "Let\u2019s schedule a One-to-One Meeting to discuss a full psychosocial safety audit tailored to your production.";
  }
  if (q14.startsWith("Training") || q14.startsWith("Consulting")) {
    return "Join our upcoming Group Presentation / Webinar on how to seamlessly integrate safety briefings into your daily call sheets.";
  }
  return "Check out our free comprehensive video guide and toolkit to help move your set from a \u2018reactive\u2019 mindset to proactive risk management.";
}

/* ── Component ── */

type Step = "survey" | "results";

export default function Audit() {
  const location = useLocation();
  const leadData = (location.state as { name?: string; email?: string }) || {};

  const [step, setStep] = useState<Step>("survey");
  const [scoredAnswers, setScoredAnswers] = useState<Record<number, number>>({});
  const [contextAnswers, setContextAnswers] = useState<Record<number, string>>({});
  const [freeText, setFreeText] = useState("");
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const totalQuestions = scoredQuestions.length + contextQuestions.length + 1; // +1 for Q15
  const answeredCount =
    Object.keys(scoredAnswers).length + Object.keys(contextAnswers).length + (freeText.trim() ? 1 : 0);
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const scoredAllAnswered = Object.keys(scoredAnswers).length === scoredQuestions.length;
  const contextAllAnswered = Object.keys(contextAnswers).length === contextQuestions.length;
  const allAnswered = scoredAllAnswered && contextAllAnswered;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);

    const total = Object.values(scoredAnswers).reduce((a, b) => a + b, 0);
    const verdict = getVerdict(total);

    const allResponses = {
      scored: scoredAnswers,
      context: contextAnswers,
      freeText: freeText.trim() || null,
    };

    if (leadData.name && leadData.email) {
      const { error } = await supabase.from("audit_submissions").insert([{
        name: leadData.name,
        email: leadData.email,
        score: total,
        maturity_level: verdict.level,
        responses: allResponses as unknown as import("@/integrations/supabase/types").Json,
      }]);
      if (error) {
        console.error("Failed to save audit:", error);
        toast.error("Could not save your results. Please try again.");
      }
    }

    setScore(total);
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSubmitting(false);
  };

  const resetAll = () => {
    setScoredAnswers({});
    setContextAnswers({});
    setFreeText("");
    setScore(0);
    setStep("survey");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verdict = getVerdict(score);

  /* ── Survey ── */
  if (step === "survey") {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Psychosocial Safety Maturity Diagnostic
          </h1>
          <p className="text-muted-foreground font-body">
            Identify systemic friction points and quantify your current risk profile.
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm font-body text-muted-foreground">
            <span>Progress</span>
            <span>{answeredCount} / {totalQuestions}</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Intro */}
        <div className="bg-primary/5 border-l-4 border-accent p-5 rounded-r-lg text-sm font-body text-foreground leading-relaxed">
          To achieve <strong>&ldquo;Defensible Maturity&rdquo;</strong> under the Occupational Health and Safety (Psychosocial Health) Regulations 2025, an organization must move from reactive wellness toward systemic safety architecture. Use this 15-question diagnostic to identify your current standing.
        </div>

        {/* Part 1 */}
        <h2 className="text-xl font-display font-bold text-foreground border-b border-border pb-2">
          Part 1: The Defensible Maturity Index
        </h2>

        <div className="space-y-8">
          {scoredQuestions.map((q) => (
            <div key={q.id} className="space-y-3">
              <p className="font-body font-semibold text-lg text-foreground">
                {q.id}. {q.q}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = scoredAnswers[q.id] === opt.v;
                  return (
                    <label
                      key={`${q.id}-${opt.v}`}
                      className={`block w-full p-4 border rounded-xl cursor-pointer transition-all font-body text-sm ${
                        selected
                          ? "bg-accent/10 border-accent shadow-sm"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          checked={selected}
                          onChange={() => setScoredAnswers((prev) => ({ ...prev, [q.id]: opt.v }))}
                          className="mt-1 mr-3 h-4 w-4 accent-[hsl(var(--accent))]"
                        />
                        <span className="text-foreground">{opt.t}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Part 2 */}
        <h2 className="text-xl font-display font-bold text-foreground border-b border-border pb-2 pt-4">
          Part 2: Production Context
        </h2>

        <div className="space-y-8">
          {contextQuestions.map((q) => (
            <div key={q.id} className="space-y-3">
              <p className="font-body font-semibold text-lg text-foreground">
                {q.id}. {q.q}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = contextAnswers[q.id] === opt;
                  return (
                    <label
                      key={`${q.id}-${opt}`}
                      className={`block w-full p-4 border rounded-xl cursor-pointer transition-all font-body text-sm ${
                        selected
                          ? "bg-accent/10 border-accent shadow-sm"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          checked={selected}
                          onChange={() => setContextAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className="mt-1 mr-3 h-4 w-4 accent-[hsl(var(--accent))]"
                        />
                        <span className="text-foreground">{opt}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Q15 Free text */}
          <div className="space-y-3">
            <p className="font-body font-semibold text-lg text-foreground">
              15. Is there anything else we should know about your current production or specific safety concerns?
            </p>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Type your answer here... (optional)"
              className="rounded-xl min-h-[100px]"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          size="lg"
          className="w-full py-6 text-base rounded-xl"
        >
          {submitting ? "Submitting..." : "Submit & Get Your Results"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  /* ── Results ── */
  const q1Val = scoredAnswers[1] ?? 0;
  const q4Val = scoredAnswers[4] ?? 0;
  const q7Val = scoredAnswers[7] ?? 0;
  const q11Val = contextAnswers[11] ?? "";
  const q14Val = contextAnswers[14] ?? "";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-display font-bold text-foreground">Your Diagnostic Results</h2>
        <p className="text-lg font-body text-muted-foreground">
          Based on your responses, here is your safety profile analysis.
        </p>
      </div>

      {/* Score card */}
      <div className={`${verdict.bgClass} rounded-2xl p-10 text-center text-white shadow-lg`}>
        <p className="text-sm uppercase tracking-widest font-body font-bold opacity-60 mb-2">
          Defensible Maturity Index
        </p>
        <p className="text-7xl md:text-8xl font-display font-black">
          {score}<span className="text-3xl font-medium opacity-75">/100</span>
        </p>
        <div className="border-t border-white/20 pt-4 mt-4">
          <p className="text-sm uppercase tracking-widest font-body font-bold opacity-60 mb-1">Verdict</p>
          <p className="text-2xl font-display font-bold">{verdict.level}</p>
          <p className="font-body opacity-90 mt-2">{verdict.summary}</p>
        </div>
      </div>

      {/* Three Insights */}
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold text-foreground">The Three Insights</h3>
        <div className="grid gap-4">
          <div className="bg-card border border-border p-5 rounded-xl flex items-start">
            <Scale className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-body font-semibold text-foreground">1. Legal/Regulatory Standing</p>
              <p className="font-body text-muted-foreground mt-1">{getLegalInsight(q1Val)}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-5 rounded-xl flex items-start">
            <Zap className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-body font-semibold text-foreground">2. Operational Efficiency</p>
              <p className="font-body text-muted-foreground mt-1">{getOpsInsight(q4Val)}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-5 rounded-xl flex items-start">
            <DollarSign className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-body font-semibold text-foreground">3. Financial/Stakeholder ROI</p>
              <p className="font-body text-muted-foreground mt-1">{getFinancialInsight(q7Val)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Step */}
      <div className="bg-accent rounded-2xl p-8 text-center space-y-4 text-accent-foreground">
        <h3 className="text-2xl font-display font-bold">Your Recommended Next Step</h3>
        <p className="font-body opacity-90">{getNextStep(q11Val, q14Val)}</p>
        <Button variant="hero" size="lg" asChild className="rounded-xl px-10 py-6 text-base">
          <a href="mailto:kzmja@hotmail.com">
            <Mail className="mr-2 h-5 w-5" />
            Claim Your Next Step
          </a>
        </Button>
      </div>

      {/* Contact */}
      <div className="text-center space-y-4">
        <p className="font-body font-semibold text-foreground">Need direct assistance?</p>
        <div className="flex items-center justify-center gap-6">
          <a href="mailto:kzmja@hotmail.com" className="text-accent hover:underline flex items-center font-body">
            <Mail className="h-5 w-5 mr-1" /> Email Us
          </a>
          <a href="https://www.linkedin.com/in/kush270" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center font-body">
            <Linkedin className="h-5 w-5 mr-1" /> LinkedIn
          </a>
        </div>
        <Button variant="outline" onClick={resetAll} className="rounded-xl">
          <RotateCcw className="mr-2 h-4 w-4" />
          Retake Diagnostic
        </Button>
      </div>
    </div>
  );
}
