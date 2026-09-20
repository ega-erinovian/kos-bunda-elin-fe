import {
  CreditCard,
  DoorOpen,
  History,
  Home,
  LayoutDashboard,
  User,
  Users,
  Wallet,
  Tag,
  FileText,
  Shield,
  Receipt,
  HandCoins,
} from "lucide-react";

export const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/finance/accounts", label: "Finance Accounts", icon: Wallet },
  { href: "/admin/finance/categories", label: "Finance Categories", icon: Tag },
  { href: "/admin/finance/transactions", label: "Transactions", icon: FileText },
  { href: "/admin/finance/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/finance/receivables", label: "Receivables", icon: HandCoins },
  { href: "/admin/finance/audit-log", label: "Audit Log", icon: Shield },
];

export const mobileNavItems = [
  { href: "/admin/dashboard", label: "Home", icon: Home },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/payments", label: "History", icon: History },
  { href: "#", label: "Profile", icon: User },
];
