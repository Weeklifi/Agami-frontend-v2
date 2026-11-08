import {
  LayoutDashboard,
  Layers,
  MessageSquareText,
  CreditCard,
  Settings,
} from "lucide-react";

export const teacherNavItems = [
  { to: "/teacher", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/teacher/batches", labelKey: "nav.batchesClasses", icon: Layers },
  { to: "/teacher/sms", labelKey: "nav.bulkBroadcast", icon: MessageSquareText },
  { to: "/teacher/subscription", labelKey: "nav.subscription", icon: CreditCard },
  { to: "/teacher/profile", labelKey: "nav.settings", icon: Settings },
];
