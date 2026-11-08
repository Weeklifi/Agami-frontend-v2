import { useCallback, useEffect, useState } from "react";
import { Plus, Trophy, FileText, BarChart3 } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import IconTile from "../../components/ui/IconTile";

const today = () => new Date().toISOString().slice(0, 10);

export default function ExamList({ batchId, isTeacher, onOpenSheet, onOpenBoard }) {
  const [exams, setExams] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", exam_date: today(), total_marks: "", leaderboard_size: 5 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    client.get(`/api/batches/${batchId}/exams/`).then((res) => setExams(res.data.results || res.data));
  }, [batchId]);

  useEffect(load, [load]);

  const create = async () => {
    if (!form.name.trim() || !form.total_marks) {
      setError("নাম ও পূর্ণমান দিন।");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/batches/${batchId}/exams/`, form);
      setForm({ name: "", exam_date: today(), total_marks: "", leaderboard_size: 5 });
      setCreating(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "তৈরি করা যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (exam) => {
    await client.patch(`/api/batches/${batchId}/exams/${exam.id}/`, { is_published: !exam.is_published });
    load();
  };

  if (exams === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  return (
    <div className="space-y-4">
      {isTeacher &&
        (creating ? (
          <div className="space-y-2.5 rounded-2xl bg-page p-3">
            <Input placeholder="পরীক্ষার নাম — যেমন Chemistry Ch.3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
              <Input type="number" placeholder="পূর্ণমান" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-700">Leaderboard-এ কতজন দেখাবে</label>
              <select
                value={form.leaderboard_size}
                onChange={(e) => setForm({ ...form, leaderboard_size: Number(e.target.value) })}
                className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {[3, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>Top {n}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-xs text-err">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" className="px-4" loading={busy} onClick={create}>তৈরি করুন</Button>
              <Button variant="secondary" size="sm" className="px-4" onClick={() => setCreating(false)}>বাতিল</Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> নতুন পরীক্ষা
          </Button>
        ))}

      {exams.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">এখনো কোনো পরীক্ষা নেই।</p>
      ) : (
        <ul className="space-y-2">
          {exams.map((ex) => (
            <li key={ex.id} className="shadow-soft rounded-2xl border border-line bg-surface p-3">
              <div className="flex items-center gap-3">
                <IconTile icon={ex.is_published ? BarChart3 : FileText} tone={ex.is_published ? "emerald" : "amber"} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{ex.name}</p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {new Date(ex.exam_date).toLocaleDateString("bn-BD", { day: "numeric", month: "long" })} · পূর্ণমান {ex.total_marks}
                    {isTeacher && ` · ${ex.result_count} জন`}
                  </p>
                </div>
                {isTeacher && <Badge tone={ex.is_published ? "ok" : "neutral"}>{ex.is_published ? "প্রকাশিত" : "খসড়া"}</Badge>}
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {isTeacher && (
                  <>
                    <Button variant="secondary" size="sm" className="px-3 py-1.5 text-xs" onClick={() => onOpenSheet(ex)}>নম্বর দিন</Button>
                    <Button variant="secondary" size="sm" className="px-3 py-1.5 text-xs" onClick={() => togglePublish(ex)}>
                      {ex.is_published ? "অপ্রকাশ করুন" : "প্রকাশ করুন"}
                    </Button>
                  </>
                )}
                <Button size="sm" className="px-3 py-1.5 text-xs" onClick={() => onOpenBoard(ex)}>
                  <Trophy className="h-3.5 w-3.5" /> Leaderboard
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
