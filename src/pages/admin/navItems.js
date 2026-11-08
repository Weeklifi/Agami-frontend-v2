import { Wallet, ArrowLeft } from "lucide-react";

export const adminNavItems = [
  { to: "/admin", labelKey: "nav.adminSubscriptions", icon: Wallet, end: true },
  { to: "/teacher", labelKey: "nav.adminBackToApp", icon: ArrowLeft },
];
