import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Flame, Gift, ShieldCheck } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/layout/AppShell";
import Button from "../../components/ui/Button";
import { teacherNavItems } from "./navItems";

const COMMON_FEATURES = [
  "নোটিশ, পরীক্ষা ও ফলাফল",
  "ক্লাস রুটিন ব্যবস্থাপনা",
  "বেতন আদায়ের হিসাব",
  "Email ও in-app notification",
];

const planFeatures = (p) => [
  p.batch_limit ? `সর্বোচ্চ ${p.batch_limit}টা batch` : "সীমাহীন batch",
  "প্রতি batch-এ সর্বোচ্চ ৪০ জন শিক্ষার্থী",
  ...COMMON_FEATURES,
];

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [status, setStatus] = useState(null);
  const [trialBusy, setTrialBusy] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = () => client.get("/api/subscriptions/me/").then((res) => setStatus(res.data));

  useEffect(() => {
    client.get("/api/subscriptions/plans/").then((res) => setPlans(res.data.results || res.data));
    loadStatus();
  }, []);

  const currentPlanId = status?.subscription ? status.subscription.plan?.id : null;
  const selectPlan = (plan) => navigate(`/teacher/checkout/${plan.id}`);

  const startTrial = async () => {
    setTrialBusy(true);
    setError("");
    try {
      await client.post("/api/subscriptions/trial/");
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.detail || "ব্যর্থ হয়েছে।");
    } finally {
      setTrialBusy(false);
    }
  };

  return (
    <AppShell navItems={teacherNavItems} title="Plans">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-ink-900">সঠিক plan বেছে নিন</h1>
          <p className="mt-1.5 text-sm text-ink-600">যেকোনো সময় upgrade বা বাতিল করতে পারবেন। কোনো লুকানো খরচ নেই।</p>
        </div>

        {plans === null ? (
          <p className="text-center text-sm text-ink-400">লোড হচ্ছে…</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-sm text-ink-400">কোনো plan পাওয়া যায়নি।</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => {
              const popular = p.name === "Standard";
              const isCurrent = currentPlanId === p.id;
              const trialUsedUp = p.is_trial_plan && !isCurrent && !status?.trial_available;
              return (
                <div
                  key={p.id}
                  className={`shadow-soft relative flex flex-col rounded-2xl border bg-surface p-6 ${popular ? "shadow-pop border-2 border-brand-600" : "border-line"}`}
                >
                  {popular && (
                    <span className="grad-brand shadow-brand absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white">
                      <Flame className="h-3.5 w-3.5" /> সবচেয়ে জনপ্রিয়
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-ink-900">{p.name}</h3>
                  <p className="mt-1 text-xs text-ink-400">{p.is_trial_plan ? "একবারই ব্যবহারযোগ্য" : p.interval === "MONTHLY" ? "মাসিক বিলিং" : "বার্ষিক বিলিং"}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-ink-900">{p.is_trial_plan ? "Free" : `৳${Math.round(p.price)}`}</span>
                    {!p.is_trial_plan && <span className="text-sm text-ink-400">/{p.interval === "MONTHLY" ? "মাস" : "বছর"}</span>}
                  </div>

                  {p.is_trial_plan && <p className="mt-1 text-xs font-medium text-ok">{p.duration_days} দিনের জন্য</p>}
                  {p.interval === "YEARLY" && <p className="mt-1 text-xs font-medium text-ok">মাসিকের চেয়ে সাশ্রয়ী 💰</p>}

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {planFeatures(p).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-ok-bg text-ok">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-ink-600">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrent ? (
                      <Button variant="secondary" disabled className="w-full">✓ বর্তমান plan</Button>
                    ) : p.is_trial_plan ? (
                      <Button
                        variant="secondary"
                        disabled={trialUsedUp || trialBusy}
                        loading={trialBusy}
                        onClick={startTrial}
                        className="w-full"
                      >
                        <Gift className="h-4 w-4" /> {trialUsedUp ? "আগেই ব্যবহার হয়েছে" : "ফ্রি ট্রায়াল শুরু করুন"}
                      </Button>
                    ) : (
                      <Button variant={popular ? "primary" : "secondary"} onClick={() => selectPlan(p)} className="w-full">
                        এই plan নিন
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-err">{error}</p>}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
          <ShieldCheck className="h-4 w-4" /> নিরাপদ payment · যেকোনো সময় বাতিলযোগ্য
        </p>
      </div>
    </AppShell>
  );
}
