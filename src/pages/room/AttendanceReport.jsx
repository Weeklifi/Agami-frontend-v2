import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import client from "../../api/client";
import Avatar from "../../components/ui/Avatar";

const monthStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function AttendanceReport({ batchId }) {
  const [month, setMonth] = useState(new Date());
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    setData(null);
    client.get(`/api/batches/${batchId}/attendance/monthly/?month=${monthStr(month)}`).then((res) => setData(res.data));
  }, [batchId, month]);

  useEffect(load, [load]);

  const shiftMonth = (delta) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(d);
  };

  const tone = (pct) => (pct >= 80 ? "text-ok" : pct >= 60 ? "text-warn" : "text-err");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">{month.toLocaleString("bn-BD", { month: "long", year: "numeric" })}</span>
        <button onClick={() => shiftMonth(1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {data === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : data.total_classes === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">এই মাসে কোনো ক্লাসের হাজিরা নেওয়া হয়নি।</p>
      ) : (
        <>
          <p className="text-center text-xs text-ink-600">
            এই মাসে মোট <strong>{data.total_classes}</strong>টি ক্লাস
          </p>

          <ul className="shadow-soft divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {data.students.map((st) => (
              <li key={st.student_name} className="flex items-center gap-2.5 px-3 py-2.5">
                <Avatar name={st.student_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{st.student_name}</p>
                  <p className="text-xs text-ink-400">
                    <span className="text-ok">✓ {st.present}</span> · <span className="text-err">✗ {st.absent}</span>
                    {st.unmarked > 0 && ` · বাকি ${st.unmarked}`}
                  </p>
                </div>
                <p className={`shrink-0 text-lg font-extrabold ${tone(st.percentage)}`}>{st.percentage}%</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
