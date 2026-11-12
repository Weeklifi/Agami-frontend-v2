import { useEffect, useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { GraduationCap, LogOut, Sparkles } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function Sidebar({ items, activeKey, brand = "CoachDesk", tagline = "Academic Operations" }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);

  useEffect(() => {
    if (user?.role !== "TEACHER") return;
    client.get("/api/subscriptions/me/").then((res) => setSub(res.data)).catch(() => {});
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const daysLeft = sub?.active ? Math.max(0, Math.ceil((new Date(sub.subscription.end_date) - new Date()) / 86400000)) : null;
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email;
  const roleLabel = user?.role === "TEACHER" ? "Academic Director" : "Student";

  return (
    <aside className="hidden h-dvh w-64 shrink-0 flex-col bg-sidebar text-white lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl grad-brand">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight">{brand}</div>
          <div className="text-[11px] text-white/50">{tagline}</div>
        </div>
      </div>

      {sub?.active && sub.subscription?.is_trial && (
        <div className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Pro Trial · {daysLeft} days left
          </span>
          <Link to="/teacher/plans" className="text-[11px] font-semibold text-brand-200 hover:text-white">Upgrade</Link>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item, i) =>
          item.onClick ? (
            <button
              key={`${item.key}-${i}`}
              onClick={item.onClick}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors
                ${activeKey === item.key
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label ?? t(item.labelKey)}
            </button>
          ) : (
            <NavLink
              key={`${item.to}-${i}`}
              to={item.to}
              end={item.end}
              state={item.state}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label ?? t(item.labelKey)}
            </NavLink>
          )
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div className="grad-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
            {(user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{fullName}</p>
            <p className="truncate text-[11px] text-white/50">{roleLabel}</p>
          </div>
          <button onClick={handleLogout} title="লগআউট" className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
