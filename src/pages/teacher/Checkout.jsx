import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { teacherNavItems } from "./navItems";

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-700">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-line py-2.5">
      <span className="text-sm text-ink-600">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}

export default function Checkout() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ institution_name: "", subject: "", contact_number: "", district: "" });
  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null);
  const [validating, setValidating] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [reason, setReason] = useState(null);

  useEffect(() => {
    client.get("/api/subscriptions/plans/").then((res) => {
      const list = res.data.results || res.data;
      setPlan(list.find((p) => p.id === planId) || null);
    });

    const saved = localStorage.getItem("referral_code");
    if (saved) {
      setRefCode(saved);
      validateCode(saved);
    }

    client
      .get("/api/referrals/profile/")
      .then((res) =>
        setForm((f) => ({
          ...f,
          institution_name: res.data.institution_name || "",
          subject: res.data.subject || "",
          contact_number: res.data.contact_number || "",
          district: res.data.district || "",
        }))
      )
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  useEffect(() => {
    if (plan) recalcPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, refState]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validateCode = async (code) => {
    if (!code.trim()) return setRefState(null);
    setValidating(true);
    try {
      const { data } = await client.post("/api/referrals/validate-code/", { code: code.trim() });
      setRefState(data);
    } catch (err) {
      setRefState({ valid: false, detail: err.response?.data?.detail || "কোডটি সঠিক নয়।" });
    } finally {
      setValidating(false);
    }
  };

  const recalcPrice = async () => {
    try {
      const { data } = await client.post("/api/referrals/checkout-init/", {
        plan_id: planId,
        referral_code: refState?.valid ? refCode.trim() : "",
        ...form,
      });
      setPricing(data.pricing);
      setReason(data.discount_reason);
    } catch {
      setPricing({ base_price: plan.price, discount_percent: 0, discount_amount: 0, final_price: plan.price });
    }
  };

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      await client.patch("/api/referrals/profile/", form).catch(() => {});
      const { data } = await client.post("/api/payments/subscribe/", { plan_id: planId, referral_code: refState?.valid ? refCode.trim() : "" });
      localStorage.removeItem("referral_code");
      window.location.href = data.gateway_url;
    } catch (err) {
      setError(err.response?.data?.detail || "Payment শুরু করা যায়নি।");
      setBusy(false);
    }
  };

  if (!plan) {
    return (
      <AppShell navItems={teacherNavItems} title="Checkout">
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      </AppShell>
    );
  }

  const price = pricing || { base_price: plan.price, discount_percent: 0, discount_amount: 0, final_price: plan.price };

  return (
    <AppShell navItems={teacherNavItems} title="Checkout">
      <div className="mx-auto max-w-md space-y-4">
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-ink-900">আপনার তথ্য</h2>
          <Field label="কোচিং সেন্টারের নাম" value={form.institution_name} onChange={set("institution_name")} />
          <Field label="কী পড়ান" value={form.subject} onChange={set("subject")} />
          <Field label="মোবাইল নম্বর" value={form.contact_number} onChange={set("contact_number")} />
          <Field label="জেলা" value={form.district} onChange={set("district")} />
        </Card>

        <Card className="space-y-2">
          <label className="text-sm font-semibold text-ink-900">Referral Code (থাকলে)</label>
          <div className="flex gap-2">
            <input
              value={refCode}
              onChange={(e) => { setRefCode(e.target.value.toUpperCase()); setRefState(null); }}
              placeholder="যেমন ABCD1234"
              className="flex-1 rounded-xl border border-line px-3.5 py-2.5 text-sm uppercase tracking-wider outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <Button variant="secondary" className="px-4" loading={validating} onClick={() => validateCode(refCode)}>যাচাই</Button>
          </div>
          {refState?.valid && (
            <p className="flex items-center gap-1 text-xs text-ok">
              <CheckCircle2 className="h-3.5 w-3.5" /> {refState.referrer_name}-এর কোড — {refState.discount_percent}% ছাড়
            </p>
          )}
          {refState && !refState.valid && <p className="text-xs text-err">{refState.detail}</p>}
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-bold text-ink-900">Order সারসংক্ষেপ</h2>

          <Row label="Plan" value={plan.name} />
          <Row label="মূল দাম" value={`৳${Math.round(price.base_price)}`} />

          {price.discount_percent > 0 && (
            <div className="flex items-center justify-between border-b border-dashed border-line py-2.5 text-ok">
              <span className="text-sm">ছাড় ({price.discount_percent}%){reason?.type === "referrer" && " · referral bonus"}</span>
              <span className="text-sm font-semibold">−৳{Math.round(price.discount_amount)}</span>
            </div>
          )}

          <div className="mt-1 flex items-center justify-between border-t-2 border-line pt-3">
            <span className="text-sm font-bold text-ink-900">মোট</span>
            <span className="text-xl font-extrabold text-brand-600">৳{Math.round(price.final_price)}</span>
          </div>

          {error && <p className="mt-2 text-sm text-err">{error}</p>}

          <div className="mt-4 space-y-2">
            <Button loading={busy} onClick={pay} className="w-full">
              <CreditCard className="h-4 w-4" /> ৳{Math.round(price.final_price)} — Pay করুন
            </Button>
            <Button variant="secondary" onClick={() => navigate("/teacher/plans")} className="w-full">বাতিল</Button>
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5" /> bKash · Nagad · Rocket · Card — SSLCommerz-এর নিরাপদ gateway
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
