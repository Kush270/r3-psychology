import { Home, Rocket, BookOpen, Lock, Brain, ClipboardCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const guestItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Blog", url: "/blog", icon: BookOpen },
  { title: "Members Only", url: "/members", icon: Lock },
  { title: "Join the Pilot Program", url: "/pilot", icon: Rocket },
];

const memberItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "The Neuroscience of Stress", url: "/members/neuroscience-of-stress", icon: Brain },
  { title: "Compliance Assessment", url: "/members/assessment", icon: ClipboardCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const collapsed = state === "collapsed";
  const items = user ? memberItems : guestItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-xs">
            R3 Psychology
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
