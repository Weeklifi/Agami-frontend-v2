import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Users, ClipboardCheck, BarChart3, Calendar, Wallet, UserPlus, KeyRound, Check } from "lucide-react";
import InviteModal from "../pages/teacher/InviteModal";

const TABS = (base, isTeacher) => [
  { to: `${base}`, label: "Room", icon: MessageSquare, end: true },
  ...(isTeacher ? [{ to: `${base}/students`, label: "শিক্ষার্থী", icon: Users }] : []),
  { to: `${base}/attendance`, label: "উপস্থিতি", icon: ClipboardCheck },
  { to: `${base}/results`, label: "ফলাফল", icon: BarChart3 },
  { to: `${base}/routine`, label: "রুটিন", icon: Calendar },
  { to: `${base}/fee`, label: "ফি", icon: Wallet },
];

export default function BatchSubnav({ batch, isTeacher }) {
  const { pathname } = useLocation();
  const base = `${isTeacher ? "/teacher" : "/student"}/batches/${batch.id}`;
  const tabs = TABS(base, isTeacher);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(batch.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const isActive = (to, end) => (end ? pathname === to : pathname.startsWith(to));

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{batch.name}</h1>
          {batch.subject && <p className="text-sm text-ink-500">{batch.subject}</p>}
        </div>
        {isTeacher && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-600 hover:bg-page"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <KeyRound className="h-3.5 w-3.5" />}
              {copied ? "কপি হয়েছে" : batch.invite_code}
            </button>
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
            >
              <UserPlus className="h-3.5 w-3.5" /> Invite
            </button>
          </div>
        )}
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-xl border border-line bg-surface p-1.5">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            state={{ batch }}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${isActive(tab.to, tab.end) ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-page"}`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </Link>
        ))}
      </div>

      {isTeacher && (
        <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} batchId={batch.id} />
      )}
    </div>
  );
}
