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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { CommandDialog } from "@/components/ui/command"; // ✅ cmdk wrapper

interface DashboardLayoutProps {
  children: ReactNode;
}

// Sample nav items
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
  const [openCommand, setOpenCommand] = useState(false);

  // Fake user
  const user = {
    name: "John Doe",
    email: "john@zulu.ai",
    avatar: "https://i.pravatar.cc/150?img=32",
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={cn(
          "border-r bg-card flex flex-col overflow-hidden shadow-md hidden md:flex"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
            >
              🚀 Zulu AI
            </motion.span>
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

        <nav className="flex-1 p-2 space-y-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);

            return (
              <motion.div
                key={item.name}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-4 border-t text-xs text-muted-foreground text-center">
          {!collapsed && "v1.0.0"}
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <header className="h-16 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-2">
            <input
              placeholder="Search (⌘K)"
              onFocus={() => setOpenCommand(true)}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>🚀 New app generated</DropdownMenuItem>
                <DropdownMenuItem>💳 Billing updated</DropdownMenuItem>
                <DropdownMenuItem>⚡ System status: All good</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => console.log("Logout clicked")}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand} />
    </div>
  );
};
