import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import client from "../../api/client";
import { useBatch, usePosts, useInvalidatePosts } from "../../api/queries";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/layout/AppShell";
import PostCard from "../../components/PostCard";
import Card from "../../components/ui/Card";
import BatchSubnav from "../../components/BatchSubnav";
import PaymentLockScreen from "../../components/PaymentLockScreen";
import SubscriptionLockScreen from "../../components/SubscriptionLockScreen";
import Composer from "./Composer";
import { teacherNavItems } from "../teacher/navItems";
import { studentNavItems } from "../student/navItems";
import { TodayAttendanceWidget, RecipientsWidget, UpcomingExamsWidget } from "./RoomWidgets";

export default function RoomPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const { data: fetchedBatch } = useBatch(id, isTeacher);
  const batch = fetchedBatch ?? location.state?.batch ?? null;
  const { data: rawPosts, isLoading: loading } = usePosts(id);
  const invalidatePosts = useInvalidatePosts();
  const posts = rawPosts ? [...rawPosts].reverse() : [];
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const firstLoad = useRef(true);
  const load = useCallback(() => invalidatePosts(id), [id, invalidatePosts]);

  useEffect(() => {
    if (posts.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: firstLoad.current ? "auto" : "smooth", block: "nearest" });
    firstLoad.current = false;
  }, [posts]);

  const handleDelete = async (postId) => {
    if (!confirm("এই পোস্ট মুছে ফেলতে চান?")) return;
    await client.delete(`/api/batches/${id}/posts/${postId}/`);
    load();
  };

  const now = new Date();
  const q = search.toLowerCase();
  const filtered = posts.filter((p) => p.title?.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q));
  const pinned = filtered.filter((p) => p.is_pinned);
  const regular = filtered.filter((p) => !p.is_pinned);

  const upcomingExams = posts
    .filter((p) => p.post_type === "EXAM" && p.event_date && new Date(p.event_date) > now)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 3);

  const paymentLocked = !isTeacher && batch?.payment_lock?.locked;
  const subscriptionLocked = isTeacher && batch?.subscription_lock?.locked;
  const locked = paymentLocked || subscriptionLocked;

  return (
    <AppShell navItems={navItems} title={batch ? batch.name : "Room"}>
      {batch ? <BatchSubnav batch={batch} isTeacher={isTeacher} /> : <div className="mb-5 h-24 animate-pulse rounded-xl bg-line-soft" />}

      {paymentLocked ? (
        <PaymentLockScreen info={batch.payment_lock.info} isTeacher={isTeacher} batchId={id} />
      ) : subscriptionLocked ? (
        <SubscriptionLockScreen message={batch.subscription_lock.message} />
      ) : (
        <>
      <div className="mb-4 relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="পোস্ট খুঁজুন…"
          className="w-full rounded-xl border border-line bg-surface py-2.5 px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
        />
      </div>

      <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          {isTeacher && <Composer batchId={id} onPosted={load} />}

          {pinned.length > 0 && (
            <div className="space-y-3">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600">গুরুত্বপূর্ণ</p>
              {pinned.map((post) => (
                <PostCard key={post.id} post={post} canManage={isTeacher} onDelete={handleDelete} />
              ))}
            </div>
          )}

          <div className="min-w-0 space-y-3">
            {(pinned.length > 0 || regular.length > 0) && (
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">সাম্প্রতিক ঘোষণা</p>
            )}
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

        {batch && (
          <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
            {isTeacher && <TodayAttendanceWidget batchId={id} />}
            {isTeacher && <RecipientsWidget batchId={id} studentCount={batch.student_count ?? 0} />}
            <UpcomingExamsWidget exams={upcomingExams} />
          </div>
        )}
      </div>
        </>
      )}
    </AppShell>
  );
}
