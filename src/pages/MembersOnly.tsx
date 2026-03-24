import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Navigate } from "react-router-dom";

function GuestView({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-8">
      <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
        Members Only
      </h1>
      <p className="text-muted-foreground font-body text-lg leading-relaxed">
        Access exclusive psychology research, neuroscience insights, and clinical deep-dives.
        Verify your email to continue.
      </p>
      <Button onClick={onOpenAuth} size="lg" className="rounded-full">
        Sign Up or Log In
      </Button>
    </div>
  );
}

const MembersOnly = () => {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setAuthOpen(true);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/members/neuroscience-of-stress" replace />;
  }

  return (
    <>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <GuestView onOpenAuth={() => setAuthOpen(true)} />
    </>
  );
};

export default MembersOnly;
