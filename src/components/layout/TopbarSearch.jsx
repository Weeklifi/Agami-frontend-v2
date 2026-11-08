import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Layers, User } from "lucide-react";
import client from "../../api/client";

export default function TopbarSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      client
        .get("/api/batches/search/", { params: { q: q.trim() } })
        .then((res) => setResults(res.data))
        .catch(() => setResults({ batches: [], students: [] }));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const goTo = (path) => {
    setOpen(false);
    setQ("");
    setResults(null);
    navigate(path);
  };

  const hasResults = results && (results.batches.length > 0 || results.students.length > 0);

  return (
    <div ref={boxRef} className="relative hidden sm:block">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink-600 focus-within:border-brand-500 focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand-100">
        <Search className="h-4 w-4 shrink-0 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search students, batches..."
          className="w-48 bg-transparent outline-none placeholder:text-ink-400"
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className="shadow-pop absolute left-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface">
          {results === null ? (
            <p className="px-4 py-6 text-center text-sm text-ink-400">খোঁজা হচ্ছে…</p>
          ) : !hasResults ? (
            <p className="px-4 py-6 text-center text-sm text-ink-400">কোনো ফলাফল নেই।</p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1.5">
              {results.batches.length > 0 && (
                <div className="mb-1">
                  <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Batches</p>
                  {results.batches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => goTo(`/teacher/batches/${b.id}`)}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-page"
                    >
                      <Layers className="h-4 w-4 shrink-0 text-brand-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">{b.name}</p>
                        <p className="truncate text-xs text-ink-400">{b.subject || "—"} · {b.student_count} জন</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.students.length > 0 && (
                <div>
                  <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Students</p>
                  {results.students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => goTo(`/teacher/batches/${s.batch_id}/students`)}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-page"
                    >
                      <User className="h-4 w-4 shrink-0 text-violet-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">{s.name}</p>
                        <p className="truncate text-xs text-ink-400">{s.batch_name} · {s.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
