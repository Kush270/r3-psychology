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
            <Route element={<SidebarLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/pilot" element={<Pilot />} />
              <Route path="/members" element={<MembersOnly />} />
              <Route path="/members/neuroscience-of-stress" element={<NeuroscienceOfStress />} />
              <Route path="/members/assessment" element={<Assessment />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
