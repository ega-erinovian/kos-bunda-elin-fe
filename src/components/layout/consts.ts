import {
  CreditCard,
  DoorOpen,
  History,
  Home,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react";

export const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export const mobileNavItems = [
  { href: "/admin/dashboard", label: "Home", icon: Home },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/payments", label: "History", icon: History },
  { href: "#", label: "Profile", icon: User },
];
