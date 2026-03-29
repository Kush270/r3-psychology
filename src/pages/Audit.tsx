import { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Scale,
  Briefcase,
  DollarSign,
  Mail,
  Linkedin,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Step = 'welcome' | 'survey' | 'results';

interface ScoredQuestion {
  id: number;
  text: string;
  options: { value: 'A' | 'B' | 'C'; label: string; points: number }[];
}

interface ProfileQuestion {
  id: number;
  text: string;
  options: { value: string; label: string }[];
}

const scoredQuestions: ScoredQuestion[] = [
  {
    id: 1,
    text: "Regulatory Compliance: Are you currently identifying and controlling psychosocial risks as mandated by OHS Regulations?",
    options: [
      { value: 'A', label: 'Yes; we have an active identification and control framework for all core hazards.', points: 10 },
      { value: 'B', label: 'We have a general "wellness" policy but no specific psychosocial risk register.', points: 5 },
      { value: 'C', label: 'No; we are currently unaware of our specific statutory duties under the 2025 Regulations.', points: 0 },
    ],
  },
  {
    id: 2,
    text: "Risk Documentation: Do you have a formal system for documenting risks like bullying, harassment, or fatigue to prevent grievances?",
    options: [
      { value: 'A', label: 'Yes; we maintain a "succinct chronology of documentary evidence" for all hazard identification.', points: 10 },
      { value: 'B', label: 'We have high-level policy manuals but no documented record of specific hazard reviews.', points: 5 },
      { value: 'C', label: 'No; we do not keep written records of psychosocial hazards or control implementation.', points: 0 },
    ],
  },
  {
    id: 3,
    text: "Workflow Integration: Are you integrating psychosocial safety measures directly into existing workflows?",
    options: [
      { value: 'A', label: 'Yes; hazards are integrated into operational tools like call sheets and daily safety briefings.', points: 10 },
      { value: 'B', label: 'Safety is discussed only during periodic HR updates or annual performance reviews.', points: 5 },
      { value: 'C', label: 'No; psychological safety is treated as a separate initiative unrelated to daily work.', points: 0 },
    ],
  },
  {
    id: 4,
    text: "Early Hazard Identification: Have you implemented a process for early identification to reduce conflicts or "walk-offs"?",
    options: [
      { value: 'A', label: 'Yes; we use "Work-as-Done" mapping to identify systemic friction before injuries occur.', points: 10 },
      { value: 'B', label: 'We investigate hazards only after a formal complaint or injury report is filed.', points: 5 },
      { value: 'C', label: 'No; we handle these incidents as isolated interpersonal personality clashes.', points: 0 },
    ],
  },
  {
    id: 5,
    text: "Burnout Prevention: Do you have active measures in place to prevent team burnout during high-intensity periods?",
    options: [
      { value: 'A', label: 'Yes; we use Level 2 Redesign controls like "Surge-Mode" rules to adjust task-loads.', points: 10 },
      { value: 'B', label: 'We rely on Level 3 Administrative controls like resilience workshops and EAP access.', points: 5 },
      { value: 'C', label: 'No; we expect a "heroic" culture where staff absorb extra work without system changes.', points: 0 },
    ],
  },
  {
    id: 6,
    text: "Cost Tracking: Are you tracking the "invisible" costs of neglect, such as the financial impact of high turnover?",
    options: [
      { value: 'A', label: 'Yes; the financial impact of absenteeism, turnover, and claims is quantified for leadership.', points: 10 },
      { value: 'B', label: 'We track high-level HR metrics but do not link them to psychosocial hazard costs.', points: 5 },
      { value: 'C', label: 'No; we do not track the economic repercussions of psychological safety failures.', points: 0 },
    ],
  },
  {
    id: 7,
    text: "Insurance Strategy: Can you demonstrate proactive risk management to insurers to argue for lower premiums?",
    options: [
      { value: 'A', label: 'Yes; we use quantified safety data to prove hazard reduction to our insurers.', points: 10 },
      { value: 'B', label: 'We report hazard data to insurers only reactively following a significant claim.', points: 5 },
      { value: 'C', label: 'No; we have no strategy to link proactive safety to insurance cost reduction.', points: 0 },
    ],
  },
  {
    id: 8,
    text: "Talent Retention: Does your production leverage its reputation for safety to aid in talent retention?",
    options: [
      { value: 'A', label: 'Yes; our Psychosocial Safety Climate (PSC) is a documented key for attracting high-quality staff.', points: 10 },
      { value: 'B', label: 'We mention safety in job previews but lack data to prove a healthy culture.', points: 5 },
      { value: 'C', label: 'No; high turnover is accepted as an unavoidable "industry standard".', points: 0 },
    ],
  },
  {
    id: 9,
    text: "Stakeholder Assurance: Have you established a status to present to investors and broadcasters to minimize risk?",
    options: [
      { value: 'A', label: 'Yes; we provide "Defensible Maturity" scores to Boards to confirm governance compliance.', points: 10 },
      { value: 'B', label: 'We provide safety updates to stakeholders only if a specific incident is queried.', points: 5 },
      { value: 'C', label: 'No; stakeholders are not currently updated on the organization\'s psychosocial risk profile.', points: 0 },
    ],
  },
  {
    id: 10,
    text: "Proactive Sustainability: Has your company moved away from "firefighting" toward long-term people sustainability?",
    options: [
      { value: 'A', label: 'Yes; our strategy focuses on Work Redesign to prevent harm through system architecture.', points: 10 },
      { value: 'B', label: 'We are still in a "reactive" mode, fixing systems only after a breakdown occurs.', points: 5 },
      { value: 'C', label: 'No; individual employees remain responsible for their own coping and resilience.', points: 0 },
    ],
  },
];

const profileQuestions: ProfileQuestion[] = [
  {
    id: 11,
    text: "Which best describes your current production environment?",
    options: [
      { value: 'indie', label: 'Independent feature or short film.' },
      { value: 'mid', label: 'Mid-sized commercial or TV production.' },
      { value: 'major', label: 'Major studio/High-End TV (HETV) production.' },
      { value: 'exec', label: 'Production service company/Executive leadership.' },
    ],
  },
  {
    id: 12,
    text: "Which describes your most critical objective for the next 90 days?",
    options: [
      { value: 'compliance', label: 'Ensuring 100% regulatory compliance with new OHS laws.' },
      { value: 'delivery', label: 'Guaranteeing on-time delivery by reducing mid-shoot disruptions or "walk-offs".' },
      { value: 'budget', label: 'Protecting the budget by lowering "invisible" costs like turnover or insurance premiums.' },
      { value: 'status', label: 'Achieving a "Psychosocial Safety Assessed" status to attract investors or broadcasters.' },
    ],
  },
  {
    id: 13,
    text: "What is the biggest obstacle currently preventing your set from being fully safety-compliant and efficient?",
    options: [
      { value: 'reactive', label: 'A "reactive" or "firefighting" culture that ignores risks until they become crises.' },
      { value: 'documentation', label: 'Lack of a formal system for documenting risks like chronic fatigue or harassment.' },
      { value: 'conflicts', label: 'Interpersonal conflicts that lead to last-minute "people issues".' },
      { value: 'budget', label: 'Budget constraints that make "soft" initiatives feel like a luxury rather than a necessity.' },
    ],
  },
  {
    id: 14,
    text: "Which approach to implementing these safety measures would suit your production best?",
    options: [
      { value: 'Self-guided', label: 'Self-guided: "I want a toolkit or software to do it myself" (lower budget).' },
      { value: 'Training', label: 'Training: "I want workshops for my HODs and crew" (mid-range budget).' },
      { value: 'Consulting', label: 'Consulting: "I want one-to-one expert guidance for my production" (higher-range budget).' },
      { value: 'Fully Managed', label: 'Fully Managed: "I want a done-for-you service to handle all assessments" (top-tier budget).' },
    ],
  },
];

function getVerdict(score: number) {
  if (score >= 80) return {
    title: 'Safe Architecture',
    color: 'text-green-600',
    bg: 'bg-green-500',
    desc: 'Congratulations, you have strong foundations. You are building a defensible safety architecture that protects both staff and executives.',
  };
  if (score >= 50) return {
    title: 'Process Friction',
    color: 'text-amber-600',
    bg: 'bg-amber-500',
    desc: 'You have good intentions but remain vulnerable. System redesign is needed to move from a Compliance Gap to defensible compliance.',
  };
  return {
    title: 'Statutory Liability',
    color: 'text-destructive',
    bg: 'bg-rose-500',
    desc: 'Warning: You have significant regulatory exposure. Immediate systemic intervention is required to avoid potential prosecution.',
  };
}

function getLegalInsight(val: string | undefined) {
  if (val === 'A') return 'Your documentation is on track with OHS regulations, providing a solid legal defense framework.';
  return 'You lack a specific psychosocial risk register. Without this documentation, you are highly exposed to statutory breaches under the 2025 Regulations.';
}

function getOpsInsight(val: string | undefined) {
  if (val === 'A') return 'Your early identification processes are successfully preventing systemic friction from turning into costly "walk-offs".';
  return 'Relying on formal complaints rather than proactive mapping is likely causing hidden operational friction, leading to interpersonal conflicts and lost time.';
}

function getFinancialInsight(val: string | undefined) {
  if (val === 'A') return 'You are successfully leveraging your safety data to negotiate better premiums and appeal to risk-averse stakeholders.';
  return 'By not tracking the "invisible" costs of psychosocial hazards, you are missing opportunities to reduce insurance premiums and prove ROI to broadcasters/investors.';
}

function getNextStep(env: string | undefined, budget: string | undefined) {
  if (budget === 'Fully Managed' || (env === 'major' && budget !== 'Self-guided')) {
    return "Let's schedule a One-to-One Meeting to discuss a full psychosocial safety audit tailored to your production.";
  }
  if (budget === 'Training' || budget === 'Consulting') {
    return 'Join our upcoming Group Presentation / Webinar on how to seamlessly integrate safety briefings into your daily call sheets.';
  }
  return 'Check out our free comprehensive video guide and toolkit to help move your set from a "reactive" mindset to proactive risk management.';
}

export default function Audit() {
  const [step, setStep] = useState<Step>('welcome');
  const [scoredAnswers, setScoredAnswers] = useState<Record<number, string>>({});
  const [profileAnswers, setProfileAnswers] = useState<Record<number, string>>({});
  const [openAnswer, setOpenAnswer] = useState('');
  const [score, setScore] = useState(0);

  const totalQuestions = scoredQuestions.length + profileQuestions.length + 1;
  const answeredCount = Object.keys(scoredAnswers).length + Object.keys(profileAnswers).length + (openAnswer ? 1 : 0);
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const handleScoredAnswer = (qId: number, value: string) => {
    setScoredAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleProfileAnswer = (qId: number, value: string) => {
    setProfileAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const canSubmit = Object.keys(scoredAnswers).length === scoredQuestions.length;

  const calculateAndShow = () => {
    let total = 0;
    scoredQuestions.forEach((q) => {
      const ans = scoredAnswers[q.id];
      const opt = q.options.find((o) => o.value === ans);
      if (opt) total += opt.points;
    });
    setScore(total);
    setStep('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setScoredAnswers({});
    setProfileAnswers({});
    setOpenAnswer('');
    setScore(0);
    setStep('welcome');
  };

  const verdict = getVerdict(score);

  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <div className="max-w-3xl w-full bg-card rounded-2xl shadow-xl overflow-hidden border border-border">

        {/* Header */}
        <div className="bg-foreground text-background p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-primary" size={32} />
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Psychosocial Safety Maturity Diagnostic
            </h1>
          </div>
          <p className="text-muted-foreground">
            Identify systemic friction points and quantify your current risk profile.
          </p>
        </div>

        <div className="p-6 md:p-8">

          {/* WELCOME */}
          {step === 'welcome' && (
            <div className="space-y-6">
              <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-primary text-sm font-medium">
                  Occupational Health and Safety (Psychosocial Health) Regulations 2025
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To achieve "Defensible Maturity" under the Occupational Health and Safety (Psychosocial Health)
                Regulations 2025, an organization must move from reactive wellness toward systemic safety architecture.
                Use this 15-question diagnostic to identify your current standing.
              </p>
              <Button onClick={() => setStep('survey')} className="w-full py-6 text-base group" variant="hero">
                Start Diagnostic <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {/* SURVEY */}
          {step === 'survey' && (
            <div className="space-y-8">
              {/* Progress */}
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>

              {/* Part 1 */}
              <h2 className="text-lg font-display font-bold border-b border-border pb-2">
                Part 1: The Defensible Maturity Index
              </h2>
              <div className="space-y-10 max-h-[50vh] overflow-y-auto pr-2">
                {scoredQuestions.map((q) => (
                  <div key={q.id} className="space-y-3">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {q.id}
                      </span>
                      <p className="text-base font-medium leading-snug">{q.text}</p>
                    </div>
                    <div className="space-y-2 pl-11">
                      {q.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleScoredAnswer(q.id, opt.value)}
                          className={`w-full text-left py-3 px-4 rounded-lg border-2 text-sm transition-all ${
                            scoredAnswers[q.id] === opt.value
                              ? 'bg-primary/10 border-primary text-foreground font-semibold'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          <span className="font-bold mr-1">{opt.value})</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Part 2 */}
              <h2 className="text-lg font-display font-bold border-b border-border pb-2 mt-6">
                Part 2: Production Context
              </h2>
              <div className="space-y-10">
                {profileQuestions.map((q) => (
                  <div key={q.id} className="space-y-3">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {q.id}
                      </span>
                      <p className="text-base font-medium leading-snug">{q.text}</p>
                    </div>
                    <div className="space-y-2 pl-11">
                      {q.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleProfileAnswer(q.id, opt.value)}
                          className={`w-full text-left py-3 px-4 rounded-lg border-2 text-sm transition-all ${
                            profileAnswers[q.id] === opt.value
                              ? 'bg-primary/10 border-primary text-foreground font-semibold'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Q15 open */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      15
                    </span>
                    <p className="text-base font-medium leading-snug">
                      Is there anything else we should know about your current production or specific safety concerns?
                    </p>
                  </div>
                  <div className="pl-11">
                    <Textarea
                      rows={4}
                      maxLength={500}
                      placeholder="Optional — share any additional context..."
                      value={openAnswer}
                      onChange={(e) => setOpenAnswer(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                disabled={!canSubmit}
                onClick={calculateAndShow}
                className="w-full py-6 text-base"
              >
                Submit &amp; Get Your Results
              </Button>
            </div>
          )}

          {/* RESULTS */}
          {step === 'results' && (
            <div className="space-y-10">
              {/* Score Box */}
              <div className={`text-center p-8 rounded-2xl text-white shadow-lg ${verdict.bg}`}>
                <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">
                  Defensible Maturity Index
                </p>
                <h2 className="text-7xl font-black mb-1">
                  {score}<span className="text-3xl font-medium opacity-75">/100</span>
                </h2>
                <div className="inline-block px-4 py-1 rounded-full text-sm font-black mt-3 bg-white/20 backdrop-blur">
                  {verdict.title}
                </div>
                <p className="text-white/90 font-medium max-w-md mx-auto mt-4">{verdict.desc}</p>
              </div>

              {/* Three Insights */}
              <div>
                <h3 className="text-lg font-display font-bold mb-4">The Three Insights</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 border border-border rounded-xl bg-card">
                    <Scale className="text-primary flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-sm mb-1">1. Legal / Regulatory Standing</h4>
                      <p className="text-sm text-muted-foreground">{getLegalInsight(scoredAnswers[1])}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 border border-border rounded-xl bg-card">
                    <Briefcase className="text-primary flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-sm mb-1">2. Operational Efficiency</h4>
                      <p className="text-sm text-muted-foreground">{getOpsInsight(scoredAnswers[4])}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 border border-border rounded-xl bg-card">
                    <DollarSign className="text-primary flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-sm mb-1">3. Financial / Stakeholder ROI</h4>
                      <p className="text-sm text-muted-foreground">{getFinancialInsight(scoredAnswers[7])}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Step */}
              <div className="bg-muted/50 p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-display font-bold mb-2">Your Recommended Next Step</h3>
                <p className="text-muted-foreground mb-4">
                  {getNextStep(profileAnswers[11], profileAnswers[14])}
                </p>
                <Button variant="hero" className="w-full py-5 text-base">
                  Claim Your Next Step
                </Button>
              </div>

              {/* Contact & Retake */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm font-semibold mb-2">Need direct assistance?</p>
                  <div className="flex gap-4">
                    <a href="mailto:contact@example.com" className="text-primary hover:text-primary/80 transition-colors flex items-center text-sm gap-1">
                      <Mail size={16} /> Email Us
                    </a>
                    <a href="https://www.linkedin.com/in/kush270" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors flex items-center text-sm gap-1">
                      <Linkedin size={16} /> LinkedIn
                    </a>
                  </div>
                </div>
                <Button variant="outline" onClick={resetAll} className="gap-2">
                  <RotateCcw size={16} /> Retake Diagnostic
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted/50 p-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">
            Psychosocial Safety Maturity Diagnostic © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
