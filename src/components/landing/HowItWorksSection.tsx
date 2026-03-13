import { motion } from "framer-motion";
import { Mic, Cpu, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: Mic,
    step: "01",
    title: "Record",
    description:
      "Capture workplace interactions through secure, consent-based audio recording integrated into your production workflow.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Analyse",
    description:
      "Our AI engine analyses voice tone, sentiment, and conversational content against clinically validated psychosocial risk indicators.",
  },
  {
    icon: ClipboardCheck,
    step: "03",
    title: "Comply",
    description:
      "Receive automated, audit-ready compliance reports mapped to WorkSafe Victoria's psychosocial hazard obligations.",
  },
];

const HowItWorksSection = () => (
  <section className="py-20 lg:py-28 bg-hero-gradient">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <p className="text-sm font-body font-semibold uppercase tracking-widest text-gold mb-3">
          How It Works
        </p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
          Three Steps to Safer Sets
        </h2>
        <p className="text-primary-foreground/60 font-body leading-relaxed">
          From recording to compliance—automated, clinical, and built for the pace of production.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5 border border-accent/30">
              <item.icon className="h-7 w-7 text-gold" />
            </div>
            <span className="text-xs font-body font-bold uppercase tracking-widest text-gold mb-2 block">
              Step {item.step}
            </span>
            <h3 className="text-2xl font-display font-bold text-primary-foreground mb-3">{item.title}</h3>
            <p className="text-primary-foreground/60 font-body text-sm leading-relaxed max-w-xs mx-auto">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
