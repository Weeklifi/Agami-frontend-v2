import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/layout/AppShell";
import { formatDateTime } from "../lib/postTypes";
import { teacherNavItems } from "./teacher/navItems";
import { studentNavItems } from "./student/navItems";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const navItems = user?.role === "TEACHER" ? teacherNavItems : studentNavItems;
  const [items, setItems] = useState(null);

  const load = () => {
    client.get("/api/notifications/").then((res) => setItems(res.data.results || res.data)).catch(() => setItems([]));
  };

  useEffect(load, []);

  const openItem = async (n) => {
    if (!n.is_read) await client.post(`/api/notifications/${n.id}/read/`).catch(() => {});
    if (n.link) navigate(n.link);
    load();
  };

  const markAllRead = async () => {
    await client.post("/api/notifications/read-all/").catch(() => {});
    load();
  };

  return (
    <AppShell navItems={navItems} title="Notifications">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink-900">Notifications</h1>
          <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
            <Check className="h-3.5 w-3.5" /> সব পড়া হয়েছে
          </button>
        </div>

        {items === null ? (
          <p className="py-8 text-center text-sm text-ink-400">লোড হচ্ছে…</p>
        ) : items.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-page text-ink-400">
              <Bell className="h-7 w-7" />
            </div>
            <p className="text-sm text-ink-400">কোনো notification নেই</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => openItem(n)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${n.is_read ? "border-line bg-surface" : "border-brand-100 bg-brand-50 hover:border-brand-500"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm text-ink-900 ${n.is_read ? "" : "font-semibold"}`}>{n.title}</p>
                  {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                </div>
                {n.body && <p className="mt-1 text-xs leading-relaxed text-ink-600">{n.body}</p>}
                <p className="mt-2 text-xs text-ink-400">{formatDateTime(n.created_at)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
