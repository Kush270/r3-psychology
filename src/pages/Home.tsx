import { motion } from "framer-motion";
import { Shield, Brain, FileCheck, Lock, Users, Activity, Mic, Search, ClipboardCheck } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      {/* Hero */}
      <motion.section {...fadeUp} className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
          Automating Psychosocial Safety
        </h1>
        <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
          Meet your WorkSafe Victoria obligations with clinical-grade AI sentiment
          analysis—designed for the high-pressure world of film and TV.
        </p>
      </motion.section>

      {/* Section 1 */}
      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          1. The Compliance Gap
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          As of December 2025, Victorian employers have a legal "duty to identify" psychosocial
          hazards—such as bullying, high job demands, and poor workplace relationships—with the
          same rigour as physical risks.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <Activity className="h-5 w-5" />
              <h3 className="font-body font-semibold text-foreground">The Problem</h3>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              Traditional surveys are slow, prone to bias, and fail to capture the real-time
              intensity of a film set.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              <h3 className="font-body font-semibold text-foreground">The Risk</h3>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              Failure to document "reasonably practicable" controls can lead to significant
              WorkSafe intervention and production delays.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 2 */}
      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          2. The Clinical Solution: R3 Psychology
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed">
          We bridge the gap between creative freedom and regulatory compliance. Our tool uses
          proprietary AI to analyse voice tone and content during key production interactions
          to flag risks before they escalate.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Brain, title: "Sentiment Analysis", desc: "Identifies emerging friction, burnout indicators, and communication breakdowns." },
            { icon: FileCheck, title: "Automated Reporting", desc: "Generates a \"Hazard Log\" that serves as documented evidence of your risk management process." },
            { icon: Users, title: "Psychologist-Led", desc: "Built by a specialist with 5+ years of Military and Forensic experience." },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-clinical">
                <item.icon className="h-5 w-5" />
                <h3 className="font-body font-semibold text-foreground">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 3 */}
      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          3. Why Producers Trust Us
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Lock, title: "Australia-First Security", desc: "100% Australian data sovereignty. No data leaves our shores, ensuring total privacy for your cast and crew." },
            { icon: Activity, title: "Non-Invasive", desc: "Designed to integrate into existing production workflows without slowing down the \"roll.\"" },
            { icon: Shield, title: "Evidence-Based", desc: "Built on Schema Therapy and military performance coaching frameworks to ensure your crew stays high-performing, not just \"compliant.\"" },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-gold">
                <item.icon className="h-5 w-5" />
                <h3 className="font-body font-semibold text-foreground text-sm">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 4 */}
      <motion.section {...fadeUp} className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          4. How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Mic, step: "1", title: "Capture", desc: "Securely record production meetings or on-set interactions." },
            { icon: Search, step: "2", title: "Analyse", desc: "Our AI scans for 15+ psychosocial hazards (as defined by WorkSafe Vic)." },
            { icon: ClipboardCheck, step: "3", title: "Comply", desc: "Receive an actionable report with control measures ready for your OHS log." },
          ].map((item) => (
            <div key={item.step} className="bg-card border border-border rounded-xl p-6 space-y-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-body font-bold">
                {item.step}
              </div>
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-accent" />
                <h3 className="font-body font-semibold text-foreground">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 5 */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          5. About the Founder
        </h2>
        <div className="bg-card border border-border rounded-xl p-8 space-y-3">
          <h3 className="font-display font-bold text-lg text-foreground">
            Kush, Registered Psychologist
          </h3>
          <p className="text-muted-foreground font-body leading-relaxed">
            Specialising in hypnotherapy and performance coaching, Kush brings three years of
            experience as a <span className="font-semibold text-foreground">Military Psychologist</span> and
            two years as a <span className="font-semibold text-foreground">Forensic Psychologist</span>.
            This unique background ensures a deep understanding of high-stakes, high-pressure
            environments where safety and performance are inseparable.
          </p>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section {...fadeUp} className="bg-hero-gradient rounded-xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-primary-foreground">
          Register Your Interest
        </h2>
        <p className="text-primary-foreground/80 font-body">
          Join the 2026 Melbourne Pilot Program. We are currently selecting three Melbourne-based
          productions for a guided beta launch.
        </p>
        <div className="font-body text-sm text-primary-foreground/70 space-y-1">
          <p>E. kush.mohun1@gmail.com</p>
          <p>M. 0420 704 305</p>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
