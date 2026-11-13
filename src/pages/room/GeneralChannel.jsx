import { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Send, ThumbsUp, MessageCircle, FileText, Download } from "lucide-react";
import {
  useMessages,
  useReplies,
  usePresence,
  useSendMessage,
  useSendReply,
  useToggleReaction,
  useHeartbeat,
} from "../../api/queries";
import { mediaUrl, isImageUrl } from "../../lib/postTypes";

const dayLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "আজ";
  if (sameDay(d, yesterday)) return "গতকাল";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long" });
};

const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" });

const fileName = (url) => (url ? url.split("/").pop() : "");

function Attachment({ url }) {
  if (!url) return null;
  if (isImageUrl(url)) {
    return (
      <div className="mt-2 overflow-hidden rounded-xl border border-line">
        <img src={mediaUrl(url)} alt="" className="max-h-72 w-auto object-contain" />
      </div>
    );
  }
  return (
    <a
      href={mediaUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-2 flex items-center gap-3 rounded-xl border border-line bg-page px-3.5 py-2.5 hover:bg-line-soft"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <FileText className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{fileName(url)}</p>
        <p className="text-[11px] text-ink-400">ডাউনলোড করুন</p>
      </div>
      <Download className="h-4 w-4 shrink-0 text-ink-400 group-hover:text-brand-600" />
    </a>
  );
}

function ReplyThread({ batchId, messageId, open }) {
  const { data: replies } = useReplies(batchId, messageId, open);
  const sendReply = useSendReply(batchId, messageId);
  const [text, setText] = useState("");

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    const fd = new FormData();
    fd.append("body", body);
    sendReply.mutate(fd);
    setText("");
  };

  if (!open) return null;

  return (
    <div className="mt-2.5 space-y-2.5 border-l-2 border-line pl-3.5">
      {replies?.map((r) => (
        <div key={r.id}>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-ink-900">{r.author_name}</span>
            {r.is_teacher && (
              <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold text-brand-600">Teacher</span>
            )}
            <span className="text-[10px] text-ink-400">{timeLabel(r.created_at)}</span>
          </div>
          {r.body && <p className="text-[13px] text-ink-700">{r.body}</p>}
          <Attachment url={r.attachment} />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="উত্তর লিখুন…"
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-brand-500"
        />
        <button onClick={submit} className="text-xs font-semibold text-brand-600 hover:underline">পাঠান</button>
      </div>
    </div>
  );
}

function MessageRow({ batchId, message, isTeacherAuthor }) {
  const toggleReaction = useToggleReaction(batchId);
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <div className="px-1 py-1.5">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[13px] font-bold text-ink-900">{message.author_name}</span>
        {isTeacherAuthor && (
          <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold text-brand-600">Teacher</span>
        )}
        <span className="text-[11px] text-ink-400">{timeLabel(message.created_at)}</span>
      </div>

      {message.body && (
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-ink-800">
          {message.body}
        </p>
      )}
      <Attachment url={message.attachment} />

      <div className="mt-1.5 flex items-center gap-2">
        <button
          onClick={() => toggleReaction.mutate(message.id)}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors
            ${message.reacted_by_me
              ? "border-brand-200 bg-brand-50 text-brand-600"
              : "border-line text-ink-500 hover:border-brand-200 hover:text-brand-600"}`}
        >
          <ThumbsUp className="h-3 w-3" fill={message.reacted_by_me ? "currentColor" : "none"} />
          Helpful{message.reaction_count > 0 ? ` · ${message.reaction_count}` : ""}
        </button>

        {message.reply_count > 0 ? (
          <button
            onClick={() => setThreadOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-500 hover:text-brand-600"
          >
            <MessageCircle className="h-3 w-3" />
            {message.reply_count} replies
          </button>
        ) : (
          <button
            onClick={() => setThreadOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-400 hover:text-brand-600"
          >
            <MessageCircle className="h-3 w-3" /> উত্তর দিন
          </button>
        )}
      </div>

      <ReplyThread batchId={batchId} messageId={message.id} open={threadOpen} />
    </div>
  );
}

export default function GeneralChannel({ batchId }) {
  const { data: messages, isLoading } = useMessages(batchId);
  const { data: presence } = usePresence(batchId);
  const sendMessage = useSendMessage(batchId);
  const heartbeat = useHeartbeat(batchId);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);
  const firstLoad = useRef(true);
  const typingTimer = useRef(null);

  useEffect(() => {
    const id = setInterval(() => heartbeat.mutate(false), 20000);
    heartbeat.mutate(false);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  useEffect(() => {
    if (!messages?.length) return;
    bottomRef.current?.scrollIntoView({ behavior: firstLoad.current ? "auto" : "smooth", block: "nearest" });
    firstLoad.current = false;
  }, [messages]);

  const grouped = useMemo(() => {
    const out = [];
    let lastDay = null;
    (messages || []).forEach((m) => {
      const label = dayLabel(m.created_at);
      if (label !== lastDay) {
        out.push({ divider: label });
        lastDay = label;
      }
      out.push(m);
    });
    return out;
  }, [messages]);

  const onTextChange = (e) => {
    setText(e.target.value);
    heartbeat.mutate(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => heartbeat.mutate(false), 4000);
  };

  const submit = () => {
    const body = text.trim();
    if (!body && !file) return;
    const fd = new FormData();
    fd.append("body", body);
    if (file) fd.append("attachment", file);
    sendMessage.mutate(fd);
    setText("");
    setFile(null);
    heartbeat.mutate(false);
  };

  const typingNames = presence?.typing || [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3 sm:px-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-400">লোড হচ্ছে…</p>
        ) : grouped.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-ink-600">এখনো কোনো মেসেজ নেই</p>
            <p className="mt-1 text-xs text-ink-400">প্রথম মেসেজ পাঠিয়ে আলোচনা শুরু করুন।</p>
          </div>
        ) : (
          grouped.map((item, i) =>
            item.divider ? (
              <div key={`d-${i}`} className="my-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-[11px] font-medium text-ink-400">{item.divider}</span>
                <div className="h-px flex-1 bg-line" />
              </div>
            ) : (
              <MessageRow
                key={item.id}
                batchId={batchId}
                message={item}
                isTeacherAuthor={item.is_teacher}
              />
            )
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-line px-3 py-2.5 sm:px-4">
        {typingNames.length > 0 && (
          <p className="pb-1 text-[11px] italic text-ink-400">
            {typingNames.join(", ")} টাইপ করছে…
          </p>
        )}
        {file && (
          <div className="mb-1.5 flex items-center gap-2 rounded-lg bg-page px-3 py-1.5">
            <Paperclip className="h-3.5 w-3.5 text-ink-400" />
            <span className="flex-1 truncate text-xs">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-xs text-ink-400">✕</button>
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface p-1.5 focus-within:border-brand-400">
          <label className="cursor-pointer rounded-lg p-2 text-ink-400 hover:bg-page hover:text-ink-600">
            <Paperclip className="h-[18px] w-[18px]" />
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
          <input
            value={text}
            onChange={onTextChange}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Message #general"
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim() && !file}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
