import { ArrowLeft, MessageSquare, Users, ClipboardCheck, BarChart3, Calendar, Wallet } from "lucide-react";

/** Batch-এর ভিতরে ঢুকলে left Sidebar-এ এই routed tab গুলো দেখায় — batch
 * থেকে বের হলে (অন্য কোনো পেজে গেলে) Sidebar আবার normal nav-এ ফিরে যায়,
 * কারণ শুধু batch page গুলোই এই override পাস করে।
 */
export function batchSidebarItems(batch, isTeacher) {
  const backTo = isTeacher ? "/teacher/batches" : "/student/batches";
  const base = `${isTeacher ? "/teacher" : "/student"}/batches/${batch.id}`;

  return [
    { to: backTo, icon: ArrowLeft, label: "← ব্যাচসমূহ" },
    { to: base, end: true, icon: MessageSquare, label: "Room", state: { batch } },
    ...(isTeacher ? [{ to: `${base}/students`, icon: Users, label: "শিক্ষার্থী", state: { batch } }] : []),
    { to: `${base}/attendance`, icon: ClipboardCheck, label: "উপস্থিতি", state: { batch } },
    { to: `${base}/results`, icon: BarChart3, label: "ফলাফল", state: { batch } },
    { to: `${base}/routine`, icon: Calendar, label: "রুটিন", state: { batch } },
    { to: `${base}/fee`, icon: Wallet, label: "ফি", state: { batch } },
  ];
}
