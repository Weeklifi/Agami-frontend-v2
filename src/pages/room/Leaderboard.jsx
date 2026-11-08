import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Trophy } from "lucide-react";
import client from "../../api/client";
import Avatar from "../../components/ui/Avatar";

const medal = (rank) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null);

const rankStyle = (rank) => {
  if (rank === 1) return "bg-warn-bg text-warn";
  if (rank === 2) return "bg-page text-ink-600";
  if (rank === 3) return "bg-orange-100 text-orange-700";
  return "bg-page text-ink-400";
};

function BackBtn({ onBack, label = "ফিরে যান" }) {
  return (
    <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
      <ChevronLeft className="h-4 w-4" /> {label}
    </button>
  );
}

export default function Leaderboard({ exam, isTeacher, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    client
      .get(`/api/results/exams/${exam.id}/leaderboard/`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || "লোড করা যায়নি।"));
  }, [exam.id]);

  useEffect(load, [load]);

  if (error) {
    return (
      <div className="space-y-3">
        <BackBtn onBack={onBack} />
        <p className="py-6 text-center text-sm text-ink-400">{error}</p>
      </div>
    );
  }

  if (data === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  const rows = isTeacher ? data.ranking : data.leaderboard;

  return (
    <div className="space-y-4">
      <BackBtn onBack={onBack} label="পরীক্ষার তালিকায় ফিরুন" />

      <div>
        <h3 className="text-sm font-bold">{data.exam.name}</h3>
        <p className="text-xs text-ink-400">
          পূর্ণমান {data.exam.total_marks}
          {!isTeacher && ` · ${data.total_students} জন অংশ নিয়েছে`}
        </p>
      </div>

      {!isTeacher && data.my_result && (
        <div className="grad-brand shadow-brand rounded-2xl p-5 text-center text-white">
          {data.my_result.is_absent ? (
            <p className="text-sm font-medium">আপনি এই পরীক্ষায় অনুপস্থিত ছিলেন</p>
          ) : data.my_result.marks === null ? (
            <p className="text-sm opacity-90">আপনার নম্বর এখনো দেওয়া হয়নি</p>
          ) : (
            <>
              <p className="text-xs opacity-90">আপনার নম্বর</p>
              <p className="mt-1 text-3xl font-extrabold">
                {data.my_result.marks}
                <span className="text-base font-normal opacity-80">/{data.exam.total_marks}</span>
              </p>
              <p className="mt-1 text-sm opacity-90">
                {data.my_result.percentage}% · অবস্থান <strong>{data.my_result.rank}</strong> / {data.total_students}
              </p>
            </>
          )}
        </div>
      )}

      {!isTeacher && !data.show_leaderboard ? (
        <p className="py-4 text-center text-xs text-ink-400">এই পরীক্ষার leaderboard প্রকাশ করা হয়নি।</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">এখনো কারো নম্বর দেওয়া হয়নি।</p>
      ) : (
        <>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-600">
            <Trophy className="h-4 w-4 text-warn" />
            {isTeacher ? "সম্পূর্ণ র‍্যাঙ্কিং" : `শীর্ষ ${rows.length} জন`}
          </p>
          <ul className="shadow-soft divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {rows.map((r) => (
              <li key={r.student_id} className={`flex items-center gap-3 px-3 py-2.5 ${r.rank <= 3 ? "bg-warn-bg/40" : ""}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold ${rankStyle(r.rank)}`}>
                  {medal(r.rank) || r.rank}
                </span>
                <Avatar name={r.student_name} size="sm" />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">{r.student_name}</p>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{r.marks}</p>
                  <p className="text-[11px] text-ink-400">{r.percentage}%</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
