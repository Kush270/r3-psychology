import { motion } from "framer-motion";
import { Award, Shield, MapPin } from "lucide-react";

const credentials = [
  {
    icon: Award,
    title: "Military & Forensic Psychologist",
    description:
      "Designed by a practising Psychologist with deep expertise in high-stakes, high-stress operational environments.",
  },
  {
    icon: Shield,
    title: "Evidence-Based Framework",
    description:
      "Every risk indicator is grounded in peer-reviewed psychological research and aligned with Australian WHS legislation.",
  },
  {
    icon: MapPin,
    title: "Melbourne-Based",
    description:
      "Built in Melbourne, for Australian productions. We understand the local regulatory landscape and industry culture.",
  },
];

const AuthoritySection = () => (
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
          Clinical Authority
        </p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Not Another Tech Startup.{" "}
          <span className="text-gold">A Clinical Tool.</span>
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          Vantage is the product of clinical rigour meeting industry-specific need—designed by 
          someone who has assessed risk in warzones, courtrooms, and now, on your set.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {credentials.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-5">
              <item.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AuthoritySection;
