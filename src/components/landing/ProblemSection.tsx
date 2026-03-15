import { motion } from "framer-motion";
import { AlertTriangle, FileWarning } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Invisible Psychosocial Hazards",
    description:
      "Bullying, burnout, and high-pressure communication on fast-moving sets go undetected until it's too late. Standard HR tools weren't built for production environments.",
  },
  {
    icon: FileWarning,
    title: "Compliance Gaps Are Costly",
    description:
      "WorkSafe Victoria's psychosocial hazard regulations are explicit. Non-compliance risks fines, crew wellbeing, and your production's reputation.",
  },
];

const ProblemSection = () => (
  <section className="py-20 lg:py-28 bg-section-alt">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <p className="text-sm font-body font-semibold uppercase tracking-widest text-gold mb-3">
          The Problem
        </p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Creative Sets Are High-Risk Workplaces
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          The film industry's unique pressures demand a purpose-built solution—not a 
          generic HR checklist designed for a corporate office.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {problems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="bg-card rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-lg bg-accent/15 flex items-center justify-center mb-5">
              <item.icon className="h-6 w-6 text-gold" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-3">{item.title}</h3>
            <p className="text-muted-foreground font-body leading-relaxed text-sm">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
