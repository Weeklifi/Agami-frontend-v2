import { useState } from "react";
import { Sparkles, Paperclip, Pin, ArrowRight, X } from "lucide-react";
import client from "../../api/client";
import RichTextEditor from "../../components/RichTextEditor";
import { POST_TYPES } from "../../lib/postTypes";

const EMPTY = { post_type: "ANNOUNCEMENT", title: "", body: "", event_date: "", link_url: "", is_pinned: false };

const plainText = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
};

export default function Composer({ batchId, onPosted }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const bodyText = plainText(form.body);
  const canSend = form.title.trim() || bodyText || file;
  const isImage = file?.type?.startsWith("image/");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const pickFile = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    if (f?.type.startsWith("image/")) {
      const r = new FileReader();
      r.onloadend = () => setPreview(r.result);
      r.readAsDataURL(f);
    } else setPreview(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    const el = document.getElementById("composer-file");
    if (el) el.value = "";
  };

  const submit = async () => {
    if (!canSend || loading) return;
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    fd.append("post_type", form.post_type);
    fd.append("title", form.title.trim() || bodyText.slice(0, 60) || POST_TYPES[form.post_type].label);
    fd.append("body", form.body);
    fd.append("is_pinned", form.is_pinned);
    if (form.event_date) fd.append("event_date", form.event_date);
    if (form.link_url) fd.append("link_url", form.link_url);
    if (file) fd.append("attachment", file);

    try {
      await client.post(`/api/batches/${batchId}/posts/`, fd);
      setForm(EMPTY);
      clearFile();
      setOpen(false);
      setResetKey((k) => k + 1);
      onPosted();
    } catch (err) {
      setErrors(err.response?.data || { detail: "Post করা যায়নি।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="shadow-soft flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition-colors hover:border-brand-300"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="flex-1 rounded-full border border-line bg-page px-4 py-2.5 text-sm text-ink-400">
            কিছু লিখুন বা পোস্ট করুন…
          </span>
        </button>
      ) : (
        <div className="shadow-soft space-y-2.5 rounded-2xl border border-line bg-surface p-3.5">
          <div className="flex items-center gap-2 pb-0.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-ink-900">নতুন পোস্ট</span>
            {canSend && <span className="rounded-full bg-page px-2 py-0.5 text-[10px] font-semibold text-ink-400">খসড়া</span>}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(POST_TYPES).map(([value, cfg]) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, post_type: value })}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors
                  ${form.post_type === value ? "border-brand-600 bg-brand-600 text-white" : "border-line text-ink-500 hover:border-brand-300 hover:text-ink-700"}`}
              >
                {cfg.label}
              </button>
            ))}
            <button onClick={() => setOpen(false)} className="ml-auto p-1 text-ink-400 hover:text-ink-600" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {form.post_type === "EXAM" && (
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={set("event_date")}
              className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          )}
          {form.post_type === "CONTENT" && (
            <input
              type="url"
              placeholder="https:// — YouTube / Drive link"
              value={form.link_url}
              onChange={set("link_url")}
              className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          )}

          <RichTextEditor key={resetKey} value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} onEnter={submit} placeholder="এখানে লিখুন…" />

          {preview && (
            <div className="relative inline-block">
              <img src={preview} alt="" className="max-h-40 rounded-xl border border-line" />
              <button onClick={clearFile} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink-900 text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {file && !isImage && (
            <div className="flex items-center gap-2 rounded-xl bg-page px-3 py-2">
              <Paperclip className="h-4 w-4 text-ink-400" />
              <span className="flex-1 truncate text-xs">{file.name}</span>
              <button onClick={clearFile} className="text-ink-400"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}

          {Object.values(errors).map((e, i) => (
            <p key={i} className="text-xs text-err">{Array.isArray(e) ? e[0] : e}</p>
          ))}

          <div className="flex items-center gap-1">
            <label className="cursor-pointer rounded-lg p-2 text-ink-400 transition-colors hover:bg-page hover:text-ink-600" title="ফাইল যুক্ত করুন">
              <Paperclip className="h-[18px] w-[18px]" />
              <input id="composer-file" type="file" className="hidden" onChange={pickFile} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
            </label>

            <button
              onClick={() => setForm({ ...form, is_pinned: !form.is_pinned })}
              className={`rounded-lg p-2 transition-colors ${form.is_pinned ? "bg-brand-50 text-brand-600" : "text-ink-400 hover:bg-page hover:text-ink-600"}`}
              title="পিন করুন"
            >
              <Pin className="h-[18px] w-[18px]" fill={form.is_pinned ? "currentColor" : "none"} />
            </button>

            <button
              onClick={submit}
              disabled={!canSend || loading}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl grad-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {loading ? "…" : "পাঠান"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
