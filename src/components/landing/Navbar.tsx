import { Button } from "@/components/ui/button";

const Navbar = () => {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-5">
      <div className="container flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-primary-foreground">
            R3<span className="text-gold">.</span>
          </h2>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary-foreground/50">Resolve · Renew · Recover</p>
        </div>
        <Button variant="hero" size="sm" onClick={scrollToWaitlist} className="px-6">
          Get Early Access
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
