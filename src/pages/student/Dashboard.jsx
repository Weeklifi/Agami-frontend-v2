import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, BookOpen, TrendingUp, FileText, Wallet, ChevronRight,
  CheckCircle2, GraduationCap, AlertTriangle,
} from "lucide-react";
import client from "../../api/client";
import { useMyBatches } from "../../api/queries";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import JoinByCodeModal from "./JoinByCodeModal";
import { studentNavItems } from "./navItems";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { isUrl } from "../../lib/isUrl";

const todayPy = (new Date().getDay() + 6) % 7;
const nowHM = () => new Date().toTimeString().slice(0, 5);
const fmt = (t) => t.slice(0, 5);
const todayLabel = (lang) => new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
const monthStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const GRADIENTS = ["grad-brand", "grad-violet", "grad-emerald"];

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </Card>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [joinOpen, setJoinOpen] = useState(false);

  const { data: batches = null, refetch: loadBatches } = useMyBatches();
  const [schedule, setSchedule] = useState(null);
  const [exams, setExams] = useState(null);
  const [attendancePct, setAttendancePct] = useState(null);
  const [dueTotal, setDueTotal] = useState(null);

  useEffect(() => {
    client
      .get("/api/payments/my/")
      .then((res) => {
        const all = Object.values(res.data).flat();
        setDueTotal(all.filter((r) => r.status === "DUE").reduce((n, r) => n + Number(r.amount || 0), 0));
      })
      .catch(() => setDueTotal(0));
  }, []);

  // আজকের সেশন + আসন্ন পরীক্ষা, প্রতি batch থেকে
  useEffect(() => {
    if (!batches) return;
    if (batches.length === 0) {
      setSchedule([]);
      setExams([]);
      return;
    }
    const now = new Date();

    Promise.all(
      batches.map((b) =>
        Promise.all([
          client.get(`/api/batches/${b.id}/schedules/`).then((r) => r.data.results).catch(() => []),
          client.get(`/api/batches/${b.id}/posts/?type=EXAM`).then((r) => r.data.results).catch(() => []),
        ]).then(([schedItems, examItems]) => ({ batch: b, schedItems, examItems }))
      )
    ).then((results) => {
      const sessions = [];
      const upcomingExams = [];
      results.forEach(({ batch, schedItems, examItems }) => {
        schedItems.filter((s) => s.weekday === todayPy).forEach((s) => {
          const hm = nowHM();
          const status = hm >= s.end_time.slice(0, 5) ? "done" : hm >= s.start_time.slice(0, 5) ? "active" : "scheduled";
          sessions.push({ ...s, batch, status });
        });
        examItems
          .filter((p) => p.event_date && new Date(p.event_date) > now)
          .forEach((p) => upcomingExams.push({ ...p, batch }));
      });
      sessions.sort((a, b) => a.start_time.localeCompare(b.start_time));
      upcomingExams.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setSchedule(sessions);
      setExams(upcomingExams.slice(0, 5));
    });
  }, [batches]);

  // মাসিক attendance% — ব্যাচগুলোর গড়
  useEffect(() => {
    if (!batches) return;
    if (batches.length === 0) {
      setAttendancePct(null);
      return;
    }
    const month = monthStr(new Date());
    Promise.all(
      batches.map((b) => client.get(`/api/attendance/my/?batch=${b.id}&month=${month}`).then((r) => r.data).catch(() => null))
    ).then((results) => {
      const valid = results.filter((r) => r && r.total_classes > 0);
      if (valid.length === 0) {
        setAttendancePct(null);
        return;
      }
      setAttendancePct(Math.round(valid.reduce((n, r) => n + r.percentage, 0) / valid.length));
    });
  }, [batches]);

  return (
    <AppShell
      navItems={studentNavItems}
      actions={
        <>
          <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-page px-3 py-2 text-xs font-medium text-ink-600 sm:flex">
            {t("today")} · {todayLabel(lang)}
          </span>
          <Button variant="dark" size="sm" onClick={() => setJoinOpen(true)}>
            <Plus className="h-4 w-4" /> {t("joinBatch")}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{t("studentCommandCenter")}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink-900">{t("goodMorning")}, {user?.first_name || t("student")}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t("heroSubtitleStudent", { date: todayLabel(lang) })}</p>
        </div>

        {(() => {
          const lockedBatches = (batches || []).filter((b) => b.payment_lock?.locked);
          if (lockedBatches.length > 0) {
            return (
              <div className="space-y-2">
                {lockedBatches.map((b) => (
                  <Link
                    key={b.id}
                    to={`/student/batches/${b.id}/fee`}
                    state={{ batch: b }}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-err/30 bg-err-bg px-4 py-3 hover:bg-err-bg/80"
                  >
                    <p className="flex items-center gap-2 text-sm font-medium text-ink-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-err" />
                      <span>{t("batchLocked", { name: b.name })}</span>
                    </p>
                    <span className="flex items-center gap-1 rounded-xl bg-err px-3 py-1.5 text-xs font-semibold text-white">
                      {t("payNow")} <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            );
          }
          if (dueTotal > 0) {
            return (
              <Link to="/student/payments" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-err/20 bg-err-bg px-4 py-3 hover:bg-err-bg/80">
                <p className="text-sm font-medium text-ink-800">
                  {t("feeDueBanner", { amount: dueTotal })}
                </p>
                <span className="flex items-center gap-1 rounded-xl bg-err px-3 py-1.5 text-xs font-semibold text-white">
                  {t("pay")} <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          }
          return null;
        })()}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={BookOpen} label={t("myBatchesStat")} value={batches === null ? "…" : batches.length} hint={batches?.length ? t("enrolledInBatches", { n: batches.length }) : t("noBatchesYet")} />
          <StatCard icon={CheckCircle2} label={t("todaysClasses")} value={schedule === null ? "…" : schedule.length} hint={t("asPerTodaysRoutine")} />
          <StatCard icon={TrendingUp} label={t("avgAttendance")} value={attendancePct === null ? "—" : `${attendancePct}%`} hint={t("thisMonthsAverage")} />
          <StatCard icon={FileText} label={t("upcomingExams")} value={exams === null ? "…" : exams.length} hint={t("upcomingExams")} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-ink-900">{t("todaysClassSchedule")}</h2>
                  <p className="text-xs text-ink-400">{schedule === null ? t("loading") : t("sessionsToday", { n: schedule.length })}</p>
                </div>
                <Link to="/student/batches" className="flex items-center gap-0.5 text-xs font-semibold text-brand-600 hover:underline">
                  {t("nav.myBatches")} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {schedule === null ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("loading")}</p>
              ) : schedule.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("noClassesTodayCelebrate")}</p>
              ) : (
                <ul className="divide-y divide-line">
                  {schedule.map((s, i) => (
                    <li key={i} className={`flex items-center gap-3 py-3 ${s.status === "active" ? "-mx-2 rounded-xl border border-brand-200 bg-brand-50/50 px-2" : ""}`}>
                      <div className="w-16 shrink-0 text-xs font-semibold text-ink-600">
                        {fmt(s.start_time)}<br />{fmt(s.end_time)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-ink-900">{s.batch.name}</p>
                          {s.status === "active" && <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">ACTIVE NOW</span>}
                        </div>
                        <p className="truncate text-xs text-ink-400">
                          {isUrl(s.location) ? (
                            <a href={s.location} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">{t("onlineClassJoin")}</a>
                          ) : (
                            s.location || t("room")
                          )}
                          {" "}· {s.batch.teacher_name}
                        </p>
                      </div>
                      <Link to={`/student/batches/${s.batch.id}`} state={{ batch: s.batch }}>
                        <Button size="sm" variant="secondary">{t("room")}</Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-ink-900">{t("upcomingExams")}</h2>
              {exams === null ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("loading")}</p>
              ) : exams.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("noUpcomingExams")}</p>
              ) : (
                <ul className="divide-y divide-line">
                  {exams.map((p) => (
                    <li key={p.id}>
                      <Link to={`/student/batches/${p.batch.id}`} state={{ batch: p.batch }} className="flex items-center gap-3 py-2.5 hover:bg-page/60">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warn-bg text-warn"><FileText className="h-4 w-4" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">{p.title}</p>
                          <p className="text-xs text-ink-400">{p.batch.name}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-warn">{new Date(p.event_date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short" })}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold text-ink-900">{t("quickActions")}</h2>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setJoinOpen(true)} className="rounded-xl border border-line p-3 text-left hover:bg-page">
                  <Plus className="mb-1.5 h-5 w-5 text-brand-600" />
                  <p className="text-xs font-semibold text-ink-900">{t("joinBatch")}</p>
                  <p className="text-[10px] text-ink-400">{t("inviteCode")}</p>
                </button>
                <button onClick={() => navigate("/student/payments")} className="rounded-xl border border-line p-3 text-left hover:bg-page">
                  <Wallet className="mb-1.5 h-5 w-5 text-ok" />
                  <p className="text-xs font-semibold text-ink-900">{t("payments")}</p>
                  <p className="text-[10px] text-ink-400">{t("feeStatus")}</p>
                </button>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink-900">{t("nav.myBatches")}</h2>
                <Link to="/student/batches" className="text-xs font-semibold text-brand-600 hover:underline">{t("seeAll")}</Link>
              </div>

              {batches === null ? (
                <p className="py-4 text-center text-sm text-ink-400">{t("loading")}</p>
              ) : batches.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <p className="text-sm text-ink-400">{t("noBatchesJoin")}</p>
                  <Button size="sm" onClick={() => setJoinOpen(true)}>{t("joinCta")}</Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {batches.slice(0, 4).map((b, i) => (
                    <li key={b.id}>
                      <Link to={`/student/batches/${b.id}`} state={{ batch: b }} className={`flex items-center gap-3 rounded-xl p-2.5 text-white ${GRADIENTS[i % GRADIENTS.length]}`}>
                        <GraduationCap className="h-5 w-5 shrink-0 opacity-80" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{b.name}</p>
                          <p className="truncate text-xs opacity-80">{b.teacher_name}</p>
                        </div>
                        {b.payment_lock?.locked && (
                          <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">{t("overdue")}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>

      <JoinByCodeModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoined={loadBatches} />
    </AppShell>
  );
}
