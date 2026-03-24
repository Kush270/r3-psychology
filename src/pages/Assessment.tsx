import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ProgressBar } from "@/components/assessment/ProgressBar";
import {
  scoredQuestions,
  profileQuestions,
  openQuestion,
  calculateResult,
} from "@/data/assessmentQuestions";
import { motion, AnimatePresence } from "framer-motion";

const STEP_LABELS = ["Compliance", "Profile", "Review"];
const SCORED_PER_STEP = 10;

export default function Assessment() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: scored, 1: profile, 2: review/submit
  const [scoredAnswers, setScoredAnswers] = useState<Record<string, string>>({});
  const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>({});
  const [openAnswer, setOpenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasExisting, setHasExisting] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setHasExisting(false); return; }
    supabase
      .from("assessment_responses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          navigate("/assessment/results", { replace: true });
        } else {
          setHasExisting(false);
        }
      });
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading && !user) setAuthOpen(true);
  }, [authLoading, user]);

  const allScoredDone = scoredQuestions.every((q) => scoredAnswers[q.id]);
  const allProfileDone = profileQuestions.every((q) => profileAnswers[q.id]);

  const canAdvance = () => {
    if (step === 0) return allScoredDone;
    if (step === 1) return allProfileDone;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const result = calculateResult(scoredAnswers);
    const { error } = await supabase.from("assessment_responses").insert({
      user_id: user.id,
      responses: {
        scored: scoredAnswers,
        profile: profileAnswers,
        open: { q15: openAnswer },
      },
      total_a: result.total_a,
      total_b: result.total_b,
      total_c: result.total_c,
      interpretation: result.interpretation,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Assessment submitted successfully.");
      navigate("/assessment/results");
    }
  };

  if (authLoading || hasExisting === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <ShieldCheck className="mx-auto h-14 w-14 text-accent mb-5" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">
          Production Governance & Statutory Risk Diagnostic
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
          Sign in to complete your psychosocial compliance assessment under the 2025 WorkSafe Victoria regulations.
        </p>
        <Button onClick={() => setAuthOpen(true)} className="bg-accent text-accent-foreground px-8">
          Sign In to Begin
        </Button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Production Governance & Statutory Risk Diagnostic
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Assess your organisation's defensible maturity and statutory compliance under the Occupational Health and Safety (Psychological Health) Regulations 2025.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="mb-10">
        <ProgressBar currentStep={step} totalSteps={3} stepLabels={STEP_LABELS} />
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {scoredQuestions.map((q, i) => (
              <QuestionCard
                key={q.id}
                questionNumber={i + 1}
                text={q.text}
                type="radio"
                options={q.options}
                value={scoredAnswers[q.id] || ""}
                onChange={(v) => setScoredAnswers((p) => ({ ...p, [q.id]: v }))}
              />
            ))}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {profileQuestions.map((q, i) => (
              <QuestionCard
                key={q.id}
                questionNumber={11 + i}
                text={q.text}
                type="radio"
                options={q.options}
                value={profileAnswers[q.id] || ""}
                onChange={(v) => setProfileAnswers((p) => ({ ...p, [q.id]: v }))}
              />
            ))}
            <QuestionCard
              questionNumber={15}
              text={openQuestion.text}
              type="textarea"
              value={openAnswer}
              onChange={setOpenAnswer}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-card p-6 md:p-8 text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-accent mb-4" />
              <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                Ready to Submit
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
                You've answered all 15 questions. Your responses will be securely saved and your compliance score calculated immediately.
              </p>

              <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-6">
                <div>
                  <span className="block text-2xl font-bold text-foreground">{Object.keys(scoredAnswers).length}</span>
                  Scored
                </div>
                <div>
                  <span className="block text-2xl font-bold text-foreground">{Object.keys(profileAnswers).length + (openAnswer ? 1 : 0)}</span>
                  Profile
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-3 text-base"
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Assessment"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="text-muted-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        {step < 2 && (
          <div className="flex items-center gap-3">
            {!canAdvance() && (
              <span className="text-xs text-muted-foreground">
                Answer all questions to continue
              </span>
            )}
            <Button
              onClick={() => {
                setStep((s) => s + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={!canAdvance()}
              className="bg-primary text-primary-foreground"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
