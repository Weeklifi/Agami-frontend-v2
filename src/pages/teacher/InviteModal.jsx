import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export default function InviteModal({ open, onClose, batchId }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    const emails = [...new Set((raw.match(EMAIL_RE) || []).map((s) => s.toLowerCase()))];

    if (emails.length === 0) {
      setError("অন্তত একটি সঠিক email দিন।");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post(`/api/batches/${batchId}/invite/`, { emails });
      setResult(data);
      setRaw("");
      setFileName("");
    } catch (err) {
      setError(err.response?.data?.emails?.[0] || "পাঠানো যায়নি — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const pickFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      // CSV-র প্রতিটা cell/line থেকে valid email token-ই শুধু তুলে নিই —
      // কোন column-এ email আছে সেটা নিয়ে ভাবতে হয় না।
      setRaw((prev) => (prev ? `${prev}\n${reader.result}` : reader.result));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const emailCount = new Set((raw.match(EMAIL_RE) || []).map((s) => s.toLowerCase())).size;

  const close = () => {
    setResult(null);
    setError("");
    setFileName("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Email Invitation">
      {result ? (
        <div className="space-y-3">
          {result.sent.length > 0 && (
            <div className="rounded-lg bg-ok-bg p-3 text-sm text-ok">✓ পাঠানো হয়েছে: {result.sent.join(", ")}</div>
          )}
          {result.skipped.length > 0 && (
            <div className="rounded-lg bg-warn-bg p-3 text-sm text-warn">
              {result.skipped.map((s) => (
                <p key={s.email}>⚠ {s.email} — {s.reason}</p>
              ))}
            </div>
          )}
          <Button variant="secondary" onClick={close} className="w-full">ঠিক আছে</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-ink-700">শিক্ষার্থীদের Email</label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
                <Upload className="h-3.5 w-3.5" /> CSV আপলোড
                <input ref={fileInputRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={pickFile} />
              </label>
            </div>
            <textarea
              rows={5}
              placeholder={"rahim@example.com\nkarim@example.com\n\nঅথবা উপরের 'CSV আপলোড' দিয়ে ফাইল থেকে একসাথে আনুন"}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-ink-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>একাধিক email কমা বা নতুন লাইনে আলাদা করুন</span>
              {fileName && <span className="truncate text-ink-500">{fileName} থেকে আনা হয়েছে</span>}
            </div>
            {emailCount > 0 && <p className="text-xs font-medium text-brand-600">{emailCount}টি সঠিক email পাওয়া গেছে</p>}
          </div>
          {error && <p className="text-sm text-err">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Invitation পাঠান</Button>
        </form>
      )}
    </Modal>
  );
}
