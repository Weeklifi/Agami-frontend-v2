import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Plus, Search, Archive, RotateCcw } from "lucide-react";
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
    <AppShell navItems={teacherNavItems} title="Batches & Classes" subtitle={`মোট ${batches.length}টি batch`}>
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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

      <CreateBatchModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refetch} />
    </AppShell>
  );
}
