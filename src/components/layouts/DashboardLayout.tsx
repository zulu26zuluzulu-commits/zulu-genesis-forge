// src/components/layouts/DashboardLayout.tsx
import { ReactNode } from "react";
import {
  Home,
  FileCode,
  CreditCard,
  Settings,
  Activity,
  Menu,
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

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Workspace", href: "/workspace", icon: FileCode },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Status", href: "/status", icon: Activity },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center justify-center border-b font-bold text-xl">
          🚀 Zulu AI
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t text-xs text-muted-foreground">
          v1.0.0
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <header className="h-16 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
            <input
              placeholder="Search (⌘K)"
              className="px-3 py-2 border rounded-md text-sm bg-muted"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon">
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
                <DropdownMenuItem>Log out</DropdownMenuItem>
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
