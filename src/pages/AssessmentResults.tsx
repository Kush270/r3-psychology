import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GaugeChart } from "@/components/assessment/GaugeChart";
import { interpretationData, type AssessmentResult } from "@/data/assessmentQuestions";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AssessmentResults() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/assessment", { replace: true }); return; }

    supabase
      .from("assessment_responses")
      .select("total_a, total_b, total_c, interpretation")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setResult(data as AssessmentResult);
        } else {
          navigate("/assessment", { replace: true });
        }
        setLoading(false);
      });
  }, [user, authLoading, navigate]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "My Psychosocial Compliance Assessment",
        text: `I scored "${interpretationData[result!.interpretation].title}" on the Production Governance & Statutory Risk Diagnostic.`,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const info = interpretationData[result.interpretation];
    const content = `
PRODUCTION GOVERNANCE & STATUTORY RISK DIAGNOSTIC
====================================================
Assessment Results
----------------------------------------------------

Score Breakdown:
  A answers (Defensible): ${result.total_a} / 10
  B answers (Gaps):       ${result.total_b} / 10
  C answers (Risk):       ${result.total_c} / 10

Interpretation: ${info.title}

${info.description}

----------------------------------------------------
Generated on ${new Date().toLocaleDateString("en-AU", {
      year: "numeric", month: "long", day: "numeric",
    })}
Occupational Health and Safety (Psychological Health) Regulations 2025
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compliance-assessment-results.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!result) return null;

  const info = interpretationData[result.interpretation];

  return (
    <div className="max-w-2xl mx-auto py-10 md:py-16 px-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground mb-6 -ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Button>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Your Assessment Results
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Production Governance & Statutory Risk Diagnostic
        </p>
      </motion.div>

      {/* Gauge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-6 md:p-10 mb-8"
      >
        <GaugeChart
          value={info.level}
          color={info.color}
          label={info.title}
        />
      </motion.div>

      {/* Interpretation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-8"
      >
        <h2
          className="text-xl font-display font-bold mb-3"
          style={{ color: info.color }}
        >
          {info.title}
        </h2>
        <p className="text-foreground/85 leading-relaxed mb-6">{info.description}</p>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground">{result.total_a}</span>
            <span className="text-xs text-muted-foreground">A (Defensible)</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground">{result.total_b}</span>
            <span className="text-xs text-muted-foreground">B (Gaps)</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground">{result.total_c}</span>
            <span className="text-xs text-muted-foreground">C (Risk)</span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button onClick={handleDownload} className="flex-1 bg-primary text-primary-foreground">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
        <Button onClick={handleShare} variant="outline" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" /> Share Results
        </Button>
      </motion.div>
    </div>
  );
}
