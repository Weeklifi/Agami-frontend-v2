import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, Check, X } from "lucide-react";
import client from "../../api/client";

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "এইমাত্র";
  if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
  return `${Math.floor(diff / 86400)} দিন আগে`;
};

export default function NotificationPanel({ open, onClose, onChanged }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  const load = () => {
    client
      .get("/api/notifications/")
      .then((res) => setItems(res.data.results || res.data))
      .catch(() => setItems([]));
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  if (!open) return null;

  const openItem = async (n) => {
    if (!n.is_read) {
      await client.post(`/api/notifications/${n.id}/read/`).catch(() => {});
      onChanged?.();
    }
    onClose();
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await client.post("/api/notifications/read-all/").catch(() => {});
    load();
    onChanged?.();
  };

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/30" />
      <div
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-bold text-ink-900">Notifications</h2>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              <Check className="h-3.5 w-3.5" /> সব পড়া হয়েছে
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-page" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
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
            <ul className="divide-y divide-line">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openItem(n)}
                    className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-page ${!n.is_read ? "bg-brand-50/40" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"} text-ink-900`}>{n.title}</p>
                        {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-ink-600">{n.body}</p>}
                        <p className="mt-1 text-[11px] text-ink-400">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line p-3">
          <button
            onClick={() => { onClose(); navigate("/notifications"); }}
            className="block w-full rounded-xl py-2 text-center text-sm font-semibold text-brand-600 hover:bg-page"
          >
            সব Notification দেখুন
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
