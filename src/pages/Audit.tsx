import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Step = 'welcome' | 'survey' | 'results' | 'contact';

interface Question {
  id: number;
  text: string;
  category: string;
}

const questions: Question[] = [
  { id: 1, text: "Do you have a written Psychosocial Risk Assessment (PSRA) specific to this production?", category: "Compliance" },
  { id: 2, text: "Are 'Psychosocial Hazards' explicitly mentioned in your Day 1 Safety Induction?", category: "Education" },
  { id: 3, text: "Is there an anonymous reporting channel (like a QR code) available on the Call Sheet?", category: "Reporting" },
  { id: 4, text: "Do you have a documented process for handling bullying or harassment claims on set?", category: "Compliance" },
  { id: 5, text: "Are HODs trained to recognize signs of crew fatigue or psychological distress?", category: "Leadership" },
  { id: 6, text: "Do you ensure a minimum of 11 hours turnaround between wrap and the next call?", category: "Work Design" },
  { id: 7, text: "Is there a budget allocated for mental health support (e.g., MHFA or a consultant)?", category: "Resources" },
  { id: 8, text: "Do you consult with crew/MEAA reps regarding work design and scheduling changes?", category: "Consultation" },
  { id: 9, text: "Is the 'Show Must Go On' mentality balanced with crew welfare in production meetings?", category: "Culture" },
  { id: 10, text: "Are workload demands regularly reviewed to prevent chronic over-extension of departments?", category: "Work Design" },
  { id: 11, text: "Do you have a clear 'Return to Work' plan for crew suffering from stress-related injuries?", category: "Compliance" },
  { id: 12, text: "Are 'Split Shifts' or 'Swings' used for long shoot days to manage exhaustion?", category: "Work Design" },
  { id: 13, text: "Is the production company's Director/EP aware of their personal liability under the 2025 Regs?", category: "Governance" },
  { id: 14, text: "Do you conduct 'Wrap Debriefs' to discuss stress and lessons learned for future shoots?", category: "Culture" },
  { id: 15, text: "Can you provide a paper trail of psychosocial risk controls if WorkSafe inspects your set today?", category: "Compliance" },
];

function getInterpretation(s: number) {
  if (s < 30) return {
    status: "CRITICAL RISK",
    color: "text-destructive",
    bg: "bg-destructive/10",
    desc: "Immediate intervention required. You are currently non-compliant with WorkSafe Victoria 2025 Regulations. A single claim could lead to prosecution.",
  };
  if (s < 60) return {
    status: "NON-COMPLIANT",
    color: "text-orange-600",
    bg: "bg-orange-50",
    desc: "Significant gaps identified. While you have basic awareness, your documentation and 'High-Order' controls are insufficient to protect you from legal liability.",
  };
  if (s < 90) return {
    status: "MODERATE ALIGNMENT",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    desc: "Good progress. You have systems in place, but need to tighten your 'Work Design' controls and ensure consistent consultation records.",
  };
  return {
    status: "BEST PRACTICE",
    color: "text-green-600",
    bg: "bg-green-50",
    desc: "Excellent. Your production is a leader in psychosocial safety. Ensure you continue to review and revise your controls as the shoot progresses.",
  };
}

export default function Audit() {
  const [step, setStep] = useState<Step>('welcome');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (qId: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const calculateScore = () => {
    const totalPossible = questions.length * 2;
    const actualScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    const percentage = Math.round((actualScore / totalPossible) * 100);
    setScore(percentage);
    setStep('results');
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Request submitted successfully');
  };

  const interpret = getInterpretation(score);
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <div className="max-w-3xl w-full bg-card rounded-2xl shadow-xl overflow-hidden border border-border">

        {/* Header */}
        <div className="bg-foreground text-background p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-primary" size={32} />
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Psychosocial Audit 2026</h1>
          </div>
          <p className="text-muted-foreground">Compliance Tool for Melbourne Film Production Managers</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">

          {step === 'welcome' && (
            <div className="space-y-6">
              <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-primary text-sm font-medium">
                  Align with the Victoria OHS (Psychological Health) Regulations 2025.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This 15-question audit evaluates your current production's risk management framework.
                Answer honestly to get an accurate compliance score and tailored recommendations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <BarChart3 className="text-muted-foreground mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-sm">Automated Scoring</h3>
                    <p className="text-xs text-muted-foreground">Get a score from 1-100 based on regulatory triggers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <Clock className="text-muted-foreground mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-sm">3-Minute Process</h3>
                    <p className="text-xs text-muted-foreground">Quick assessment designed for busy PMs.</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setStep('survey')} className="w-full py-6 text-base group" variant="hero">
                Start Audit <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {step === 'survey' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="space-y-10 max-h-[50vh] overflow-y-auto pr-4">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-4">
                    <div className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {q.id}
                      </span>
                      <p className="text-lg font-medium leading-tight">{q.text}</p>
                    </div>
                    <div className="flex gap-2 pl-12">
                      {[
                        { val: 2, label: 'Yes', active: 'bg-primary border-primary text-primary-foreground', idle: 'border-border text-muted-foreground hover:border-primary/50' },
                        { val: 1, label: 'Partially', active: 'bg-orange-100 border-orange-400 text-orange-800', idle: 'border-border text-muted-foreground hover:border-orange-200' },
                        { val: 0, label: 'No', active: 'bg-destructive/10 border-destructive text-destructive', idle: 'border-border text-muted-foreground hover:border-destructive/30' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => handleAnswer(q.id, opt.val)}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold transition-all ${answers[q.id] === opt.val ? opt.active : opt.idle}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                disabled={Object.keys(answers).length < questions.length}
                onClick={calculateScore}
                className="w-full py-6 text-base"
              >
                Generate Results
              </Button>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-8">
              <div className={`text-center p-8 rounded-2xl ${interpret.bg}`}>
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Your Compliance Score</p>
                <h2 className={`text-7xl font-black mb-4 ${interpret.color}`}>{score}</h2>
                <div className={`inline-block px-4 py-1 rounded-full text-sm font-black mb-4 bg-card shadow-sm border ${interpret.color}`}>
                  {interpret.status}
                </div>
                <p className="text-foreground/70 font-medium max-w-md mx-auto">{interpret.desc}</p>
              </div>

              <div className="bg-muted/50 p-6 rounded-2xl border border-border">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-orange-500" size={20} />
                  Critical Actions Needed
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />Ensure all HODs sign off on a dedicated Psychosocial Code of Conduct.</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />Integrate anonymous hazard reporting into the call sheet immediately.</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />Review shoot-day durations against the 2025 OHS fatigue guidelines.</li>
                </ul>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <h3 className="font-bold text-lg">Request Professional Support</h3>
                  <p className="text-sm text-muted-foreground italic">Want a direct call to discuss these results or help implementing your PSRA?</p>
                  <div className="space-y-3">
                    <Input required placeholder="Your Name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input required type="email" placeholder="Email Address" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
                      <Input required type="tel" placeholder="Phone Number" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full py-6 text-base" variant="hero">Submit Request</Button>
                </form>
              ) : (
                <div className="bg-green-50 p-8 rounded-2xl border border-green-200 text-center">
                  <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-green-800">Request Received</h3>
                  <p className="text-green-700 mt-2">A specialist will contact you shortly at {userData.phone}.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-muted/50 p-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">
            Melbourne Screen Industry Compliance Tool © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
