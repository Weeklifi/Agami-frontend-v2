import { useState } from "react";
import { UserPlus, KeyRound, Check } from "lucide-react";
import InviteModal from "../pages/teacher/InviteModal";

/** Batch নাম/বিষয় + invite — এখন tab-pills এই কম্পোনেন্টে নেই, ওগুলো
 * left Sidebar-এ সরানো হয়েছে (batchNav.js দ্রষ্টব্য)।
 */
export default function BatchHeader({ batch, isTeacher }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(batch.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
          <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} batchId={batch.id} />
        </div>
      )}
    </div>
  );
}
