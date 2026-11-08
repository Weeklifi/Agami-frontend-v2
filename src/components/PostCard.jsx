import { useState } from "react";
import { Calendar, Download, Link2, Trash2, Pin, FileText } from "lucide-react";
import Card from "./ui/Card";
import Avatar from "./ui/Avatar";
import { POST_TYPES, formatDateTime, isImageUrl, mediaUrl } from "../lib/postTypes";

const typeTone = {
  ANNOUNCEMENT: "bg-brand-50 text-brand-600",
  EXAM: "bg-amber-50 text-warn",
  CONTENT: "bg-violet-50 text-violet-600",
};

const accentBorder = {
  ANNOUNCEMENT: "border-l-brand-500",
  EXAM: "border-l-amber-500",
  RESULT: "border-l-emerald-500",
  CONTENT: "border-l-violet-500",
};

const plainText = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
};

export default function PostCard({ post, canManage, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const type = POST_TYPES[post.post_type] || POST_TYPES.ANNOUNCEMENT;
  const isLong = plainText(post.body).length > 220;

  const getFileName = (url) => (url ? url.split("/").pop() || "Download" : "File");

  return (
    <Card
      className={`w-full min-w-0 overflow-hidden !p-0 border-l-4
        ${accentBorder[post.post_type] || "border-l-ink-400"}
        ${post.is_pinned ? "border-brand-200 bg-brand-50/30" : ""}`}
    >
      <div className="flex items-center gap-3 border-b border-line px-4 pb-2.5 pt-3.5">
        <Avatar name={post.author_name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-ink-900">{post.author_name}</p>
          <p className="text-[11px] text-ink-400">{formatDateTime(post.created_at)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeTone[post.post_type] || "bg-page text-ink-600"}`}>
            {type.label}
          </span>
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warn-bg px-2 py-0.5 text-[11px] font-semibold text-warn">
              <Pin className="h-3 w-3" /> পিন
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 px-4 pb-4 pt-3">
        {post.event_date && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-warn/20 bg-warn-bg px-3 py-1.5 text-sm font-semibold text-warn">
            <Calendar className="h-4 w-4" />
            {formatDateTime(post.event_date)}
          </div>
        )}

        {post.body && (
          <>
            <div
              className={`relative min-w-0 whitespace-normal break-words text-[15px]
                leading-relaxed text-ink-900 [overflow-wrap:anywhere]
                [&_span]:inline [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic
                [&_u]:underline [&_s]:line-through [&_p]:my-2
                [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6
                [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1
                ${isLong && !expanded ? "max-h-24 overflow-hidden" : ""}`}
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
            {isLong && (
              <button onClick={() => setExpanded((v) => !v)} className="mt-1.5 text-xs font-semibold text-brand-600 hover:underline">
                {expanded ? "সংক্ষেপ করুন" : "বিস্তারিত দেখুন"}
              </button>
            )}
          </>
        )}

        {post.attachment && (
          <div className="mt-3">
            {isImageUrl(post.attachment) ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <img src={mediaUrl(post.attachment)} alt={post.title || "Attachment"} className="max-h-96 w-auto object-contain" />
              </div>
            ) : (
              <a
                href={mediaUrl(post.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-line px-4 py-3 transition-colors hover:bg-page"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{getFileName(post.attachment)}</p>
                  <p className="text-xs text-ink-400">ডাউনলোড / দেখুন</p>
                </div>
                <Download className="h-5 w-5 shrink-0 text-ink-400 group-hover:text-brand-600" />
              </a>
            )}
          </div>
        )}

        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex min-w-0 items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-page"
          >
            <Link2 className="h-5 w-5 shrink-0 text-ink-400" />
            <span className="truncate">{post.link_url}</span>
          </a>
        )}
      </div>

      {canManage && (
        <div className="flex justify-end border-t border-line bg-page/50 px-4 py-2">
          <button onClick={() => onDelete(post.id)} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-err">
            <Trash2 className="h-4 w-4" /> মুছুন
          </button>
        </div>
      )}
    </Card>
  );
}
