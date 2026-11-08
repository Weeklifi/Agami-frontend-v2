import { NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useLanguage } from "../../context/LanguageContext";

export default function AppShell({ navItems, title, subtitle, actions, children }) {
  const { t } = useLanguage();
  return (
    <div className="flex h-dvh overflow-hidden bg-page">
      <Sidebar items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} actions={actions} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 pb-20 sm:px-6 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — একই route-এ একাধিকবার না দেখিয়ে unique link গুলো দেখাই */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-line bg-surface/95 py-1.5 backdrop-blur lg:hidden">
        {navItems
          .filter((item, i, arr) => arr.findIndex((o) => o.to === item.to) === i)
          .slice(0, 5)
          .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium
              ${isActive ? "text-brand-600" : "text-ink-400"}`
            }
          >
            <item.icon className="h-5 w-5" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
