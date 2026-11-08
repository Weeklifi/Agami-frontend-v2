import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Plus } from "lucide-react";
import { useMyBatches } from "../../api/queries";
import AppShell from "../../components/layout/AppShell";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import BatchCard from "../../components/BatchCard";
import JoinByCodeModal from "./JoinByCodeModal";
import { studentNavItems } from "./navItems";

export default function MyBatches() {
  const navigate = useNavigate();
  const { data: batches = [], isLoading: loading, refetch } = useMyBatches();
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <AppShell navItems={studentNavItems} title="আমার Batch">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-600">{loading ? "লোড হচ্ছে…" : `${batches.length}টি batch`}</p>
        <Button className="px-4" onClick={() => setJoinOpen(true)}>
          <Plus className="h-4 w-4" /> Join
        </Button>
      </div>

      {!loading && batches.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="এখনো কোনো batch নেই"
          subtitle="Invite Code দিয়ে নতুন ব্যাচে যোগ দিয়ে ক্লাস শুরু করুন"
          actionLabel="Join করুন"
          onAction={() => setJoinOpen(true)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b) => (
          <BatchCard
            key={b.id}
            batch={b}
            onClick={() => navigate(`/student/batches/${b.id}`, { state: { batch: b } })}
            meta={
              <p className="flex items-center gap-1.5 truncate text-xs text-ink-500">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {b.teacher_name}
              </p>
            }
          />
        ))}
      </div>

      <JoinByCodeModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoined={refetch} />
    </AppShell>
  );
}
