import { Button } from "@/components/ui/button";

const Navbar = () => {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-5">
      <div className="container flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-primary-foreground">
          Vantage<span className="text-gold">.</span>
        </h2>
        <Button variant="hero" size="sm" onClick={scrollToWaitlist} className="px-6">
          Get Early Access
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
