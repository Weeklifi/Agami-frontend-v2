import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import MiniStat from "../../components/ui/MiniStat";

const todayStr = () => new Date().toISOString().slice(0, 10);

const summarize = (records) => ({
  total: records.length,
  present: records.filter((r) => r.status === "PRESENT").length,
  absent: records.filter((r) => r.status === "ABSENT").length,
  unmarked: records.filter((r) => r.status === "UNMARKED").length,
});

export default function AttendanceSheet({ batchId }) {
  const [date, setDate] = useState(todayStr());
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    setSheet(null);
    client
      .get(`/api/batches/${batchId}/attendance/?date=${date}`)
      .then((res) => setSheet(res.data))
      .catch(() => setSheet({ records: [], summary: null }));
  }, [batchId, date]);

  useEffect(load, [load]);

  // সার্ভারে POST করার আগেই UI-তে status বদলে দিই (optimistic) —
  // পুরো sheet আবার GET করে reload করলে পুরো লিস্ট মুহূর্তের জন্য উধাও
  // হয়ে "লোড হচ্ছে…" দেখায়, বড় batch-এ এটা ধীর মনে হয়। ব্যর্থ হলে load() দিয়ে revert করি।
  const applyLocally = (updates) => {
    setSheet((prev) => {
      if (!prev) return prev;
      const records = prev.records.map((r) =>
        r.id in updates ? { ...r, status: updates[r.id] } : r
      );
      return { ...prev, records, summary: summarize(records) };
    });
  };

  const mark = async (recordId, status) => {
    setBusy(recordId);
    applyLocally({ [recordId]: status });
    try {
      await client.post(`/api/attendance/records/${recordId}/mark/`, { status });
    } catch {
      load();
    } finally {
      setBusy(null);
    }
  };

  const markAllPresent = async () => {
    const unmarked = sheet.records.filter((r) => r.status === "UNMARKED");
    setBusy("all");
    applyLocally(Object.fromEntries(unmarked.map((r) => [r.id, "PRESENT"])));
    try {
      await Promise.all(unmarked.map((r) => client.post(`/api/attendance/records/${r.id}/mark/`, { status: "PRESENT" })));
    } catch {
      load();
    } finally {
      setBusy(null);
    }
  };

  const shiftDay = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  if (sheet === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  const s = sheet.summary;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => shiftDay(-1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button onClick={() => shiftDay(1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {s && (
        <div className="grid grid-cols-4 gap-2">
          <MiniStat value={s.present} label="উপস্থিত" tone="ok" />
          <MiniStat value={s.absent} label="অনুপস্থিত" tone="err" />
          <MiniStat value={s.unmarked} label="বাকি" tone="warn" />
          <MiniStat value={s.total} label="মোট" />
        </div>
      )}

      {s?.unmarked > 0 && (
        <Button variant="secondary" size="sm" loading={busy === "all"} onClick={markAllPresent}>
          <Check className="h-4 w-4" /> বাকি {s.unmarked} জনকে উপস্থিত ধরুন
        </Button>
      )}

      {sheet.records.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">এই batch-এ কোনো শিক্ষার্থী নেই।</p>
      ) : (
        <ul className="shadow-soft divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {sheet.records.map((r) => (
            <li key={r.id} className="flex items-center gap-2.5 px-3 py-2.5">
              <Avatar name={r.student_name} size="sm" />
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">{r.student_name}</p>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => mark(r.id, "PRESENT")}
                  disabled={busy === r.id}
                  className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors
                    ${r.status === "PRESENT" ? "border-ok bg-ok text-white" : "border-line text-ink-400 hover:border-ok hover:text-ok"}`}
                  title="উপস্থিত"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => mark(r.id, "ABSENT")}
                  disabled={busy === r.id}
                  className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors
                    ${r.status === "ABSENT" ? "border-err bg-err text-white" : "border-line text-ink-400 hover:border-err hover:text-err"}`}
                  title="অনুপস্থিত"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
