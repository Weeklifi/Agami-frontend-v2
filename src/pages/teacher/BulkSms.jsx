import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, CreditCard, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Hero from "../../components/ui/Hero";
import { teacherNavItems } from "./navItems";

const SMS_LENGTH = 160;

export default function BulkSms() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    client.get("/api/batches/").then((res) => {
      const list = res.data.results || res.data;
      setBatches(list);
      if (list.length) setBatchId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!batchId) return;
    client.get(`/api/batches/${batchId}/sms-info/`).then((res) => setInfo(res.data));
  }, [batchId]);

  const smsParts = Math.max(1, Math.ceil(message.length / SMS_LENGTH));
  const recipientCount = info?.with_phone || 0;
  const totalSmsNeeded = recipientCount * smsParts;
  const balance = info?.balance || 0;
  const enough = balance >= totalSmsNeeded && recipientCount > 0;

  const insertTag = () => {
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = message.slice(0, start) + "[Student_Name]" + message.slice(end);
    setMessage(next);
    setTimeout(() => {
      el.focus();
      const pos = start + "[Student_Name]".length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const send = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { data } = await client.post("/api/sms/send-batch/", { batchId, messageTemplate: message });
      setResult(data);
      setMessage("");
      client.get(`/api/batches/${batchId}/sms-info/`).then((res) => setInfo(res.data));
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "পাঠানো যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell navItems={teacherNavItems} title="Bulk SMS">
      <div className="mx-auto max-w-2xl space-y-4">
        <Hero tone="violet" label="SMS ব্যালেন্স" value={balance} icon={MessageSquare} meta={<>~{balance}টি SMS পাঠানো যাবে</>}>
          <button onClick={() => navigate("/teacher/sms/recharge")} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold">
            <CreditCard className="h-3.5 w-3.5" /> Recharge
          </button>
        </Hero>

        <Card className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Batch নির্বাচন</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-ink-700">বার্তা</label>
              <button type="button" onClick={insertTag} className="text-xs font-medium text-brand-600 hover:underline">+ [Student_Name] যোগ করুন</button>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="যেমন: প্রিয় [Student_Name], আগামীকাল ক্লাস বন্ধ থাকবে।"
              className="w-full resize-none rounded-xl border border-line px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-ink-400">
              <span>{message.length} অক্ষর</span>
              <span>{smsParts} SMS/জন</span>
            </div>
          </div>

          {info && (
            <div className="space-y-1.5 rounded-xl bg-page p-3 text-xs">
              <div className="flex justify-between"><span className="text-ink-600">Batch-এ শিক্ষার্থী</span><span className="font-medium">{info.total_students} জন</span></div>
              <div className="flex justify-between"><span className="text-ink-600">ফোন নম্বর আছে</span><span className="font-medium">{recipientCount} জন</span></div>
              <div className="flex justify-between"><span className="text-ink-600">মোট SMS দরকার</span><span className="font-medium">{totalSmsNeeded}টি</span></div>
              <div className="mt-1.5 flex justify-between border-t border-line pt-1.5">
                <span className="text-ink-600">আপনার ব্যালেন্স</span>
                <span className={`font-bold ${enough ? "text-ok" : "text-err"}`}>{balance}টি</span>
              </div>
            </div>
          )}

          {recipientCount === 0 && info && (
            <p className="flex items-start gap-1.5 text-xs text-warn">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              এই batch-এ কারো ফোন নম্বর যোগ করা নেই। Student list-এ গিয়ে যোগ করুন।
            </p>
          )}

          {error && <p className="text-sm text-err">{error}</p>}

          {result && (
            <div className="flex items-start gap-2 rounded-xl bg-ok-bg p-3 text-sm text-ok">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {result.sent}/{result.total} জনকে পাঠানো হয়েছে।
                {result.failed > 0 && ` (${result.failed}টি ব্যর্থ, credit ফেরত দেওয়া হয়েছে)`}
              </span>
            </div>
          )}

          {enough ? (
            <Button loading={busy} disabled={!message.trim()} onClick={send} className="w-full">
              <Send className="h-4 w-4" /> {totalSmsNeeded}টি SMS পাঠান
            </Button>
          ) : (
            <div className="space-y-2">
              {recipientCount > 0 && <p className="text-center text-xs text-err">ব্যালেন্স যথেষ্ট নয় — আরও {totalSmsNeeded - balance}টি SMS দরকার</p>}
              <Button onClick={() => navigate("/teacher/sms/recharge")} className="w-full">
                <CreditCard className="h-4 w-4" /> SMS Recharge করুন
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
