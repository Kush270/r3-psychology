import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Heart, Shield, Wind } from "lucide-react";
import { Navigate } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const NeuroscienceOfStress = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/members" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">
      <motion.section {...fadeUp} className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          The Neuroscience of Stress
        </h1>
        <p className="text-muted-foreground font-body leading-relaxed">
          Whether you're facing a high-stakes presentation or a perceived physical threat, your brain acts as the command center for your body's survival response. This "sentient meat" manages stress through a sophisticated interplay of electrical signals and chemical floods designed to ensure you survive the moment.
        </p>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Zap className="h-6 w-6 text-accent" />
          The Two-Pronged Response: SNS and HPA
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          The brain manages stress on two distinct timescales. Within milliseconds, the Sympathetic Nervous System (SNS), often called the "fight-or-flight" system, kicks in. The hypothalamus prompts the adrenal glands to release a rush of adrenaline (epinephrine) and norepinephrine, which increase heart rate, dilate blood vessels, and redirect blood flow away from internal organs toward the muscles. This physical arousal is often accompanied by an observable decrease in "Alpha" brain wave patterns, signaling a state of high agitation.
        </p>
        <p className="text-muted-foreground font-body leading-relaxed">
          A few minutes later, the Hypothalamic-Pituitary-Adrenal (HPA) axis initiates a slower, sustained response. The hypothalamus sends signals to the pituitary gland, which eventually triggers the adrenal glands to release cortisol. Cortisol changes your metabolism and behavior to help you cope with sustained pressure, though it temporarily suppresses longer-term priorities like the immune system and digestion.
        </p>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Brain className="h-6 w-6 text-accent" />
          The Internal Battle: Logic vs. Instinct
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          Inside the head, stress triggers a conflict between different evolutionary layers of the brain. Under low stress, the prefrontal cortex (PFC)—the "Albert Einstein" of the brain—is in charge, regulating thoughts and emotions. However, during high stress, the more primitive limbic system takes over with conditioned emotional responses. The amygdala becomes hyper-reactive, acting as a threat monitor that can "hijack" the brain, causing us to act on primal impulses rather than logical planning.
        </p>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Heart className="h-6 w-6 text-accent" />
          The Physical and Social Toll
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          Stress is not "all in your head"; it is an embodied experience where the brain and body act as one neural network. For example, the gut-brain axis ensures that psychological trauma can manifest physically as gastrointestinal issues. Furthermore, the brain does not distinguish between physical pain and social pain; research shows that social rejection activates the anterior cingulate cortex and insula, the same regions that process physical injury.
        </p>
        <p className="text-muted-foreground font-body leading-relaxed">
          The phenomenal "feel" of these emotions—the weariness of depression or the red-hot glow of anger—colors our entire conscious experience. While temporary "eustress" (good stress) can help us enter a "flow state" and rise to a challenge, chronic stress is dangerous. Long-term pressure can lead to the actual shrinking of brain tissue, specifically a measurable decrease (up to 14%) in hippocampal volume, which impairs memory and future planning.
        </p>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Wind className="h-6 w-6 text-accent" />
          Restoring Balance
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          To counteract this, the Parasympathetic Nervous System (PSNS) acts as the "brake" once the threat has passed. Often called the "rest-and-digest" response, it uses acetylcholine to slow the heart rate and turn the immune system back on. Understanding these systems allows us to use techniques like deep breathing or nature activities to help our neural circuitry "rest and relax".
        </p>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Shield className="h-6 w-6 text-accent" />
          References
        </h2>
        <ul className="text-sm text-muted-foreground font-body space-y-2 list-disc list-inside">
          <li>Ricker, E. R. <em>Brain</em>.</li>
          <li>Hollins, P. <em>Build a Better Brain</em>.</li>
          <li>Targ, R., et al. <em>Mind-Reach: Scientists Look at Psychic Abilities</em>.</li>
          <li>Bloom, P. <em>Psych: The Story of the Human Mind</em>.</li>
          <li>Pearlman, O. <em>Read Your Mind</em>.</li>
          <li>Chalmers, D. J. <em>The Conscious Mind: In Search of a Fundamental Theory</em>.</li>
          <li>Lakoff, G., &amp; Narayanan, S. <em>The Neural Mind: How Brains Think</em>.</li>
        </ul>
      </motion.section>

      <div className="pt-4 border-t border-border">
        <Button variant="outline" onClick={signOut} className="rounded-full">
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default NeuroscienceOfStress;
