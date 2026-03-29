import { useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, ArrowRight, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Question Data ── */

interface QuestionDef {
  id: number;
  q: string;
  options: { v: number; t: string }[];
}

const allQuestions: QuestionDef[] = [
  {
    id: 1,
    q: "Regulatory Compliance: Are you currently identifying and controlling psychosocial risks as mandated by OHS Regulations?",
    options: [
      { v: 10, t: "A) Yes; we have an active identification and control framework for all core hazards." },
      { v: 5, t: "B) We have a general wellness policy but no specific psychosocial risk register." },
      { v: 0, t: "C) No; we have not formalised our approach to psychological health yet." },
    ],
  },
  {
    id: 2,
    q: "Workload Management: How do you handle production pressure and deadlines?",
    options: [
      { v: 10, t: "A) Systemic planning with built-in buffers and crew consultation." },
      { v: 5, t: "B) Ad-hoc adjustments when pressure becomes too high." },
      { v: 0, t: "C) Crew are expected to push through to meet delivery targets." },
    ],
  },
  {
    id: 3,
    q: "Reporting Culture: How likely are crew to report bullying or harassment without fear of career consequences?",
    options: [
      { v: 10, t: "A) Very likely; we have a robust, anonymous, and trusted reporting system." },
      { v: 5, t: "B) Somewhat likely; we have policies, but reporting is rare." },
      { v: 0, t: "C) Unlikely; the industry culture of silence still prevails." },
    ],
  },
  {
    id: 4,
    q: "Leadership Capability: Have your production leaders been trained in managing psychosocial hazards?",
    options: [
      { v: 10, t: "A) Yes; all leaders have completed specific psychological safety training." },
      { v: 5, t: "B) Some leaders have general management training." },
      { v: 0, t: "C) No formal training has been provided in this area." },
    ],
  },
  {
    id: 5,
    q: "Early Detection: Do you use any data-driven tools (like sentiment analysis or pulse surveys) to monitor crew strain?",
    options: [
      { v: 10, t: "A) Yes; we use AI-assisted tools for real-time monitoring." },
      { v: 5, t: "B) We use occasional manual surveys." },
      { v: 0, t: "C) We rely on anecdotal feedback and observation." },
    ],
  },
  {
    id: 6,
    q: "Support Systems: What psychological support is available to crew during production?",
    options: [
      { v: 10, t: "A) On-set support, EAP, and specific resilience resources." },
      { v: 5, t: "B) General EAP information is provided in the call sheet." },
      { v: 0, t: "C) No specific support systems are in place." },
    ],
  },
  {
    id: 7,
    q: "Work-Life Balance: How are work hours and rest periods managed on your set?",
    options: [
      { v: 10, t: "A) Strictly managed in line with fatigue guidelines and rest requirements." },
      { v: 5, t: "B) Generally managed, but overages are common." },
      { v: 0, t: "C) Long hours are an accepted and unmanaged part of the production." },
    ],
  },
  {
    id: 8,
    q: "Psychological Safety: Is there a speak-up culture where crew can raise concerns without repercussions?",
    options: [
      { v: 10, t: "A) Yes; it is actively encouraged and modeled by leadership." },
      { v: 5, t: "B) It is stated in policy, but not always practiced." },
      { v: 0, t: "C) The culture is more hierarchical and reactive." },
    ],
  },
  {
    id: 9,
    q: "Inclusion & Diversity: Are psychosocial risks for marginalized groups specifically addressed?",
    options: [
      { v: 10, t: "A) Yes; we have specific risk controls for diverse crew members." },
      { v: 5, t: "B) We have general D&I policies." },
      { v: 0, t: "C) These risks are not specifically identified or managed." },
    ],
  },
  {
    id: 10,
    q: "Operational Resilience: How does the production handle unexpected schedule volatility?",
    options: [
      { v: 10, t: "A) With clear communication and pre-planned contingency buffers." },
      { v: 5, t: "B) By asking crew to work longer or harder to catch up." },
      { v: 0, t: "C) Reactively, often leading to increased stress and conflict." },
    ],
  },
  {
    id: 11,
    q: "Contractual Clarity: Are role expectations and entitlements (like sick leave) clearly communicated and respected?",
    options: [
      { v: 10, t: "A) Yes; they are clearly defined and crew are encouraged to use them." },
      { v: 5, t: "B) They are in the contract, but there is pressure not to use them." },
      { v: 0, t: "C) Entitlements are often ignored or discouraged to meet targets." },
    ],
  },
  {
    id: 12,
    q: "Hazard Review: How often are psychosocial risk controls reviewed and updated?",
    options: [
      { v: 10, t: "A) Regularly throughout the production based on crew feedback." },
      { v: 5, t: "B) Once at the beginning of the production." },
      { v: 0, t: "C) Only after a significant incident or complaint occurs." },
    ],
  },
  {
    id: 13,
    q: "Communication Transparency: How transparent is leadership about production changes and decisions?",
    options: [
      { v: 10, t: "A) High transparency with regular, clear updates to all crew." },
      { v: 5, t: "B) Information is shared on a need-to-know basis." },
      { v: 0, t: "C) Communication is often last-minute or unclear." },
    ],
  },
  {
    id: 14,
    q: "Emotional Demands: Is the emotional impact of content (e.g., traumatic scenes) managed for crew?",
    options: [
      { v: 10, t: "A) Yes; with pre-briefs, support during filming, and debriefs." },
      { v: 5, t: "B) We mention it if a scene is particularly difficult." },
      { v: 0, t: "C) Crew are expected to manage their own emotional reactions." },
    ],
  },
  {
    id: 15,
    q: "Board/Executive Engagement: Does senior leadership/producers take active responsibility for psychological health?",
    options: [
      { v: 10, t: "A) Yes; it is a standing agenda item and a key performance metric." },
      { v: 5, t: "B) They support it in principle but are not actively involved." },
      { v: 0, t: "C) It is seen as an HR or OHS issue, not a leadership priority." },
    ],
  },
];

/* ── Scoring helpers ── */

interface Verdict {
  level: string;
  summary: string;
  recs: string[];
  color: string;
}

function getVerdict(score: number): Verdict {
  if (score >= 120)
    return {
      level: "Defensible Maturity",
      summary: "Excellent. You have a robust safety architecture that protects both your crew and your legal standing.",
      recs: [
        "Continuous Improvement: Regularly audit your AI tools for bias and accuracy.",
        "Industry Leadership: Share your best practices as a case study for the industry.",
        "Advanced Integration: Look into long-term health tracking for returning crew members.",
      ],
      color: "text-emerald-400",
    };
  if (score >= 80)
    return {
      level: "Proactive Management",
      summary: "Good. You have strong foundations, but there are still systemic gaps that could lead to friction.",
      recs: [
        "Standardize Reporting: Ensure all crew, including contractors, are fully trained on the reporting system.",
        "Leader Coaching: Provide advanced coaching for supervisors on detecting subtle signs of burnout.",
        "Review Buffers: Re-evaluate production buffers to ensure they are realistic under high-pressure phases.",
      ],
      color: "text-blue-400",
    };
  if (score >= 40)
    return {
      level: "Reactive Compliance",
      summary: "Vulnerable. You are meeting basic requirements but remain at high risk for operational disruptions and legal challenges.",
      recs: [
        "Implement Risk Register: Create a specific psychosocial risk register for your current production.",
        "AI Sentiment Pilot: Start using pulse surveys to get real-time feedback from the crew.",
        "Policy to Practice: Move beyond wellness posters and implement concrete rest and workload controls.",
      ],
      color: "text-amber-400",
    };
  return {
    level: "Initial / At Risk",
    summary: "Critical. Your production is currently exposed to significant legal and operational risks.",
    recs: [
      "Urgent Compliance Audit: Conduct a formal psychosocial risk assessment immediately.",
      "Leadership Intervention: Brief producers on their legal obligations under the 2025 Regulations.",
      "Establish Basic Support: Set up a trusted, anonymous way for crew to report urgent safety concerns.",
    ],
    color: "text-rose-400",
  };
}

/* ── Component ── */

type Step = "survey" | "results";

export default function Audit() {
  const location = useLocation();
  const leadData = (location.state as { name?: string; email?: string }) || {};

  const [step, setStep] = useState<Step>("survey");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const progress = Math.round((Object.keys(answers).length / allQuestions.length) * 100);
  const allAnswered = Object.keys(answers).length === allQuestions.length;

  const handleSelect = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);

    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const verdict = getVerdict(total);

    // Save to Supabase
    if (leadData.name && leadData.email) {
      const { error } = await supabase.from("audit_submissions").insert({
        name: leadData.name,
        email: leadData.email,
        score: total,
        maturity_level: verdict.level,
        responses: answers as unknown as Record<string, unknown>,
      });
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
    setAnswers({});
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
            <span>{Object.keys(answers).length} / {allQuestions.length}</span>
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

        {/* Questions */}
        <div className="space-y-8">
          {allQuestions.map((q) => (
            <div key={q.id} className="space-y-3">
              <p className="font-body font-semibold text-lg text-foreground">
                {q.id}. {q.q}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.v;
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
                          onChange={() => handleSelect(q.id, opt.v)}
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

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          size="lg"
          className="w-full py-6 text-base rounded-xl"
        >
          {submitting ? "Submitting..." : "Submit for Evaluation"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  /* ── Results ── */
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-display font-bold text-foreground">Your Diagnostic Results</h2>
        <p className="text-lg font-body text-muted-foreground">{verdict.summary}</p>
      </div>

      {/* Score card */}
      <div className="bg-hero-gradient rounded-2xl p-10 text-center text-primary-foreground">
        <p className="text-sm uppercase tracking-widest font-body font-bold opacity-60 mb-2">
          Maturity Score
        </p>
        <p className={`text-7xl md:text-8xl font-display font-black ${verdict.color}`}>
          {score}
        </p>
        <p className="text-2xl font-display font-bold border-t border-primary-foreground/20 pt-4 mt-4">
          Level: {verdict.level}
        </p>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold text-foreground">Immediate Recommendations</h3>
        <div className="grid gap-4">
          {verdict.recs.map((rec) => (
            <div key={rec} className="bg-card border border-border p-5 rounded-xl flex items-start">
              <CheckCircle2 className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" />
              <span className="font-body text-foreground">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-accent rounded-2xl p-8 text-center space-y-4 text-accent-foreground">
        <h3 className="text-2xl font-display font-bold">Ready to achieve Defensible Maturity?</h3>
        <p className="font-body opacity-90">
          Schedule a consultation with Kush Mohun to transform these insights into a production-ready safety architecture.
        </p>
        <Button variant="hero" size="lg" asChild className="rounded-xl px-10 py-6 text-base">
          <a href="mailto:kzmja@hotmail.com">
            <Mail className="mr-2 h-5 w-5" />
            Book Your Strategy Session
          </a>
        </Button>
      </div>

      {/* Retake */}
      <div className="text-center">
        <Button variant="outline" onClick={resetAll} className="rounded-xl">
          <RotateCcw className="mr-2 h-4 w-4" />
          Retake Diagnostic
        </Button>
      </div>
    </div>
  );
}
