import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessagesSquare, Megaphone, UserPlus, KeyRound, Check } from "lucide-react";
import client from "../../api/client";
import { useBatch, usePosts, useInvalidatePosts } from "../../api/queries";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/layout/AppShell";
import PostCard from "../../components/PostCard";
import Card from "../../components/ui/Card";
import InviteModal from "../teacher/InviteModal";
import PaymentLockScreen from "../../components/PaymentLockScreen";
import SubscriptionLockScreen from "../../components/SubscriptionLockScreen";
import Composer from "./Composer";
import GeneralChannel from "./GeneralChannel";
import { batchSidebarItems } from "../../lib/batchNav";
import { teacherNavItems } from "../teacher/navItems";
import { studentNavItems } from "../student/navItems";

const CHANNELS = [
  { key: "general", label: "general", icon: MessagesSquare, badge: "সবাই পোস্ট করতে পারবে" },
  { key: "announcements", label: "announcements", icon: Megaphone, badge: "শুধু শিক্ষক" },
];

function AnnouncementsChannel({ batchId, isTeacher, batch }) {
  const { data: rawPosts, isLoading: loading } = usePosts(batchId);
  const invalidatePosts = useInvalidatePosts();
  const posts = rawPosts ? [...rawPosts].reverse() : [];
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const firstLoad = useRef(true);
  const load = useCallback(() => invalidatePosts(batchId), [batchId, invalidatePosts]);

  useEffect(() => {
    if (posts.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: firstLoad.current ? "auto" : "smooth", block: "nearest" });
    firstLoad.current = false;
  }, [posts]);

  const handleDelete = async (postId) => {
    if (!confirm("এই পোস্ট মুছে ফেলতে চান?")) return;
    await client.delete(`/api/batches/${batchId}/posts/${postId}/`);
    load();
  };

  const q = search.toLowerCase();
  const filtered = posts.filter((p) => p.title?.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q));
  const pinned = filtered.filter((p) => p.is_pinned);
  const regular = filtered.filter((p) => !p.is_pinned);

  return (
    <div className="h-full min-h-0 space-y-4 overflow-y-auto px-3 py-3 sm:px-4">
      {!isTeacher && (
        <div className="rounded-xl bg-page px-3.5 py-2 text-xs text-ink-500">
          🔒 এই চ্যানেলে শুধু শিক্ষক পোস্ট করতে পারেন — আপনি পড়তে পারবেন।
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="পোস্ট খুঁজুন…"
        className="w-full rounded-xl border border-line bg-surface py-2.5 px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
      />

      {isTeacher && <Composer batchId={batchId} onPosted={load} />}

      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600">গুরুত্বপূর্ণ</p>
          {pinned.map((post) => (
            <PostCard key={post.id} post={post} canManage={isTeacher} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div className="min-w-0 space-y-3">
        {loading ? (
          <p className="py-12 text-center text-sm text-ink-400">লোড হচ্ছে…</p>
        ) : filtered.length === 0 ? (
          <Card className="border-2 border-dashed py-16 text-center">
            <p className="text-base font-semibold text-ink-700">এখনো কোনো পোস্ট নেই</p>
            <p className="mt-1 text-sm text-ink-400">{search ? "কোনো ফলাফল নেই।" : "প্রথম ঘোষণা দিয়ে শুরু করুন।"}</p>
          </Card>
        ) : (
          regular.map((post) => <PostCard key={post.id} post={post} canManage={isTeacher} onDelete={handleDelete} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function ChatHeader({ batch, isTeacher, channel, onChannel, onBack }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(batch.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-line bg-surface px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onBack}
          aria-label="ফিরে যান"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line text-ink-600 hover:bg-page"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-tight text-ink-900">{batch.name}</p>
          {batch.subject && <p className="truncate text-xs text-ink-500">{batch.subject}</p>}
        </div>
        {isTeacher && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={copyCode}
              title={batch.invite_code}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-600 hover:bg-page"
            >
              {copied ? <Check className="h-4 w-4 text-ok" /> : <KeyRound className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setInviteOpen(true)}
              title="Invite"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700"
            >
              <UserPlus className="h-4 w-4" />
            </button>
            <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} batchId={batch.id} />
          </div>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {CHANNELS.map((c) => (
          <button
            key={c.key}
            onClick={() => onChannel(c.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors
              ${channel === c.key ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-ink-600 hover:bg-page"}`}
          >
            <c.icon className="h-3.5 w-3.5" /> #{c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RoomPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const navItems = isTeacher ? teacherNavItems : studentNavItems;
  const [channel, setChannel] = useState("general");

  const { data: fetchedBatch } = useBatch(id, isTeacher);
  const batch = fetchedBatch ?? location.state?.batch ?? null;

  const paymentLocked = !isTeacher && batch?.payment_lock?.locked;
  const subscriptionLocked = isTeacher && batch?.subscription_lock?.locked;

  const sidebarItems = batch
    ? [
        ...batchSidebarItems(batch, isTeacher),
        ...CHANNELS.map((c) => ({ key: c.key, icon: c.icon, label: `#${c.label}`, onClick: () => setChannel(c.key) })),
      ]
    : navItems;

  const goBack = () => navigate(isTeacher ? "/teacher/batches" : "/student/batches");

  return (
    <AppShell navItems={navItems} sidebarItems={sidebarItems} sidebarActiveKey={channel} fullBleed>
      {!batch ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-24 w-full max-w-sm animate-pulse rounded-xl bg-line-soft" />
        </div>
      ) : paymentLocked ? (
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          <PaymentLockScreen info={batch.payment_lock.info} isTeacher={isTeacher} batchId={id} />
        </div>
      ) : subscriptionLocked ? (
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          <SubscriptionLockScreen message={batch.subscription_lock.message} />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <ChatHeader batch={batch} isTeacher={isTeacher} channel={channel} onChannel={setChannel} onBack={goBack} />
          <div className="min-h-0 flex-1 overflow-hidden">
            {channel === "general" ? (
              <GeneralChannel batchId={id} />
            ) : (
              <AnnouncementsChannel batchId={id} isTeacher={isTeacher} batch={batch} />
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
