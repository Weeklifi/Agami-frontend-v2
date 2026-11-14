import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Users, Plus, Search, Archive, RotateCcw,
  Calculator, Atom, FlaskConical, MoreVertical, ArrowRight,
} from "lucide-react";
import { useTeacherBatches, useToggleArchive } from "../../api/queries";
import AppShell from "../../components/layout/AppShell";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import BatchCard from "../../components/BatchCard";
import CreateBatchModal from "./CreateBatchModal";
import { teacherNavItems } from "./navItems";

const TABS = [
  { id: "active", label: "সক্রিয়" },
  { id: "archived", label: "আর্কাইভ" },
  { id: "all", label: "সব" },
];

const SECTION_LABEL = {
  active: "সক্রিয় ব্যাচ",
  archived: "আর্কাইভ করা ব্যাচ",
  all: "সব ব্যাচ",
};

function subjectStyle(subject = "") {
  const s = subject.toLowerCase();
  if (s.includes("math")) return { icon: Calculator, bg: "bg-indigo-100", fg: "text-indigo-600" };
  if (s.includes("phys")) return { icon: Atom, bg: "bg-teal-100", fg: "text-teal-600" };
  if (s.includes("chem")) return { icon: FlaskConical, bg: "bg-orange-100", fg: "text-orange-600" };
  return { icon: BookOpen, bg: "bg-brand-100", fg: "text-brand-600" };
}

function MobileBatchCard({ batch, onOpen, onToggleArchive, busy }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isDummy = batch.name?.startsWith("[DUMMY]");
  const displayName = isDummy ? batch.name.replace(/^\[DUMMY\]\s*/, "") : batch.name;
  const { icon: SubjectIcon, bg, fg } = subjectStyle(batch.subject);

  return (
    <div className="shadow-soft relative rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${bg} ${fg}`}>
            <SubjectIcon className="h-[18px] w-[18px]" />
          </span>
          {batch.subject && <span className="text-sm font-medium text-ink-500">{batch.subject}</span>}
          {isDummy && (
            <span className="rounded-md bg-page px-1.5 py-0.5 text-[10px] font-semibold text-ink-400">[DUMMY]</span>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 hover:bg-page"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onToggleArchive(e, batch); }}
                  disabled={busy}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium
                    ${batch.is_active ? "text-ink-700 hover:bg-page" : "text-ok hover:bg-ok-bg"}`}
                >
                  {batch.is_active ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  {batch.is_active ? "আর্কাইভ করুন" : "পুনরায় চালু করুন"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <button onClick={onOpen} className="block w-full text-left">
        <h3 className="line-clamp-1 text-[17px] font-bold text-ink-900">{displayName}</h3>
      </button>

      <div className="my-3 h-px bg-line" />

      <button onClick={onOpen} className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-ink-500">
          <Users className="h-3.5 w-3.5" /> {batch.student_count} জন শিক্ষার্থী
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
          ব্যাচ খুলুন <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  );
}

export default function Batches() {
  const navigate = useNavigate();
  const { data: batches = [], isLoading: loading, refetch } = useTeacherBatches();
  const toggleArchiveMutation = useToggleArchive();
  const [createOpen, setCreateOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("active");
  const [busyId, setBusyId] = useState(null);

  const toggleArchive = async (e, batch) => {
    e.stopPropagation();
    setBusyId(batch.id);
    try {
      await toggleArchiveMutation.mutateAsync({ id: batch.id, is_active: !batch.is_active });
    } finally {
      setBusyId(null);
    }
  };

  const shown = batches
    .filter((b) => (tab === "active" ? b.is_active : tab === "archived" ? !b.is_active : true))
    .filter((b) => b.name?.toLowerCase().includes(q.toLowerCase()) || b.subject?.toLowerCase().includes(q.toLowerCase()));

  const activeCount = batches.filter((b) => b.is_active).length;
  const archivedCount = batches.filter((b) => !b.is_active).length;

  return (
    <AppShell navItems={teacherNavItems} title="ব্যাচ ও ক্লাস" subtitle={`মোট ${batches.length}টি batch`}>
      {/* ---------- Desktop / tablet (lg+) ---------- */}
      <div className="hidden lg:block">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
                  ${tab === t.id ? "bg-brand-600 text-white" : "border border-line bg-surface text-ink-600 hover:bg-page"}`}
              >
                {t.label}
                {t.id === "active" && ` (${activeCount})`}
                {t.id === "archived" && ` (${archivedCount})`}
              </button>
            ))}
          </div>
          <Button className="px-4" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> নতুন batch
          </Button>
        </div>

        {batches.length > 4 && (
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ব্যাচ খুঁজুন…"
              className="w-full rounded-xl border border-line bg-surface py-3 pl-9 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        )}

        {!loading && shown.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title={tab === "archived" ? "আর্কাইভে কোনো batch নেই" : "এখনো কোনো batch নেই"}
            subtitle={tab === "archived" ? "বন্ধ করা batch এখানে দেখা যাবে" : "প্রথম batch তৈরি করে ছাত্রছাত্রীদের যুক্ত করুন"}
            actionLabel={tab !== "archived" ? "batch তৈরি করুন" : undefined}
            onAction={tab !== "archived" ? () => setCreateOpen(true) : undefined}
          />
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {shown.map((b) => (
            <BatchCard
              key={b.id}
              batch={b}
              onClick={() => navigate(`/teacher/batches/${b.id}`)}
              meta={<p className="truncate text-xs text-ink-500">{b.subject || "Room খুলতে ক্লিক করুন"}</p>}
              footer={
                <div className="flex w-full items-center justify-between px-2 py-1">
                  <Badge tone="brand">
                    <Users className="h-3.5 w-3.5" /> {b.student_count}
                  </Badge>
                  <button
                    onClick={(e) => toggleArchive(e, b)}
                    disabled={busyId === b.id}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors
                      ${b.is_active ? "text-ink-500 hover:bg-page hover:text-err" : "text-ok hover:bg-ok-bg"}`}
                    title={b.is_active ? "আর্কাইভ করুন" : "পুনরায় চালু করুন"}
                  >
                    {b.is_active ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    {b.is_active ? "আর্কাইভ" : "চালু করুন"}
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </div>

      {/* ---------- Mobile (<lg) ---------- */}
      <div className="lg:hidden">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ব্যাচ খুঁজুন"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button size="md" className="shrink-0 px-3.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> নতুন ব্যাচ
          </Button>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl bg-page p-1">
          {TABS.map((t) => {
            const count = t.id === "active" ? activeCount : t.id === "archived" ? archivedCount : batches.length;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors
                  ${isActive ? "bg-surface text-brand-600 shadow-sm" : "text-ink-500"}`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold
                    ${isActive ? "bg-brand-100 text-brand-700" : "bg-line-soft text-ink-400"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink-900">{SECTION_LABEL[tab]}</h2>
          <span className="text-xs text-ink-400">{shown.length}টি</span>
        </div>

        {!loading && shown.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={tab === "archived" ? "আর্কাইভে কোনো batch নেই" : "এখনো কোনো batch নেই"}
            subtitle={tab === "archived" ? "বন্ধ করা batch এখানে দেখা যাবে" : "প্রথম batch তৈরি করে ছাত্রছাত্রীদের যুক্ত করুন"}
            actionLabel={tab !== "archived" ? "batch তৈরি করুন" : undefined}
            onAction={tab !== "archived" ? () => setCreateOpen(true) : undefined}
          />
        ) : (
          <div className="space-y-3">
            {shown.map((b) => (
              <MobileBatchCard
                key={b.id}
                batch={b}
                onOpen={() => navigate(`/teacher/batches/${b.id}`)}
                onToggleArchive={toggleArchive}
                busy={busyId === b.id}
              />
            ))}
          </div>
        )}

        {shown.length > 0 && (
          <p className="mt-4 text-center text-xs text-ink-400">সবগুলো ব্যাচ দেখানো হচ্ছে</p>
        )}
      </div>

      <CreateBatchModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refetch} />
    </AppShell>
  );
}
