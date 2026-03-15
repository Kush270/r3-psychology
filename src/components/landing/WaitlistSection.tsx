import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const challenges = [
  "Identifying psychosocial hazards in real time",
  "Meeting WorkSafe compliance requirements",
  "Managing crew wellbeing under tight deadlines",
  "Lack of specialist WHS tools for creative environments",
];

const WaitlistSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    challenge: "",
    budgeting: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("waitlist_submissions").insert({
      name: form.name,
      email: form.email,
      role: form.role || null,
      challenge: form.challenge || null,
      budgeting: form.budgeting || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("You're on the list! We'll be in touch soon.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <section id="waitlist" className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            <CheckCircle className="h-16 w-16 text-clinical mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              You're on the Beta List
            </h2>
            <p className="text-muted-foreground font-body">
              Thank you, {form.name}. We'll reach out with early access details and next steps.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="py-20 lg:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <p className="text-sm font-body font-semibold uppercase tracking-widest text-gold mb-3">
              Get Early Access
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Join the Beta Program
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed">
              Be among the first production teams to use R3 Psychology. Limited beta spots available 
              for Melbourne-based productions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-1.5">Work Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@production.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">Your Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select your role</option>
                <option value="production_manager">Production Manager</option>
                <option value="hr_director">HR Director</option>
                <option value="producer">Producer</option>
                <option value="whs_officer">WHS Officer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">
                What is your biggest challenge in managing psychosocial risk on set?
              </label>
              <select
                name="challenge"
                value={form.challenge}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a challenge</option>
                {challenges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">
                Are you currently budgeting for external WHS audits?
              </label>
              <div className="flex gap-4 font-body text-sm">
                {["Yes", "No", "Exploring options"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="budgeting"
                      value={opt}
                      checked={form.budgeting === opt}
                      onChange={handleChange}
                      className="accent-gold"
                    />
                    <span className="text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button variant="hero" size="lg" type="submit" disabled={submitting} className="w-full text-base py-6 mt-2">
              {submitting ? "Submitting..." : "Get Early Access"}
              {!submitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>

            <p className="text-xs text-muted-foreground text-center font-body">
              Your data is protected under Australian privacy law. We will never share your information.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistSection;
