import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Layers, Users, TrendingUp, Wallet, ClipboardCheck, FileText,
  MessageSquareText, UserPlus, ChevronRight, CheckCircle2, AlertCircle, Lock,
} from "lucide-react";
import client from "../../api/client";
import { useTeacherBatches } from "../../api/queries";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import CreateBatchModal from "./CreateBatchModal";
import { teacherNavItems } from "./navItems";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { isUrl } from "../../lib/isUrl";

const todayPy = (new Date().getDay() + 6) % 7;
const nowHM = () => new Date().toTimeString().slice(0, 5);
const fmt = (t) => t.slice(0, 5);
const todayLabel = (lang) => new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
const monthStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: batches = null, refetch: loadBatches } = useTeacherBatches();
  const batchIds = (batches || []).map((b) => b.id).join(",");

  const { data: subStatus } = useQuery({
    queryKey: ["teacher-sub-status"],
    queryFn: () => client.get("/api/subscriptions/me/").then((r) => r.data),
  });
  // trial_available=false মানে আগে trial/subscription নিয়েছিল, active=false মানে এখন শেষ
  const trialJustExpired = subStatus && !subStatus.active && !subStatus.trial_available;
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);

  const { data: summary = null } = useQuery({
    queryKey: ["teacher-summary"],
    queryFn: () => client.get("/api/payments/teacher-summary/").then((r) => r.data),
  });

  // আজকের সেশন + attendance summary প্রতি batch থেকে
  const { data: scheduleData } = useQuery({
    queryKey: ["teacher-dashboard", "schedule", batchIds],
    enabled: batches !== null,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const results = await Promise.all(
        batches.map((b) =>
          Promise.all([
            client.get(`/api/batches/${b.id}/schedules/`).then((r) => r.data.results).catch(() => []),
            client.get(`/api/batches/${b.id}/attendance/?date=${today}`).then((r) => r.data.summary).catch(() => null),
          ]).then(([items, attSummary]) => ({ batch: b, items, attSummary }))
        )
      );
      let presentSum = 0, totalSum = 0;
      const sessions = [];
      results.forEach(({ batch, items, attSummary }) => {
        if (attSummary) { presentSum += attSummary.present; totalSum += attSummary.total; }
        items.filter((s) => s.weekday === todayPy).forEach((s) => {
          const now = nowHM();
          const status = now >= s.end_time.slice(0, 5) ? "done" : now >= s.start_time.slice(0, 5) ? "active" : "scheduled";
          sessions.push({ ...s, batch, status, attSummary });
        });
      });
      sessions.sort((a, b) => a.start_time.localeCompare(b.start_time));
      return { sessions, todayAttendance: { present: presentSum, total: totalSum } };
    },
  });
  const schedule = scheduleData?.sessions ?? null;
  const todayAttendance = scheduleData?.todayAttendance ?? null;

  // Attention queue: pending fee verification + unpublished exam (প্রথম কয়েকটা batch)
  const { data: attentionQueue = null } = useQuery({
    queryKey: ["teacher-dashboard", "attention", batchIds],
    enabled: batches !== null,
    queryFn: async () => {
      const sample = batches.slice(0, 5);
      const month = monthStr(new Date());
      const results = await Promise.all(
        sample.map((b) =>
          Promise.all([
            client.get(`/api/batches/${b.id}/fee-records/?month=${month}`).then((r) => r.data.records).catch(() => []),
            client.get(`/api/batches/${b.id}/exams/`).then((r) => r.data.results || r.data).catch(() => []),
          ]).then(([records, exams]) => ({ batch: b, records, exams }))
        )
      );
      const fees = [];
      const exams = [];
      results.forEach(({ batch, records, exams: ex }) => {
        records.filter((r) => r.status === "PENDING_VERIFICATION").forEach((r) => fees.push({ ...r, batch }));
        ex.filter((e) => !e.is_published).forEach((e) => exams.push({ ...e, batch }));
      });
      return { fees: fees.slice(0, 3), exams: exams.slice(0, 2) };
    },
  });

  // Batch performance snapshot: প্রথম ২টা batch — মাসিক attendance% + সাম্প্রতিক exam score%
  const { data: performance = null } = useQuery({
    queryKey: ["teacher-dashboard", "performance", batchIds],
    enabled: batches !== null,
    queryFn: async () => {
      const top = batches.slice(0, 2);
      const month = monthStr(new Date());
      return Promise.all(
        top.map((b) =>
          Promise.all([
            client.get(`/api/batches/${b.id}/attendance/monthly/?month=${month}`).then((r) => r.data).catch(() => null),
            client.get(`/api/batches/${b.id}/exams/`).then((r) => r.data.results || r.data).catch(() => []),
          ]).then(async ([att, exams]) => {
            const avgAttendance = att?.students?.length
              ? Math.round(att.students.reduce((n, s) => n + s.percentage, 0) / att.students.length)
              : null;
            const latestExam = exams.filter((e) => e.is_published).sort((a, c) => new Date(c.exam_date) - new Date(a.exam_date))[0];
            let avgScore = null;
            if (latestExam) {
              try {
                const { data } = await client.get(`/api/results/exams/${latestExam.id}/leaderboard/`);
                const rows = data.ranking || [];
                if (rows.length) avgScore = Math.round(rows.reduce((n, r) => n + r.percentage, 0) / rows.length);
              } catch {}
            }
            return { batch: b, avgAttendance, avgScore, latestExam };
          })
        )
      );
    },
  });

  // সাম্প্রতিক pinned/ঘোষণা — প্রথম কয়েক batch
  const { data: recentNotice = undefined } = useQuery({
    queryKey: ["teacher-dashboard", "notice", batchIds],
    enabled: batches !== null,
    queryFn: async () => {
      const sample = batches.slice(0, 3);
      const arrs = await Promise.all(
        sample.map((b) => client.get(`/api/batches/${b.id}/posts/?type=ANNOUNCEMENT`).then((r) => r.data.results.map((p) => ({ ...p, batch: b }))).catch(() => []))
      );
      const all = arrs.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return all[0] || null;
    },
  });

  const totalStudents = summary?.total_students ?? (batches || []).reduce((n, b) => n + (b.student_count || 0), 0);
  const attendancePct = todayAttendance && todayAttendance.total > 0 ? Math.round((todayAttendance.present / todayAttendance.total) * 100) : null;
  const attentionCount = (attentionQueue?.fees.length || 0) + (attentionQueue?.exams.length || 0);

  return (
    <AppShell
      navItems={teacherNavItems}
      actions={
        <>
          <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-page px-3 py-2 text-xs font-medium text-ink-600 sm:flex">
            {t("today")} · {todayLabel(lang)}
          </span>
          <Button variant="dark" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> {t("createBatch")}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{t("academicCommandCenter")}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink-900">{t("goodMorning")}, {user?.first_name || t("teacher")}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t("heroSubtitleTeacher", { date: todayLabel(lang) })}</p>
        </div>

        {attentionCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
            <p className="text-sm font-medium text-ink-800">
              {t("itemsNeedAttention", { count: attentionCount })}
            </p>
            <a href="#attention-queue" className="flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
              {t("review")} <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Layers} label={t("activeBatches")} value={batches === null ? "…" : batches.length} hint={batches?.length ? t("activeBatchesHint", { n: batches.length }) : t("noBatchesYet")} />
          <StatCard icon={Users} label={t("totalStudents")} value={batches === null && summary === null ? "…" : totalStudents} hint={t("acrossAllBatches")} />
          <StatCard icon={TrendingUp} label={t("avgAttendance")} value={attendancePct === null ? "—" : `${attendancePct}%`} hint={todayAttendance?.total ? t("presentOutOfToday", { present: todayAttendance.present, total: todayAttendance.total }) : t("noAttendanceToday")} />
          <StatCard icon={Wallet} label={t("monthlyRevenue")} value={summary === null ? "…" : `৳${Number(summary.collected_this_month).toLocaleString("en-IN")}`} hint={t("collectedThisMonth")} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-ink-900">{t("todaysClassSchedule")}</h2>
                  <p className="text-xs text-ink-400">{schedule === null ? t("loading") : t("sessionsOrganizedToday", { n: schedule.length })}</p>
                </div>
                <Link to="/teacher/batches" className="flex items-center gap-0.5 text-xs font-semibold text-brand-600 hover:underline">
                  {t("fullTimetable")} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {schedule === null ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("loading")}</p>
              ) : schedule.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("noClassesToday")}</p>
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
                          {s.status === "active" && <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">{t("activeNow")}</span>}
                        </div>
                        <p className="truncate text-xs text-ink-400">
                          {isUrl(s.location) ? (
                            <a href={s.location} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">{t("onlineClassJoin")}</a>
                          ) : (
                            s.location || t("room")
                          )}
                          {" "}· {s.batch.student_count} {t("enrolled")}
                        </p>
                      </div>
                      {s.status === "active" ? (
                        <Link to={`/teacher/batches/${s.batch.id}/attendance`} state={{ batch: s.batch }}>
                          <Button size="sm">{t("markAttendance")}</Button>
                        </Link>
                      ) : s.status === "done" ? (
                        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ok">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {s.attSummary ? t("doneWithCount", { present: s.attSummary.present, total: s.attSummary.total }) : t("done")}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-500">{t("scheduled")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-bold text-ink-900">{t("batchPerformanceSnapshot")}</h2>
              <p className="mb-4 text-xs text-ink-400">{t("comparativeIndex")}</p>

              {performance === null ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("loading")}</p>
              ) : performance.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">{t("noBatchesYetFull")}</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {performance.map(({ batch, avgAttendance, avgScore, latestExam }) => (
                    <div key={batch.id} className="rounded-xl border border-line p-4">
                      <p className="text-sm font-bold text-ink-900">{batch.name}</p>
                      <p className="mb-3 text-xs text-ink-400">{batch.student_count} {t("students")}</p>

                      <div className="mb-2.5">
                        <div className="mb-1 flex justify-between text-xs"><span className="text-ink-500">{t("avgAttendance")}</span><span className="font-semibold text-ink-800">{avgAttendance === null ? "—" : `${avgAttendance}%`}</span></div>
                        <div className="h-1.5 rounded-full bg-page"><div className="h-full rounded-full bg-brand-600" style={{ width: `${avgAttendance ?? 0}%` }} /></div>
                      </div>
                      <div className="mb-3">
                        <div className="mb-1 flex justify-between text-xs"><span className="text-ink-500">{t("avgTestScore")}</span><span className="font-semibold text-ink-800">{avgScore === null ? "—" : `${avgScore}%`}</span></div>
                        <div className="h-1.5 rounded-full bg-page"><div className="h-full rounded-full bg-violet-500" style={{ width: `${avgScore ?? 0}%` }} /></div>
                      </div>

                      <div className="flex items-center justify-between border-t border-line pt-2.5 text-xs">
                        <span className="text-ink-400">{latestExam ? t("examLabel", { name: latestExam.name }) : t("noExamPublished")}</span>
                        <Link to={`/teacher/batches/${batch.id}/results`} state={{ batch }} className="font-semibold text-brand-600 hover:underline">{t("details")}</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold text-ink-900">{t("quickActions")}</h2>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => batches?.[0] && navigate(`/teacher/batches/${batches[0].id}/attendance`, { state: { batch: batches[0] } })} className="rounded-xl border border-line p-3 text-left hover:bg-page">
                  <ClipboardCheck className="mb-1.5 h-5 w-5 text-brand-600" />
                  <p className="text-xs font-semibold text-ink-900">{t("attendance")}</p>
                  <p className="text-[10px] text-ink-400">{t("instantMark")}</p>
                </button>
                <button onClick={() => batches?.[0] && navigate(`/teacher/batches/${batches[0].id}/results`, { state: { batch: batches[0] } })} className="rounded-xl border border-line p-3 text-left hover:bg-page">
                  <FileText className="mb-1.5 h-5 w-5 text-violet-600" />
                  <p className="text-xs font-semibold text-ink-900">{t("newExam")}</p>
                  <p className="text-[10px] text-ink-400">{t("quizzesTests")}</p>
                </button>
                <button onClick={() => navigate("/teacher/sms")} className="rounded-xl border border-line p-3 text-left hover:bg-page">
                  <MessageSquareText className="mb-1.5 h-5 w-5 text-warn" />
                  <p className="text-xs font-semibold text-ink-900">{t("smsBroadcast")}</p>
                  <p className="text-[10px] text-ink-400">{t("cohortAlerts")}</p>
                </button>
                <button onClick={() => navigate("/teacher/batches")} className="rounded-xl border border-line p-3 text-left hover:bg-page">
                  <UserPlus className="mb-1.5 h-5 w-5 text-ok" />
                  <p className="text-xs font-semibold text-ink-900">{t("inviteStudent")}</p>
                  <p className="text-[10px] text-ink-400">{t("directAccess")}</p>
                </button>
              </div>
            </Card>

            <Card id="attention-queue" className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold text-ink-900">{t("attentionQueue")}</h2>
                {attentionCount > 0 && <span className="rounded-full bg-err px-1.5 py-0.5 text-[10px] font-bold text-white">{attentionCount}</span>}
              </div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t("priorityTasks")}</p>

              {attentionQueue === null ? (
                <p className="py-4 text-center text-sm text-ink-400">{t("loading")}</p>
              ) : attentionCount === 0 ? (
                <p className="py-4 text-center text-sm text-ink-400">{t("noPendingTasks")}</p>
              ) : (
                <div className="space-y-3">
                  {attentionQueue.fees.map((r) => (
                    <div key={r.id} className="rounded-xl border border-line p-3">
                      <div className="flex items-start gap-2.5">
                        <Avatar name={r.student_name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink-900">{r.student_name}</p>
                          <p className="text-[11px] text-ink-400">{t("feeVerify")} · ৳{Math.round(r.amount)}</p>
                          {r.submitted_trx_id && <p className="text-[11px] text-ink-400">{t("trx")}: {r.submitted_trx_id}</p>}
                        </div>
                      </div>
                      <Link to={`/teacher/batches/${r.batch.id}/fee`} state={{ batch: r.batch }} className="mt-2 block rounded-lg bg-brand-600 py-1.5 text-center text-[11px] font-semibold text-white hover:bg-brand-700">
                        {t("reviewVerify")}
                      </Link>
                    </div>
                  ))}
                  {attentionQueue.exams.map((e) => (
                    <div key={e.id} className="rounded-xl border border-line p-3">
                      <div className="flex items-start gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warn-bg text-warn"><AlertCircle className="h-4 w-4" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink-900">{e.name}</p>
                          <p className="text-[11px] text-ink-400">{t("candidatePapers", { n: e.result_count })}</p>
                        </div>
                      </div>
                      <Link to={`/teacher/batches/${e.batch.id}/results`} state={{ batch: e.batch }} className="mt-2 block rounded-lg bg-brand-600 py-1.5 text-center text-[11px] font-semibold text-white hover:bg-brand-700">
                        {t("publishSchedule")}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink-900">{t("recentNotices")}</h2>
                {recentNotice && (
                  <Link to={`/teacher/batches/${recentNotice.batch.id}`} state={{ batch: recentNotice.batch }} className="text-xs font-semibold text-brand-600 hover:underline">{t("newPost")}</Link>
                )}
              </div>
              {recentNotice === undefined ? (
                <p className="py-4 text-center text-sm text-ink-400">{t("loading")}</p>
              ) : recentNotice === null ? (
                <p className="py-4 text-center text-sm text-ink-400">{t("noNoticesYet")}</p>
              ) : (
                <Link to={`/teacher/batches/${recentNotice.batch.id}`} state={{ batch: recentNotice.batch }} className="block rounded-xl border border-line p-3 hover:bg-page">
                  <p className="truncate text-sm font-bold text-ink-900">{recentNotice.title}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{recentNotice.batch.name} · {new Date(recentNotice.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long" })}</p>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>

      <CreateBatchModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadBatches} />

      <Modal open={trialJustExpired && !upgradeDismissed} onClose={() => setUpgradeDismissed(true)} title="আপনার Free Trial শেষ হয়ে গেছে">
        <div className="flex flex-col items-center gap-4 pb-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/10">
            <Lock className="h-7 w-7 text-brand-600" />
          </div>
          <p className="text-sm text-ink-600">
            আপনার ৩০ দিনের free trial শেষ। এখন থেকে শুধু আপনার সবচেয়ে পুরোনো batch-টা চালু থাকবে —
            বাকি batch গুলোর content দেখতে বা পরিচালনা করতে <span className="font-semibold text-ink-900">regular subscription</span> নিতে হবে।
          </p>
          <Button onClick={() => navigate("/teacher/plans")} className="w-full">
            এখনই Plan দেখুন
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
