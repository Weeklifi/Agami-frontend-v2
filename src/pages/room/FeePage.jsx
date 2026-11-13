import { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { RefreshCw, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import client from "../../api/client";
import { useBatch } from "../../api/queries";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/layout/AppShell";
import Avatar from "../../components/ui/Avatar";
import BatchSubnav from "../../components/BatchSubnav";
import SubscriptionLockScreen from "../../components/SubscriptionLockScreen";
import { batchSidebarItems } from "../../lib/batchNav";
import { teacherNavItems } from "../teacher/navItems";
import { studentNavItems } from "../student/navItems";

const PAGE_SIZE = 15;

const monthStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const fmtAmount = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;
const fmtDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");
const fmtMonth = (monthDateStr) => (monthDateStr ? new Date(monthDateStr).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—");
const dueDate = (monthDateStr, graceDay) => {
  if (!monthDateStr || !graceDay) return "—";
  const d = new Date(monthDateStr);
  d.setDate(graceDay);
  return fmtDate(d.toISOString());
};

const STATUS_STYLE = {
  PAID: { label: "Paid", cls: "text-ok" },
  DUE: { label: "Due", cls: "text-err" },
  PENDING_VERIFICATION: { label: "Pending Verification", cls: "text-warn" },
  WAIVED: { label: "Waived", cls: "text-ink-400" },
};

const METHODS = [["BKASH", "bKash"], ["NAGAD", "Nagad"], ["BANK", "Bank"], ["OTHER", "Other"]];

function FeeTable({ columns, rows, page, setPage, onRefresh, refreshing, emptyText, children }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  return (
    <div className="shadow-soft flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex shrink-0 items-center justify-end gap-1 border-b border-line px-2 py-1.5">
        <button type="button" title="Refresh" onClick={onRefresh} className="rounded-lg p-1.5 text-ink-500 hover:bg-page">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-line bg-page font-bold text-ink-500">
              {columns.map((c) => (
                <th key={c} className="border-r border-line/60 px-4 py-3 uppercase last:border-r-0">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink-700">
            {pageRows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-ink-400">{emptyText}</td></tr>
            ) : (
              pageRows.map((row) => row)
            )}
          </tbody>
        </table>
        {children}
      </div>

      {rows.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-page/60 px-4 py-2.5 text-xs text-ink-600">
          <span>{start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}</span>
          <div className="flex items-center gap-1 text-ink-500">
            <button onClick={() => setPage(1)} disabled={current === 1} className="p-1 hover:text-ink-900 disabled:opacity-30"><ChevronsLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1} className="p-1 hover:text-ink-900 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-1 font-medium text-ink-800">Page {current} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={current === totalPages} className="p-1 hover:text-ink-900 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => setPage(totalPages)} disabled={current === totalPages} className="p-1 hover:text-ink-900 disabled:opacity-30"><ChevronsRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherFeeView({ batch }) {
  const [fee, setFee] = useState(undefined);
  const [feeInput, setFeeInput] = useState("");
  const [editingFee, setEditingFee] = useState(false);
  const [savingFee, setSavingFee] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [records, setRecords] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    client.get(`/api/batches/${batch.id}/fee/`).then((res) => {
      setFee(res.data.monthly_fee);
      if (res.data.monthly_fee) setFeeInput(res.data.monthly_fee);
    });
  }, [batch.id]);

  const loadRecords = () => {
    setRefreshing(true);
    client.get(`/api/batches/${batch.id}/fee-records/?month=${monthStr(month)}`).then((res) => setRecords(res.data.records)).finally(() => setRefreshing(false));
  };

  useEffect(() => { if (fee) loadRecords(); }, [fee, month]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [month]);

  const saveFee = async () => {
    setSavingFee(true);
    await client.put(`/api/batches/${batch.id}/fee/`, { monthly_fee: feeInput });
    setFee(feeInput);
    setEditingFee(false);
    setSavingFee(false);
  };

  // একবার Paid হলে আর Due-তে ফেরানো যাবে না — ব্যাকএন্ডও এটা ব্লক করে,
  // এখানে শুধু DUE/WAIVED থেকে PAID-এ মার্ক করার action রাখা হয়েছে।
  const markPaid = async (record) => {
    await client.post(`/api/payments/records/${record.id}/mark/`, { status: "PAID", method: "CASH" });
    loadRecords();
  };

  const confirmPay = async (recordId) => {
    await client.post(`/api/payments/records/${recordId}/confirm/`);
    loadRecords();
  };

  const shiftMonth = (delta) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(d);
  };

  if (fee === undefined) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  if (fee === null) {
    return (
      <div className="shadow-soft max-w-md rounded-2xl border border-line bg-surface p-5 text-center">
        <p className="text-sm text-ink-600">আগে এই batch-এর মাসিক বেতন ঠিক করুন — তারপর প্রতি মাসের আদায়ের হিসাব এখানে দেখা যাবে।</p>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            placeholder="500"
            value={feeInput}
            onChange={(e) => setFeeInput(e.target.value)}
            className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button type="button" onClick={saveFee} disabled={!feeInput || savingFee} className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            Set করুন
          </button>
        </div>
      </div>
    );
  }

  const rows = records || [];
  const columns = ["PAYMENT STATUS", "STUDENT", "FEES TYPE", "MONTH", "DUE DATE", "AMOUNT", "ACTION"];

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-sm">
          <button onClick={() => shiftMonth(-1)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-page"><ChevronLeft className="h-4 w-4" /></button>
          <span className="font-semibold text-ink-800">{month.toLocaleString("en-GB", { month: "long", year: "numeric" })}</span>
          <button onClick={() => shiftMonth(1)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-page"><ChevronRight className="h-4 w-4" /></button>
        </div>

        {editingFee ? (
          <div className="flex items-center gap-2">
            <input type="number" value={feeInput} onChange={(e) => setFeeInput(e.target.value)} className="w-28 rounded-xl border border-line px-2.5 py-1.5 text-xs outline-none focus:border-brand-500" />
            <button onClick={saveFee} disabled={savingFee} className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">Save</button>
            <button onClick={() => { setEditingFee(false); setFeeInput(fee); }} className="rounded-xl border border-line px-3 py-1.5 text-xs">Cancel</button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingFee(true)} className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-page">
            <Pencil className="h-3.5 w-3.5" /> Monthly Fee: {fmtAmount(fee)}
          </button>
        )}
      </div>

      {records === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : (
        <div className="min-h-0 flex-1">
        <FeeTable
          columns={columns}
          rows={rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-page/60">
              <td className={`px-4 py-3 font-medium ${STATUS_STYLE[r.status].cls}`}>{STATUS_STYLE[r.status].label}</td>
              <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={r.student_name} size="sm" /><span className="truncate">{r.student_name}</span></div></td>
              <td className="px-4 py-3">Monthly Tuition</td>
              <td className="px-4 py-3">{fmtMonth(r.month)}</td>
              <td className="px-4 py-3">{dueDate(r.month, batch.payment_grace_day)}</td>
              <td className="px-4 py-3 font-semibold">{fmtAmount(r.amount)}</td>
              <td className="px-4 py-3 text-center">
                {r.status === "PENDING_VERIFICATION" ? (
                  <button onClick={() => confirmPay(r.id)} className="rounded-lg bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white">Confirm</button>
                ) : r.status === "PAID" ? (
                  <span className="text-[11px] text-ink-400">—</span>
                ) : (
                  <button onClick={() => markPaid(r)} className="rounded-lg border border-line px-3 py-1 text-[11px] font-semibold text-ink-700 hover:bg-page">
                    Mark Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
          page={page}
          setPage={setPage}
          onRefresh={loadRecords}
          refreshing={refreshing}
          emptyText="এই মাসে কোনো শিক্ষার্থীর record নেই।"
        />
        </div>
      )}
    </div>
  );
}

function StudentFeeView({ batch }) {
  const [allData, setAllData] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [openForm, setOpenForm] = useState(null);
  const [trxId, setTrxId] = useState("");
  const [method, setMethod] = useState("BKASH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setRefreshing(true);
    client.get("/api/payments/my/").then((res) => setAllData(res.data)).finally(() => setRefreshing(false));
  };

  useEffect(load, []);

  const records = useMemo(() => (allData && batch?.name ? allData[batch.name] || [] : []), [allData, batch?.name]);

  const payWithGateway = async (recordId) => {
    try {
      const { data } = await client.post(`/api/payments/records/${recordId}/pay/`);
      window.location.href = data.gateway_url;
    } catch (err) {
      alert(err.response?.data?.detail || "Payment শুরু করা যায়নি।");
    }
  };

  const openSubmitForm = (recordId) => {
    setOpenForm(recordId);
    setTrxId("");
    setMethod("BKASH");
    setError("");
  };

  const submitPayment = async (recordId) => {
    if (!trxId.trim()) {
      setError("Transaction ID লিখুন।");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/payments/records/${recordId}/submit/`, { trx_id: trxId.trim(), method });
      setOpenForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "জমা দেওয়া যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  const dueTotal = records.filter((r) => r.status === "DUE").reduce((n, r) => n + Number(r.amount || 0), 0);
  const columns = ["PAYMENT STATUS", "MONTH", "FEES TYPE", "DUE DATE", "AMOUNT", "ACTION"];

  if (allData === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      {dueTotal > 0 && (
        <div className="shrink-0 rounded-2xl border border-err/20 bg-err-bg px-4 py-3">
          <p className="text-xs text-err">মোট বকেয়া</p>
          <p className="text-lg font-bold text-err">{fmtAmount(dueTotal)}</p>
        </div>
      )}

      <div className="min-h-0 flex-1">
      <FeeTable
        columns={columns}
        rows={records.map((r) => (
          <Fragment key={r.id}>
            <tr className="transition-colors hover:bg-page/60">
              <td className={`px-4 py-3 font-medium ${STATUS_STYLE[r.status].cls}`}>{STATUS_STYLE[r.status].label}</td>
              <td className="px-4 py-3">{fmtMonth(r.month)}</td>
              <td className="px-4 py-3">Monthly Tuition</td>
              <td className="px-4 py-3">{dueDate(r.month, batch?.payment_grace_day)}</td>
              <td className="px-4 py-3 font-semibold">{fmtAmount(r.amount)}</td>
              <td className="px-4 py-3 text-center">
                {r.status === "DUE" ? (
                  <div className="flex justify-center gap-1.5">
                    <button onClick={() => payWithGateway(r.id)} className="rounded-lg bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white">Pay Now</button>
                    <button onClick={() => openSubmitForm(r.id)} className="rounded-lg border border-line px-3 py-1 text-[11px] font-semibold text-ink-700 hover:bg-page">TrxID</button>
                  </div>
                ) : r.status === "PENDING_VERIFICATION" ? (
                  <span className="text-[11px] text-warn">{r.submitted_trx_id ? `TrxID: ${r.submitted_trx_id}` : "যাচাই হচ্ছে"}</span>
                ) : (
                  <span className="text-[11px] text-ink-400">{r.paid_at ? fmtDate(r.paid_at) : "—"}</span>
                )}
              </td>
            </tr>
            {openForm === r.id && (
              <tr>
                <td colSpan={columns.length} className="bg-page px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {METHODS.map(([value, l]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMethod(value)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] ${method === value ? "border-brand-600 bg-surface font-semibold text-brand-600" : "border-line text-ink-600"}`}
                      >
                        {l}
                      </button>
                    ))}
                    <input
                      placeholder="Transaction ID"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="min-w-[160px] flex-1 rounded-lg border border-line px-2.5 py-1.5 text-xs outline-none focus:border-brand-500"
                    />
                    <button onClick={() => submitPayment(r.id)} disabled={busy} className="rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">জমা দিন</button>
                    <button onClick={() => setOpenForm(null)} className="rounded-lg border border-line px-3 py-1.5 text-[11px]">বাতিল</button>
                  </div>
                  {error && <p className="mt-1.5 text-[11px] text-err">{error}</p>}
                </td>
              </tr>
            )}
          </Fragment>
        ))}
        page={page}
        setPage={setPage}
        onRefresh={load}
        refreshing={refreshing}
        emptyText="এখনো কোনো বেতনের হিসাব নেই।"
      />
      </div>
    </div>
  );
}

export default function FeePage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const { data: fetchedBatch } = useBatch(id, isTeacher);
  const batch = fetchedBatch ?? location.state?.batch ?? null;
  const sidebarItems = batch ? batchSidebarItems(batch, isTeacher) : navItems;
  const subscriptionLocked = isTeacher && batch?.subscription_lock?.locked;

  return (
    <AppShell navItems={navItems} sidebarItems={sidebarItems} title={isTeacher ? "ফি ব্যবস্থাপনা" : "আমার ফি"} fullBleed>
      <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">
        <div className="shrink-0">
          {batch ? <BatchSubnav batch={batch} isTeacher={isTeacher} /> : <div className="mb-5 h-24 animate-pulse rounded-xl bg-line-soft" />}
        </div>

        <div className="min-h-0 flex-1">
          {!batch ? (
            <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
          ) : subscriptionLocked ? (
            <SubscriptionLockScreen message={batch.subscription_lock.message} />
          ) : isTeacher ? (
            <TeacherFeeView batch={batch} />
          ) : (
            <StudentFeeView batch={batch} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
