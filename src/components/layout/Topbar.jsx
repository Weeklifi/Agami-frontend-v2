import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ShieldCheck, LogOut, Menu } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import NotificationPanel from "./NotificationPanel";
import TopbarSearch from "./TopbarSearch";

export default function Topbar({ title, subtitle, actions, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const initial = (user?.first_name || user?.email || "?")[0]?.toUpperCase();
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email;
  const [count, setCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchCount = () =>
    client.get("/api/notifications/unread-count/").then((res) => setCount(res.data.unread)).catch(() => {});

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface/90 px-5 py-3.5 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line text-ink-600 hover:bg-page lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <div className="min-w-0 flex-1 lg:hidden">
            <div className="truncate text-[15px] font-bold text-ink-900">{title}</div>
            {subtitle && <div className="truncate text-xs text-ink-500">{subtitle}</div>}
          </div>
        )}

        <div className="hidden lg:block">
          {user?.role === "TEACHER" && <TopbarSearch />}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {actions}
        {user?.is_staff && (
          <Link
            to="/admin"
            title="Admin dashboard"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-line px-2.5 text-xs font-semibold text-ink-600 hover:bg-page"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Admin
          </Link>
        )}
        <button
          onClick={toggleLang}
          title="Switch language"
          className="flex h-9 items-center gap-1 rounded-xl border border-line px-2.5 text-xs font-semibold text-ink-600 hover:bg-page"
        >
          <span className={lang === "en" ? "text-brand-600" : "text-ink-400"}>EN</span>
          <span className="text-ink-300">/</span>
          <span className={lang === "bn" ? "text-brand-600" : "text-ink-400"}>বাং</span>
        </button>
        <button
          onClick={() => setPanelOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-600 hover:bg-page"
        >
          <Bell className="h-[18px] w-[18px]" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-err px-1 text-[10px] font-semibold text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl grad-brand text-sm font-bold text-white"
          >
            {initial}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
              <div className="border-b border-line px-3.5 py-2.5">
                <p className="truncate text-sm font-semibold text-ink-900">{fullName}</p>
                <p className="truncate text-xs text-ink-400">{user?.role === "TEACHER" ? "Teacher" : "Student"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-err hover:bg-err-bg"
              >
                <LogOut className="h-4 w-4" /> লগআউট
              </button>
            </div>
          )}
        </div>
      </div>

      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} onChanged={fetchCount} />
    </header>
  );
}
