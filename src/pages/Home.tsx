import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Target, Users, ArrowRight, Award, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const pillars = [
  {
    icon: Shield,
    title: "The Governance Shield",
    subtitle: "Statutory Compliance",
    desc: "Protect Officers from personal criminal liability under the new Victorian regulations. Ensure your governance framework meets the mandatory duty to identify and control psychosocial hazards.",
  },
  {
    icon: Target,
    title: "Safety Architecture",
    subtitle: "Work-as-Done Diagnostic",
    desc: "Identify the gap between your written policies and daily task-load reality. Quantify where systemic friction points create unmanaged psychosocial risk on the ground.",
  },
  {
    icon: Users,
    title: "Psychosocial Safety Climate",
    subtitle: "Cultural Maturity",
    desc: "Quantify senior management commitment to psychological safety. Measure the cultural indicators that predict whether your controls will hold under operational pressure.",
  },
];

const stats = [
  {
    icon: Shield,
    value: "$17M+",
    label: "Regulatory Reality",
    desc: "In penalties issued for OHS breaches in 2025. Non-compliance is no longer a theoretical risk.",
  },
  {
    icon: DollarSign,
    value: "$58,615",
    label: "The Economic Imperative",
    desc: "Median cost per mental health workers' compensation claim. Prevention is significantly cheaper than remediation.",
  },
  {
    icon: TrendingUp,
    value: "$2.30",
    label: "The ROI of Redesign",
    desc: "Return for every dollar invested in psychosocial risk controls. Work redesign pays for itself.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center bg-hero-gradient overflow-hidden">
        {/* subtle texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="container relative z-10 py-24 lg:py-36 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
              <Shield className="h-4 w-4 text-gold" />
              <span className="text-sm font-body font-medium text-primary-foreground/80">
                December 2025 Regulations Now In Effect
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-[1.15] text-primary-foreground">
              Is your board truly ready to discharge its mandatory duties under the new Victorian Psychological Health Regulations
              <span className="text-gold">—or are you relying on a wellness policy that won't hold up in court?</span>
            </h1>

            <p className="text-lg md:text-xl font-body text-primary-foreground/70 max-w-3xl leading-relaxed">
              Answer targeted questions to identify the systemic friction points in your safety architecture and receive a quantified{" "}
              <span className="font-semibold text-primary-foreground">Defensible Maturity</span> score for your organization.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="hero" size="lg" asChild className="text-base px-8 py-6 rounded-full">
                <Link to="/assessment">
                  Defensible Maturity Scorecard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="text-sm font-body text-primary-foreground/40 pt-2">
              Takes less than 3 minutes · Free for Executive Teams · Immediate actionable outcomes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16 space-y-4">
            <p className="text-sm font-body font-semibold tracking-[0.2em] uppercase text-accent">
              The Three Pillars
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              A Framework for Defensible Maturity
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Our diagnostic evaluates your organization across three critical dimensions of psychosocial risk governance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-card border border-border rounded-2xl p-8 space-y-4 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <p.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">{p.title}</h3>
                  <p className="text-sm font-body font-medium text-accent">{p.subtitle}</p>
                </div>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credibility Stats ── */}
      <section className="py-20 lg:py-28 bg-section-alt">
        <div className="container max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16 space-y-4">
            <p className="text-sm font-body font-semibold tracking-[0.2em] uppercase text-accent">
              The Numbers
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              The Cost of Inaction Is Quantifiable
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-card border border-border rounded-2xl p-8 text-center space-y-3"
              >
                <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <p className="text-4xl font-display font-bold text-foreground">{s.value}</p>
                <p className="font-body font-semibold text-sm text-foreground">{s.label}</p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Expert Bio ── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="bg-card border border-border rounded-2xl p-10 md:p-14 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">Kush Mohun</h3>
                <p className="text-sm font-body font-medium text-accent">
                  Entrepreneurial Organizational Psychologist & High-Reliability Sector Lead
                </p>
              </div>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed">
              With three years as a <span className="font-semibold text-foreground">Military Psychologist</span> and
              two years as a <span className="font-semibold text-foreground">Forensic Psychologist</span>, Kush
              brings deep expertise in high-stakes environments where safety and performance are inseparable.
              Specialising in Schema Therapy, hypnotherapy, and performance coaching, he has designed the
              Defensible Maturity framework to bridge the gap between clinical evidence and operational compliance.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed">
              His approach ensures that psychosocial risk management is not just a regulatory checkbox—but a
              genuine competitive advantage for organisations operating under pressure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 lg:py-28 bg-hero-gradient">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp} className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
              Quantify Your Defensible Maturity Today
            </h2>
            <p className="text-lg font-body text-primary-foreground/70 max-w-2xl mx-auto">
              Discover where your organisation sits on the compliance spectrum—and what to fix first.
            </p>
            <Button variant="hero" size="lg" asChild className="text-base px-10 py-6 rounded-full">
              <Link to="/assessment">
                Start Your Scorecard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {["Takes less than 3 minutes", "Free for Executive Teams", "Immediate actionable outcomes"].map((t) => (
                <span key={t} className="text-sm font-body text-primary-foreground/50 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
