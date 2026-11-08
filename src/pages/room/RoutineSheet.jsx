import { useEffect, useState } from "react";
import { X, Video } from "lucide-react";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { isUrl } from "../../lib/isUrl";

const WEEKDAYS = [
  [5, "শনিবার"], [6, "রবিবার"], [0, "সোমবার"], [1, "মঙ্গলবার"],
  [2, "বুধবার"], [3, "বৃহস্পতিবার"], [4, "শুক্রবার"],
];

const EMPTY = { weekday: 6, start_time: "", end_time: "", location: "" };
const todayPy = (new Date().getDay() + 6) % 7;
const fmt = (t) => t.slice(0, 5);

export function RoutineContent({ batchId, isTeacher }) {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const load = () => client.get(`/api/batches/${batchId}/schedules/`).then((res) => setItems(res.data.results));

  useEffect(() => { load(); }, [batchId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await client.post(`/api/batches/${batchId}/schedules/`, { ...form, weekday: Number(form.weekday) });
      setForm(EMPTY);
      setAdding(false);
      load();
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  const remove = async (scheduleId) => {
    if (!confirm("এই ক্লাসটি মুছে ফেলতে চান?")) return;
    await client.delete(`/api/batches/${batchId}/schedules/${scheduleId}/`);
    load();
  };

  const slots = items
    ? [...new Set(items.map((s) => `${s.start_time}|${s.end_time}`))]
        .sort()
        .map((key) => {
          const [start, end] = key.split("|");
          return { key, start, end };
        })
    : [];

  const cellItems = (slot, weekday) =>
    items.filter((s) => s.weekday === weekday && s.start_time === slot.start && s.end_time === slot.end);

  return (
    <>
      {items === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && !adding && <p className="py-4 text-center text-sm text-ink-400">এখনো কোনো ক্লাস সময়সূচী নেই।</p>}

          {items.length > 0 && (
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-36 border-b border-line px-3 py-2 text-left text-xs font-semibold uppercase text-ink-400">সময়/বার</th>
                    {WEEKDAYS.map(([v, label]) => (
                      <th key={v} className={`border-b border-line px-3 py-2 text-center text-xs font-semibold uppercase ${v === todayPy ? "text-brand-600" : "text-ink-400"}`}>
                        {label}
                        {v === todayPy && <span className="block text-[10px] font-normal">আজ</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.key} className="border-b border-line/60">
                      <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold">{fmt(slot.start)} – {fmt(slot.end)}</td>
                      {WEEKDAYS.map(([v]) => (
                        <td key={v} className={`px-2 py-3 text-center align-top ${v === todayPy ? "bg-brand-50/50" : ""}`}>
                          {cellItems(slot, v).map((s) => (
                            <div key={s.id} className="mb-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-700">
                              {isUrl(s.location) ? (
                                <a href={s.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" onClick={(e) => e.stopPropagation()}>
                                  <Video className="h-3 w-3" /> Join Class
                                </a>
                              ) : (
                                <span>{s.location || "ক্লাস"}</span>
                              )}
                              {isTeacher && (
                                <button onClick={() => remove(s.id)} className="rounded p-0.5 text-brand-400 hover:bg-brand-100 hover:text-err" title="এই ক্লাস মুছুন">
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {items.length > 0 && (
            <div className="space-y-3 md:hidden">
              {WEEKDAYS.map(([v, label]) => {
                const dayItems = items.filter((s) => s.weekday === v).sort((a, b) => a.start_time.localeCompare(b.start_time));
                if (dayItems.length === 0) return null;
                return (
                  <div key={v} className={`rounded-lg border p-3 ${v === todayPy ? "border-brand-500 bg-brand-50/40" : "border-line"}`}>
                    <p className={`mb-2 text-xs font-semibold ${v === todayPy ? "text-brand-600" : "text-ink-600"}`}>{label} {v === todayPy && "· আজ"}</p>
                    <ul className="space-y-1.5">
                      {dayItems.map((s) => (
                        <li key={s.id} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm">
                            {fmt(s.start_time)} – {fmt(s.end_time)}
                            {isUrl(s.location) ? (
                              <a href={s.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-brand-600 hover:underline">
                                <Video className="h-3.5 w-3.5" /> Join Class
                              </a>
                            ) : (
                              s.location && <span className="text-ink-400"> · {s.location}</span>
                            )}
                          </span>
                          {isTeacher && <button onClick={() => remove(s.id)} className="text-xs text-ink-400 hover:text-err">মুছুন</button>}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {isTeacher &&
            (adding ? (
              <form onSubmit={submit} className="max-w-md space-y-3 rounded-lg bg-page p-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-ink-700">বার</label>
                  <select
                    value={form.weekday}
                    onChange={set("weekday")}
                    className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
                  >
                    {WEEKDAYS.map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-700">শুরু</label>
                    <Input type="time" value={form.start_time} onChange={set("start_time")} />
                    {errors.start_time?.[0] && <p className="mt-1 text-xs text-err">{errors.start_time[0]}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-700">শেষ</label>
                    <Input type="time" value={form.end_time} onChange={set("end_time")} />
                    {errors.end_time?.[0] && <p className="mt-1 text-xs text-err">{errors.end_time[0]}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">স্থান বা Online Class Link (ঐচ্ছিক)</label>
                  <Input placeholder="Room 2  অথবা  https://meet.google.com/xxx-yyyy-zzz" value={form.location} onChange={set("location")} />
                  <p className="mt-1 text-xs text-ink-400">লিংক দিলে (Zoom/Google Meet) শিক্ষার্থীরা সরাসরি "Join Class" বাটনে ক্লিক করতে পারবে</p>
                </div>
                {errors.non_field_errors && <p className="text-sm text-err">{errors.non_field_errors[0]}</p>}
                <div className="flex gap-2">
                  <Button type="submit" loading={loading} className="px-4">যোগ করুন</Button>
                  <Button type="button" variant="secondary" className="px-4" onClick={() => setAdding(false)}>বাতিল</Button>
                </div>
              </form>
            ) : (
              <Button variant="secondary" onClick={() => setAdding(true)}>ক্লাস যোগ করুন</Button>
            ))}
        </div>
      )}
    </>
  );
}

export default function RoutineSheet({ open, onClose, batchId, isTeacher }) {
  return (
    <Modal open={open} onClose={onClose} title="ক্লাস রুটিন" wide>
      <RoutineContent batchId={batchId} isTeacher={isTeacher} />
    </Modal>
  );
}
