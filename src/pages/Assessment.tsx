import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

const scoredQuestions = [
  {
    id: "q1",
    text: "How does your production identify psychosocial hazards (e.g., bullying, fatigue, sexual harassment)?",
    options: [
      { value: "A", label: "We have a formal, documented risk assessment process that is reviewed regularly." },
      { value: "B", label: "We have an informal process or rely on individual reports." },
      { value: "C", label: "We don't have a specific process for psychosocial hazards." },
    ],
  },
  {
    id: "q2",
    text: "What controls are in place to manage excessive working hours and fatigue?",
    options: [
      { value: "A", label: "Enforced maximum hours, mandatory rest breaks, and fatigue management plans." },
      { value: "B", label: "General guidelines exist, but enforcement is inconsistent." },
      { value: "C", label: "Hours are managed on a case-by-case basis by individual crew." },
    ],
  },
  {
    id: "q3",
    text: "How does your production address power imbalances between senior crew and junior staff?",
    options: [
      { value: "A", label: "Clear reporting channels, anti-bullying policies, and trained bystander intervention." },
      { value: "B", label: "We have a code of conduct, but limited enforcement mechanisms." },
      { value: "C", label: "We rely on crew to manage their own interpersonal dynamics." },
    ],
  },
  {
    id: "q4",
    text: "What support is available for crew exposed to traumatic or distressing content?",
    options: [
      { value: "A", label: "Pre-production risk assessment, on-set support, and post-production debriefing." },
      { value: "B", label: "Access to an EAP (Employee Assistance Program) is available." },
      { value: "C", label: "Support is available if someone asks for it." },
    ],
  },
  {
    id: "q5",
    text: "How does your production handle complaints about psychosocial hazards?",
    options: [
      { value: "A", label: "A documented, confidential complaints process with clear timelines and follow-up." },
      { value: "B", label: "Complaints go to the producer or line manager on an ad-hoc basis." },
      { value: "C", label: "There is no formal complaints process." },
    ],
  },
  {
    id: "q6",
    text: "How are psychosocial risks communicated to crew before a production begins?",
    options: [
      { value: "A", label: "A pre-production briefing covering identified risks, controls, and reporting pathways." },
      { value: "B", label: "Risks are mentioned in a general safety induction." },
      { value: "C", label: "Psychosocial risks are not specifically communicated." },
    ],
  },
  {
    id: "q7",
    text: "Who is responsible for monitoring psychosocial safety on your production?",
    options: [
      { value: "A", label: "A designated psychosocial safety lead with authority and training." },
      { value: "B", label: "It falls under the general duties of the line producer or safety officer." },
      { value: "C", label: "No one person is specifically responsible." },
    ],
  },
  {
    id: "q8",
    text: "How does your production use data to track psychosocial wellbeing?",
    options: [
      { value: "A", label: "Regular anonymous surveys, incident tracking, and trend analysis." },
      { value: "B", label: "We collect some data, but don't analyse it systematically." },
      { value: "C", label: "We don't collect data on psychosocial wellbeing." },
    ],
  },
  {
    id: "q9",
    text: "How does your organisation review and improve its psychosocial safety systems?",
    options: [
      { value: "A", label: "Post-production reviews, annual audits, and continuous improvement cycles." },
      { value: "B", label: "We discuss what went well and what didn't at the end of a production." },
      { value: "C", label: "We don't have a formal review process." },
    ],
  },
  {
    id: "q10",
    text: "How does your production's approach align with the hierarchy of control for psychosocial hazards?",
    options: [
      { value: "A", label: "We prioritise eliminating and substituting hazards at the systemic level." },
      { value: "B", label: "We use a mix of systemic and individual controls." },
      { value: "C", label: "We primarily rely on individual resilience and coping strategies." },
    ],
  },
];

const textQuestions = [
  { id: "q11", text: "Describe your production's biggest psychosocial safety challenge in the last 12 months." },
  { id: "q12", text: "What wellbeing initiatives currently exist on your productions?" },
  { id: "q13", text: "How do you currently measure the effectiveness of your safety controls?" },
  { id: "q14", text: "What barriers do you face in implementing psychosocial safety measures?" },
  { id: "q15", text: "Is there anything else you'd like to share about your production's safety culture?" },
];

type Interpretation = "defensible_maturity" | "governance_gap" | "high_statutory_risk";

interface AssessmentResult {
  total_a: number;
  total_b: number;
  total_c: number;
  interpretation: Interpretation;
}

function calculateResult(scored: Record<string, string>): AssessmentResult {
  let total_a = 0, total_b = 0, total_c = 0;
  Object.values(scored).forEach((v) => {
    if (v === "A") total_a++;
    else if (v === "B") total_b++;
    else if (v === "C") total_c++;
  });

  let interpretation: Interpretation;
  if (total_c >= total_a && total_c >= total_b) {
    interpretation = "high_statutory_risk";
  } else if (total_b >= total_a) {
    interpretation = "governance_gap";
  } else {
    interpretation = "defensible_maturity";
  }

  return { total_a, total_b, total_c, interpretation };
}

const interpretationData: Record<Interpretation, { title: string; description: string; icon: typeof ShieldCheck; colorClass: string }> = {
  defensible_maturity: {
    title: "Defensible Maturity",
    description: "Your production shows high defensible maturity. You are likely compliant with the 2025 Regulations, but you should continue annual monitoring to maintain this status.",
    icon: ShieldCheck,
    colorClass: "text-green-600 dark:text-green-400",
  },
  governance_gap: {
    title: "Governance Gap",
    description: "You have a governance gap. While you have wellness initiatives, you are vulnerable to statutory liability because you are not addressing risks at the \"Work-as-Done\" systemic level. A psychosocial risk assessment is strongly recommended to build a defensible safety architecture.",
    icon: AlertTriangle,
    colorClass: "text-amber-600 dark:text-amber-400",
  },
  high_statutory_risk: {
    title: "High Statutory Risk",
    description: "Your production is at high statutory risk. You are relying on individual crew \"coping\" (Level 3 controls) for systemic hazards, which is now a breach of the hierarchy of control mandates. Failure to act could result in criminal prosecution and significant fines (up to $17M+ in recent Victorian precedents). A formal psychosocial risk assessment is immediately required.",
    icon: ShieldAlert,
    colorClass: "text-destructive",
  },
};

export default function Assessment() {
  const { user, loading: authLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [scoredAnswers, setScoredAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [existingResult, setExistingResult] = useState<AssessmentResult | null>(null);
  const [loadingResult, setLoadingResult] = useState(true);

  useEffect(() => {
    if (!user) { setLoadingResult(false); return; }
    supabase
      .from("assessment_responses")
      .select("total_a, total_b, total_c, interpretation")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExistingResult(data as AssessmentResult);
        setLoadingResult(false);
      });
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) setAuthOpen(true);
  }, [authLoading, user]);

  const allScoredAnswered = scoredQuestions.every((q) => scoredAnswers[q.id]);

  const handleSubmit = async () => {
    if (!user || !allScoredAnswered) return;
    setSubmitting(true);
    const result = calculateResult(scoredAnswers);
    const { error } = await supabase.from("assessment_responses").insert({
      user_id: user.id,
      responses: { scored: scoredAnswers, text: textAnswers },
      total_a: result.total_a,
      total_b: result.total_b,
      total_c: result.total_c,
      interpretation: result.interpretation,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setExistingResult(result);
      toast.success("Assessment submitted successfully.");
    }
  };

  if (authLoading || loadingResult) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-accent mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Psychosocial Compliance Assessment</h1>
        <p className="text-muted-foreground mb-6">Sign in to complete your compliance assessment.</p>
        <Button onClick={() => setAuthOpen(true)} className="bg-accent text-accent-foreground">Sign In to Begin</Button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  if (existingResult) {
    const info = interpretationData[existingResult.interpretation];
    const Icon = info.icon;
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-8">Your Assessment Result</h1>
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon className={`h-8 w-8 ${info.colorClass}`} />
              <CardTitle className={`text-xl ${info.colorClass}`}>{info.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/90 leading-relaxed">{info.description}</p>
            <div className="flex gap-6 pt-2 text-sm text-muted-foreground">
              <span>A answers: <strong className="text-foreground">{existingResult.total_a}</strong></span>
              <span>B answers: <strong className="text-foreground">{existingResult.total_b}</strong></span>
              <span>C answers: <strong className="text-foreground">{existingResult.total_c}</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Psychosocial Compliance Assessment</h1>
      <p className="text-muted-foreground mb-8">Answer the following questions to assess your production's compliance with the 2025 WorkSafe Victoria psychosocial hazard regulations.</p>

      <div className="space-y-8">
        {scoredQuestions.map((q, i) => (
          <Card key={q.id} className="border-border">
            <CardContent className="pt-6">
              <p className="font-medium text-foreground mb-4">{i + 1}. {q.text}</p>
              <RadioGroup value={scoredAnswers[q.id] || ""} onValueChange={(v) => setScoredAnswers((p) => ({ ...p, [q.id]: v }))}>
                {q.options.map((opt) => (
                  <div key={opt.value} className="flex items-start space-x-3 py-2">
                    <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} className="mt-0.5" />
                    <Label htmlFor={`${q.id}-${opt.value}`} className="text-sm text-foreground/80 leading-relaxed cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        <div className="pt-4">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Additional Context</h2>
          <p className="text-sm text-muted-foreground mb-6">These responses are not scored but help us understand your production's safety culture.</p>
          {textQuestions.map((q, i) => (
            <div key={q.id} className="mb-6">
              <Label htmlFor={q.id} className="text-sm font-medium text-foreground">{10 + i + 1}. {q.text}</Label>
              <Textarea
                id={q.id}
                className="mt-2 bg-card border-border"
                rows={3}
                maxLength={300}
                value={textAnswers[q.id] || ""}
                onChange={(e) => setTextAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={!allScoredAnswered || submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><CheckCircle className="mr-2 h-4 w-4" /> Submit Assessment</>}
        </Button>
        {!allScoredAnswered && <p className="text-sm text-muted-foreground text-center">Please answer all 10 scored questions to submit.</p>}
      </div>
    </div>
  );
}
