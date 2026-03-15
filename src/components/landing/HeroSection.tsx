import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-filmset.jpg";

const HeroSection = () => {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Film set production" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
      </div>

      <div className="container relative z-10 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 mb-8">
            <Shield className="h-4 w-4 text-gold" />
            <span className="text-sm font-body font-medium text-primary-foreground/80">
              WorkSafe Victoria Compliant
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] text-primary-foreground mb-6">
            AI-Powered Psychosocial Risk Assessment for{" "}
            <span className="text-gold">Film & Creative Industries</span>
          </h1>

          <p className="text-sm font-display font-medium tracking-[0.15em] uppercase text-gold/80 mb-2">
            Resolve · Renew · Recover
          </p>

          <p className="text-lg md:text-xl font-body text-primary-foreground/75 max-w-2xl mb-4 leading-relaxed">
            Designed by a Military & Forensic Psychologist. Clinically validated sentiment analysis 
            that identifies workplace hazards—before they become incidents.
          </p>

          <p className="text-sm font-body text-primary-foreground/50 mb-10">
            100% Australian Data Sovereignty · Real-Time Analysis · Automated Compliance Reports
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" onClick={scrollToWaitlist} className="text-base px-8 py-6">
              Join the Beta Program
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="lg" onClick={scrollToWaitlist} className="text-base px-8 py-6">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
