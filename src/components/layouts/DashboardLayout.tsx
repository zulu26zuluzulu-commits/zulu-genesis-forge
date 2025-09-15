// src/components/layouts/DashboardLayout.tsx
import { ReactNode, useState } from "react";
import {
  Home,
  Sparkles,
  FileCode,
  LayoutDashboard,
  CreditCard,
  Activity,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "App Generator", href: "/generator", icon: Sparkles },
  { name: "Workspace", href: "/workspace", icon: FileCode },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Status", href: "/status", icon: Activity },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r bg-card flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              🚀 Zulu AI
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t text-xs text-muted-foreground text-center">
          {!collapsed && "v1.0.0"}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <header className="h-16 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-2">
            <input
              placeholder="Search (⌘K)"
              className="px-3 py-2 border rounded-md text-sm bg-muted w-64"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="w-5 h-5 dark:hidden" />
              <Moon className="w-5 h-5 hidden dark:block" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
