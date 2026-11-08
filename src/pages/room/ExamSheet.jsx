import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, UserX } from "lucide-react";
import client from "../../api/client";
import Avatar from "../../components/ui/Avatar";

export default function ExamSheet({ exam, onBack }) {
  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    client.get(`/api/results/exams/${exam.id}/sheet/`).then((res) => {
      setData(res.data);
      const d = {};
      res.data.results.forEach((r) => { d[r.id] = r.marks !== null ? String(r.marks) : ""; });
      setDrafts(d);
    });
  }, [exam.id]);

  useEffect(load, [load]);

  const save = async (resultId, isAbsent = false) => {
    setBusy(resultId);
    try {
      await client.post(`/api/results/records/${resultId}/mark/`, { marks: isAbsent ? null : drafts[resultId] || null, is_absent: isAbsent });
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "সংরক্ষণ করা যায়নি।");
    } finally {
      setBusy(null);
    }
  };

  if (data === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4" /> পরীক্ষার তালিকায় ফিরুন
      </button>

      <div>
        <h3 className="text-sm font-bold">{exam.name}</h3>
        <p className="text-xs text-ink-400">পূর্ণমান {exam.total_marks}</p>
      </div>

      <ul className="shadow-soft divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {data.results.map((r) => (
          <li key={r.id} className="flex items-center gap-2.5 px-3 py-2.5">
            <Avatar name={r.student_name} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{r.student_name}</p>

            {r.is_absent ? (
              <span className="rounded-lg bg-err-bg px-2.5 py-1 text-xs font-semibold text-err">অনুপস্থিত</span>
            ) : (
              <>
                {r.percentage !== null && <span className="w-10 text-right text-xs text-ink-400">{r.percentage}%</span>}
                <input
                  type="number"
                  value={drafts[r.id] ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                  onBlur={() => {
                    const orig = r.marks !== null ? String(r.marks) : "";
                    if (drafts[r.id] !== orig) save(r.id);
                  }}
                  placeholder="—"
                  className="w-14 rounded-lg border border-line px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </>
            )}

            <button
              onClick={() => save(r.id, !r.is_absent)}
              disabled={busy === r.id}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors
                ${r.is_absent ? "border-err bg-err-bg text-err" : "border-line text-ink-400 hover:border-err hover:text-err"}`}
              title="অনুপস্থিত হিসেবে চিহ্নিত করুন"
            >
              <UserX className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <p className="text-center text-xs text-ink-400">নম্বর লিখে অন্য জায়গায় ক্লিক করলেই সংরক্ষিত হবে</p>
    </div>
  );
}
