import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useBatch } from "../../api/queries";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import BatchSubnav from "../../components/BatchSubnav";
import PaymentLockScreen from "../../components/PaymentLockScreen";
import SubscriptionLockScreen from "../../components/SubscriptionLockScreen";
import ExamList from "./ExamList";
import ExamSheet from "./ExamSheet";
import Leaderboard from "./Leaderboard";
import { teacherNavItems } from "../teacher/navItems";
import { studentNavItems } from "../student/navItems";

export default function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const { data: fetchedBatch } = useBatch(id, isTeacher);
  const batch = fetchedBatch ?? location.state?.batch ?? null;
  const [view, setView] = useState({ mode: "list", exam: null });

  const backToList = () => setView({ mode: "list", exam: null });

  const paymentLocked = !isTeacher && batch?.payment_lock?.locked;
  const subscriptionLocked = isTeacher && batch?.subscription_lock?.locked;

  return (
    <AppShell navItems={navItems} title="ফলাফল">
      {batch ? <BatchSubnav batch={batch} isTeacher={isTeacher} /> : <div className="mb-5 h-24 animate-pulse rounded-xl bg-line-soft" />}

      {paymentLocked ? (
        <PaymentLockScreen info={batch.payment_lock.info} isTeacher={isTeacher} batchId={id} />
      ) : subscriptionLocked ? (
        <SubscriptionLockScreen message={batch.subscription_lock.message} />
      ) : (
      <Card className="p-4 sm:p-5">
        {view.mode === "list" && (
          <ExamList batchId={id} isTeacher={isTeacher} onOpenSheet={(ex) => setView({ mode: "sheet", exam: ex })} onOpenBoard={(ex) => setView({ mode: "board", exam: ex })} />
        )}
        {view.mode === "sheet" && <ExamSheet exam={view.exam} onBack={backToList} />}
        {view.mode === "board" && <Leaderboard exam={view.exam} isTeacher={isTeacher} onBack={backToList} />}
      </Card>
      )}
    </AppShell>
  );
}
