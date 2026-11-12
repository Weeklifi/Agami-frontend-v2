import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Search, UserPlus, MessageSquare, Users } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import BatchSubnav from "../../components/BatchSubnav";
import InviteModal from "./InviteModal";
import { batchSidebarItems } from "../../lib/batchNav";
import { teacherNavItems } from "./navItems";

const PAGE_SIZE = 10;

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const TABS = [
  { id: "all", label: "সব" },
  { id: "active", label: "সক্রিয়" },
  { id: "inactive", label: "নিষ্ক্রিয়" },
  { id: "new", label: "এই মাসের নতুন" },
];

export default function StudentListPage() {
  const { id } = useParams();
  const location = useLocation();

  const [batch, setBatch] = useState(location.state?.batch ?? null);
  const [students, setStudents] = useState(null);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    client.get(`/api/batches/${id}/`).then((res) => setBatch(res.data)).catch(() => {});
  }, [id]);

  const loadStudents = useCallback(() => {
    client.get(`/api/batches/${id}/students/`).then((res) => setStudents(res.data)).catch(() => setStudents([]));
  }, [id]);

  useEffect(loadStudents, [loadStudents]);

  const rows = useMemo(() => {
    const list = students || [];
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (status === "active" && !s.is_active) return false;
      if (status === "inactive" && s.is_active) return false;
      if (status === "new" && !isThisMonth(s.joined_at)) return false;
      if (!q) return true;
      return [s.student_name, s.student_email, s.student_phone, s.guardian_name, s.guardian_phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [students, status, query]);

  useEffect(() => { setPage(1); }, [status, query]);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const sidebarItems = batch ? batchSidebarItems(batch, true) : teacherNavItems;

  return (
    <AppShell navItems={teacherNavItems} sidebarItems={sidebarItems} title="Students">
      {batch ? <BatchSubnav batch={batch} isTeacher /> : <div className="mb-5 h-24 animate-pulse rounded-xl bg-line-soft" />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatus(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
                ${status === tab.id ? "bg-brand-600 text-white" : "border border-line bg-surface text-ink-600 hover:bg-page"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, ফোন বা অভিভাবক দিয়ে খুঁজুন…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-page/60 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3">শিক্ষার্থী</th>
                <th className="px-4 py-3">ফোন</th>
                <th className="px-4 py-3">অভিভাবক</th>
                <th className="px-4 py-3">অভিভাবকের ফোন</th>
                <th className="px-4 py-3">যোগদান</th>
                <th className="px-4 py-3">অবস্থা</th>
                <th className="px-4 py-3 text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students === null ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-400">লোড হচ্ছে…</td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-ink-900">
                      {query || status !== "all" ? "কোনো মিল পাওয়া যায়নি" : "এখনো কোনো শিক্ষার্থী নেই"}
                    </p>
                    {!query && status === "all" && (
                      <button
                        onClick={() => setInviteOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-surface px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                      >
                        <UserPlus className="h-4 w-4" /> Invite করুন
                      </button>
                    )}
                  </div>
                </td></tr>
              ) : (
                pageRows.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-page/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.student_name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{s.student_name}</p>
                          <p className="truncate text-xs text-ink-400">{s.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">{s.student_phone || "—"}</td>
                    <td className="px-4 py-3 text-ink-600">{s.guardian_name || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-400">{s.guardian_phone || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-400">{fmtDate(s.joined_at)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={s.is_active ? "ok" : "neutral"}>{s.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button title="Message" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-400 hover:bg-brand-50 hover:text-brand-600">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <p className="text-xs text-ink-400">
              মোট {total} জনের মধ্যে {start + 1}-{Math.min(start + PAGE_SIZE, total)}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-600 transition-colors hover:bg-page disabled:opacity-40"
              >
                আগে
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[2rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors
                    ${p === current ? "bg-brand-600 text-white" : "border border-line text-ink-600 hover:bg-page"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-600 transition-colors hover:bg-page disabled:opacity-40"
              >
                পরে
              </button>
            </div>
          </div>
        )}
      </Card>

      <InviteModal open={inviteOpen} onClose={() => { setInviteOpen(false); loadStudents(); }} batchId={id} />
    </AppShell>
  );
}
