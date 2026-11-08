import { LayoutDashboard, BookOpen, Wallet } from "lucide-react";

export const studentNavItems = [
  { to: "/student", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/batches", labelKey: "nav.myBatches", icon: BookOpen },
  { to: "/student/payments", labelKey: "nav.payments", icon: Wallet },
];
