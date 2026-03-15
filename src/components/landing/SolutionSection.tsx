import { motion } from "framer-motion";
import { Brain, ShieldCheck, Lock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Sentiment Analysis",
    description:
      "Real-time analysis of voice tone and content identifies bullying, coercion, and burnout signals that humans miss under pressure.",
  },
  {
    icon: ShieldCheck,
    title: "Clinically Designed",
    description:
      "Built on evidence-based psychological frameworks by a practising Psychologist with Military and Forensic experience.",
  },
  {
    icon: Lock,
    title: "Australian Data Sovereignty",
    description:
      "All data processed and stored on Australian soil. Your crew's sensitive information never leaves the country.",
  },
];

const SolutionSection = () => (
  <section className="py-20 lg:py-28">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <p className="text-sm font-body font-semibold uppercase tracking-widest text-gold mb-3">
          The Solution
        </p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Purpose-Built Intelligence for Creative Workplaces
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          R3 Psychology combines clinical expertise with AI to give you visibility into 
          psychosocial risk—without disrupting the creative process.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex gap-5 p-6 rounded-lg border border-border bg-card hover:border-accent/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <item.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
