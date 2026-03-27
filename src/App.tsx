import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import SidebarLayout from "./layouts/SidebarLayout";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Pilot from "./pages/Pilot";
import MembersOnly from "./pages/MembersOnly";
import NeuroscienceOfStress from "./pages/NeuroscienceOfStress";
import Assessment from "./pages/Assessment";
import AssessmentResults from "./pages/AssessmentResults";
import Audit from "./pages/Audit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<SidebarLayout />}>
              <Route path="/blog" element={<Blog />} />
              <Route path="/pilot" element={<Pilot />} />
              <Route path="/members" element={<MembersOnly />} />
              <Route path="/members/neuroscience-of-stress" element={<NeuroscienceOfStress />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/assessment/results" element={<AssessmentResults />} />
              <Route path="/members/assessment" element={<Assessment />} />
              <Route path="/audit" element={<Audit />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
