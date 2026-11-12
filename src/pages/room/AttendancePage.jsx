import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ClipboardCheck, BarChart3 } from "lucide-react";
import { useBatch } from "../../api/queries";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import BatchSubnav from "../../components/BatchSubnav";
import PaymentLockScreen from "../../components/PaymentLockScreen";
import SubscriptionLockScreen from "../../components/SubscriptionLockScreen";
import AttendanceSheet from "./AttendanceSheet";
import AttendanceReport from "./AttendanceReport";
import AttendanceStudent from "./AttendanceStudent";
import { batchSidebarItems } from "../../lib/batchNav";
import { teacherNavItems } from "../teacher/navItems";
import { studentNavItems } from "../student/navItems";

export default function AttendancePage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const { data: fetchedBatch } = useBatch(id, isTeacher);
  const batch = fetchedBatch ?? location.state?.batch ?? null;
  const sidebarItems = batch ? batchSidebarItems(batch, isTeacher) : navItems;
  const [tab, setTab] = useState("sheet");

  const TABS = [
    { id: "sheet", label: "হাজিরা নিন", icon: ClipboardCheck },
    { id: "report", label: "মাসিক রিপোর্ট", icon: BarChart3 },
  ];

  const paymentLocked = !isTeacher && batch?.payment_lock?.locked;
  const subscriptionLocked = isTeacher && batch?.subscription_lock?.locked;

  return (
    <AppShell navItems={navItems} sidebarItems={sidebarItems} title={isTeacher ? "উপস্থিতি" : "আমার উপস্থিতি"}>
      {batch ? <BatchSubnav batch={batch} isTeacher={isTeacher} /> : <div className="mb-5 h-24 animate-pulse rounded-xl bg-line-soft" />}

      {paymentLocked ? (
        <PaymentLockScreen info={batch.payment_lock.info} isTeacher={isTeacher} batchId={id} />
      ) : subscriptionLocked ? (
        <SubscriptionLockScreen message={batch.subscription_lock.message} />
      ) : isTeacher ? (
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex gap-1 border-b border-line">
            {TABS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors
                  ${tab === item.id ? "border-b-2 border-brand-600 font-semibold text-brand-600" : "text-ink-600 hover:text-ink-900"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          {tab === "sheet" ? <AttendanceSheet batchId={id} /> : <AttendanceReport batchId={id} />}
        </Card>
      ) : (
        <div className="mx-auto max-w-xl">
          <AttendanceStudent batchId={id} />
        </div>
      )}
    </AppShell>
  );
}
