import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, CreditCard, ChevronLeft } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/layout/AppShell";
import Button from "../../components/ui/Button";
import Hero from "../../components/ui/Hero";
import { teacherNavItems } from "./navItems";

const PACKAGES = [
  { credits: 100, price: 50, popular: false },
  { credits: 500, price: 225, popular: true },
  { credits: 1000, price: 400, popular: false },
  { credits: 2000, price: 750, popular: false },
];

export default function SmsRecharge() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get("/api/sms/balance/").then((res) => setBalance(res.data.balance)).catch(() => {});
  }, []);

  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { data } = await client.post("/api/payments/sms-credit/", { credits: selected.credits });
      window.location.href = data.gateway_url;
    } catch (err) {
      alert(err.response?.data?.detail || "Payment শুরু করা যায়নি।");
      setBusy(false);
    }
  };

  return (
    <AppShell navItems={teacherNavItems} title="SMS Recharge">
      <div className="max-w-2xl space-y-4">
        <Hero tone="violet" label="বর্তমান SMS ব্যালেন্স" value={balance} icon={MessageSquare} meta={<>~{balance}টি SMS পাঠানো যাবে</>} />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">প্যাকেজ বেছে নিন</h2>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => {
              const isSelected = selected?.credits === pkg.credits;
              return (
                <button
                  key={pkg.credits}
                  onClick={() => setSelected(pkg)}
                  className={`shadow-soft relative rounded-2xl border bg-surface p-4 text-left transition-all
                    ${isSelected ? "border-2 border-brand-600 bg-brand-50/50" : "border-line hover:border-brand-300"}`}
                >
                  {pkg.popular && (
                    <span className="grad-brand shadow-brand absolute -top-2.5 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white">জনপ্রিয়</span>
                  )}
                  <p className="text-2xl font-extrabold text-ink-900">{pkg.credits}</p>
                  <p className="text-xs text-ink-400">SMS</p>
                  <p className="mt-2 text-lg font-bold text-brand-600">৳{pkg.price}</p>
                  <p className="text-[11px] text-ink-400">প্রতি SMS ৳{(pkg.price / pkg.credits).toFixed(2)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-page p-3">
              <span className="text-sm">{selected.credits} SMS</span>
              <span className="text-lg font-bold text-ink-900">৳{selected.price}</span>
            </div>
            <Button loading={busy} onClick={buy} className="w-full">
              <CreditCard className="h-4 w-4" /> ৳{selected.price} — Recharge করুন
            </Button>
          </div>
        )}

        <button onClick={() => navigate("/teacher/sms")} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
          <ChevronLeft className="h-4 w-4" /> Bulk SMS-এ ফিরে যান
        </button>
      </div>
    </AppShell>
  );
}
