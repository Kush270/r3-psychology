import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, Zap, DollarSign, Award, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const valueProps = [
  {
    icon: Scale,
    title: "Legal Compliance",
    desc: "Ensuring you meet new regulatory requirements, like the 2025 OHS Regulations, to avoid fines and lawsuits.",
  },
  {
    icon: Zap,
    title: "Operational Efficiency",
    desc: 'Reducing disruptions like interpersonal conflict or "walk-offs" to ensure on-time delivery.',
  },
  {
    icon: DollarSign,
    title: "Financial ROI",
    desc: 'Uncovering "invisible" costs and leveraging proactive risk management to potentially lower insurance premiums.',
  },
];

const trustMarkers = [
  "Start the 15 questions now.",
  "It only takes 3 minutes to complete.",
  "It\u2019s completely free.",
  "Get immediate recommendations.",
];

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    navigate("/audit", { state: { name: name.trim(), email: email.trim() } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-hero-gradient overflow-hidden py-px px-0">
        <div className="container relative z-10 lg:py-28 max-w-3xl mx-auto py-[11px] px-[24px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-[1.15] text-primary-foreground">
              Psychosocial Safety&nbsp;Maturity Diagnostic
            </h1>
            <p className="text-lg md:text-xl font-body text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Identify systemic friction points and quantify your current risk profile.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hook */}
      <section className="py-16 bg-background lg:py-[20px]">
        <div className="container max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
              Are you ready to protect your production&rsquo;s bottom line and legal standing from the high-stakes risks of the modern film set?
            </h2>
            <p className="text-lg font-body text-muted-foreground">
              Answer 15 questions to find out how to justify psychosocial safety measures as essential risk mitigation and discover what&rsquo;s really protecting your production&rsquo;s operational efficiency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-section-alt lg:py-[20px]">
        <div className="container max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground border-b border-border pb-3">
              Why take this diagnostic?
            </h3>
            <ul className="space-y-5">
              {valueProps.map((vp, i) => (
                <li key={vp.title} className="flex items-start">
                  <div className="bg-primary/10 text-accent p-2 rounded-lg mr-4 mt-1">
                    <vp.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-foreground font-body">{vp.title}:</strong>
                    <span className="text-muted-foreground font-body block mt-1">{vp.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Credibility */}
      <section className="py-16 bg-background lg:py-[20px]">
        <div className="container max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="bg-card border-l-4 border-primary shadow-sm p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">Kush Mohun</h3>
                <p className="text-sm font-body font-medium text-accent uppercase tracking-wide">
                  Entrepreneurial Psychologist
                </p>
              </div>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed italic">
              With three years as a Psychologist in Forensic settings and three years as a Military Psychologist, Kush brings deep expertise in high-stakes environments where safety and performance are inseparable. Specialising in Schema Therapy, Motivational Interviewing, and Performance Coaching, he has designed the Defensible Maturity framework to bridge the gap between clinical evidence and operational compliance.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed italic">
              His approach ensures that psychosocial risk management is not just a regulatory check-box—but a genuine competitive advantage for organisations operating under pressure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Lead Capture CTA */}
      <section className="py-16 bg-section-alt lg:py-[20px]">
        <div className="container max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="bg-primary/5 border border-accent/20 rounded-2xl p-8 text-center space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground">
              Take the first step toward a safer set.
            </h3>

            <ul className="text-left max-w-sm mx-auto space-y-3">
              {trustMarkers.map((t) => (
                <li key={t} className="flex items-center font-body text-foreground">
                  <CheckCircle className="h-5 w-5 text-accent mr-2 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>

            <form onSubmit={handleStart} className="max-w-sm mx-auto space-y-4">
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl"
              />
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full text-base py-6 rounded-xl"
              >
                Start the Diagnostic
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-xs font-body text-muted-foreground">
                Your information is secure and will never be shared.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
