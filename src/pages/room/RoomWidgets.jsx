import { useEffect, useState } from "react";
import { CalendarClock, ClipboardCheck, Users } from "lucide-react";
import client from "../../api/client";
import { formatDateTime } from "../../lib/postTypes";
import Avatar from "../../components/ui/Avatar";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function TodayAttendanceWidget({ batchId }) {
  const [summary, setSummary] = useState(undefined);

  useEffect(() => {
    client
      .get(`/api/batches/${batchId}/attendance/?date=${todayStr()}`)
      .then((res) => setSummary(res.data.summary))
      .catch(() => setSummary(null));
  }, [batchId]);

  if (summary === undefined) return null;
  if (!summary || summary.total === 0) return null;

  const pct = Math.round((summary.present / summary.total) * 100);

  return (
    <div className="grad-brand shadow-brand relative overflow-hidden rounded-2xl p-4 text-white">
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-2 text-xs font-semibold text-white/80">
        <ClipboardCheck className="h-4 w-4" /> আজকের হাজিরা
      </div>
      <p className="relative mt-2 text-3xl font-extrabold">{pct}%</p>
      <div className="relative mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="relative mt-2.5 text-xs text-white/80">
        উপস্থিত {summary.present}/{summary.total} জন
        {summary.unmarked > 0 && ` · বাকি ${summary.unmarked}`}
      </p>
    </div>
  );
}

export function RecipientsWidget({ batchId, studentCount }) {
  const [students, setStudents] = useState(null);

  useEffect(() => {
    client
      .get(`/api/batches/${batchId}/students/`)
      .then((res) => setStudents(res.data.filter((s) => s.is_active).slice(0, 4)))
      .catch(() => setStudents([]));
  }, [batchId]);

  if (studentCount === 0) return null;

  return (
    <div className="shadow-soft rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-400">
        <Users className="h-4 w-4" /> প্রাপক
      </div>
      <div className="mt-3 flex items-center">
        {(students || []).map((s, i) => (
          <div key={s.id} className={i > 0 ? "-ml-2" : ""}>
            <Avatar name={s.student_name} size="sm" />
          </div>
        ))}
        {studentCount > (students?.length || 0) && (
          <div className="-ml-2 grid h-7 w-7 place-items-center rounded-full bg-page text-[10px] font-bold text-ink-500 ring-2 ring-surface">
            +{studentCount - (students?.length || 0)}
          </div>
        )}
      </div>
      <p className="mt-2.5 text-xs text-ink-500">
        এই ব্যাচের <span className="font-semibold text-ink-900">{studentCount} জন</span> শিক্ষার্থী
      </p>
    </div>
  );
}

export function UpcomingExamsWidget({ exams }) {
  if (!exams || exams.length === 0) return null;

  return (
    <div className="shadow-soft rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-400">
        <CalendarClock className="h-4 w-4" /> আসন্ন পরীক্ষা
      </div>
      <ul className="mt-3 space-y-2.5">
        {exams.map((p) => (
          <li key={p.id} className="rounded-xl border border-warn/20 bg-warn-bg p-2.5">
            <p className="line-clamp-1 text-xs font-semibold leading-snug text-ink-900">{p.title}</p>
            <p className="mt-1 text-[11px] text-warn">{formatDateTime(p.event_date)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
