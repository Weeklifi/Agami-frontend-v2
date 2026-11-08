import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, GraduationCap, Mail, Phone, ShieldCheck, Lock, User as UserIcon } from "lucide-react";
import client, { tokenStore } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const STEPS = ["email", "phone", "account"];

function StepDots({ step }) {
  const idx = STEPS.indexOf(step.startsWith("email") ? "email" : step.startsWith("phone") ? "phone" : "account");
  return (
    <div className="mb-5 flex items-center justify-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className={`h-1.5 rounded-full transition-all ${i <= idx ? "w-8 bg-brand-600" : "w-5 bg-line"}`} />
      ))}
    </div>
  );
}

export default function JoinPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [invite, setInvite] = useState(null); // {batch, email, user_exists}
  const [status, setStatus] = useState("loading"); // loading | ready | invalid

  // সাইনআপ উইজার্ড: email -> email-code -> phone -> phone-code -> account
  const [step, setStep] = useState("email");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    client
      .get(`/api/batches/invitations/${token}/`)
      .then((res) => {
        setInvite(res.data);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const startCooldown = () => {
    setCooldown(60);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const sendEmailOtp = async () => {
    setBusy(true);
    setError("");
    try {
      await client.post("/api/batches/join/send-email-otp/", { token });
      setStep("email-code");
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.detail || "কোড পাঠানো যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  const verifyEmailOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await client.post("/api/batches/join/verify-email-otp/", { token, code });
      setCode("");
      setStep("phone");
      setCooldown(0);
      clearInterval(cooldownRef.current);
    } catch (err) {
      setError(err.response?.data?.detail || "কোড সঠিক নয়।");
    } finally {
      setBusy(false);
    }
  };

  const sendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) { setError("ফোন নম্বর দিন।"); return; }
    setBusy(true);
    setError("");
    try {
      await client.post("/api/batches/join/send-phone-otp/", { token, phone: phone.trim() });
      setStep("phone-code");
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.detail || "কোড পাঠানো যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  const verifyPhoneOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await client.post("/api/batches/join/verify-phone-otp/", { token, code });
      setCode("");
      setStep("account");
      setCooldown(0);
      clearInterval(cooldownRef.current);
    } catch (err) {
      setError(err.response?.data?.detail || "কোড সঠিক নয়।");
    } finally {
      setBusy(false);
    }
  };

  // নতুন user: signup + auto-join + auto-login
  const signup = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await client.post("/api/batches/join/invited-signup/", {
        token,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone,
      });
      tokenStore.set(data.access, data.refresh);
      setUser(data.user);
      navigate("/student", { replace: true });
    } catch (err) {
      const d = err.response?.data;
      setError(d?.password?.[0] || d?.phone?.[0] || d?.non_field_errors?.[0] || d?.detail || "ব্যর্থ হয়েছে।");
    } finally {
      setBusy(false);
    }
  };

  // Existing + logged-in user: শুধু accept
  const accept = async () => {
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/batches/invitations/${token}/accept/`);
      const me = await client.get("/api/auth/users/me/");
      setUser(me.data);
      navigate("/student/batches", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Accept করা যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading")
    return (
      <AuthLayout title="Invitation">
        <p className="text-center text-sm text-ink-600">যাচাই হচ্ছে…</p>
      </AuthLayout>
    );

  if (status === "invalid")
    return (
      <AuthLayout title="Invitation">
        <p className="text-center text-sm text-err">
          এই invitation-টি invalid, expired বা আগেই ব্যবহৃত। আপনার শিক্ষককে নতুন invitation পাঠাতে বলুন।
        </p>
      </AuthLayout>
    );

  const batchInfo = (
    <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-center">
      <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-600 shadow-soft">
        <BookOpen className="h-5 w-5" />
      </div>
      <p className="text-xs text-ink-600">আপনাকে আমন্ত্রণ জানানো হয়েছে</p>
      <p className="mt-1 font-bold">{invite.batch.name}</p>
      <p className="flex items-center justify-center gap-1 text-xs text-ink-600">
        <GraduationCap className="h-3.5 w-3.5" /> {invite.batch.teacher_name}
      </p>
    </div>
  );

  // অবস্থা ৩: logged in — শুধু confirm
  if (user) {
    const emailMatches = user.email.toLowerCase() === invite.email.toLowerCase();
    return (
      <AuthLayout title="Batch-এ Join করুন">
        {batchInfo}
        {emailMatches ? (
          <>
            {error && <p className="mb-3 text-sm text-err">{error}</p>}
            <Button onClick={accept} loading={busy} className="w-full">Join করুন</Button>
          </>
        ) : (
          <p className="text-center text-sm text-warn">
            এই invitation-টি <span className="font-medium">{invite.email}</span>-এর জন্য, কিন্তু আপনি {user.email} দিয়ে logged in। সঠিক account দিয়ে login করুন।
          </p>
        )}
      </AuthLayout>
    );
  }

  // অবস্থা ২: user আছে কিন্তু logged out
  if (invite.user_exists) {
    return (
      <AuthLayout title="Batch-এ Join করুন">
        {batchInfo}
        <p className="mb-4 text-center text-sm text-ink-600">
          <span className="font-medium">{invite.email}</span>-এ account আছে। Login করে join করুন।
        </p>
        <Link to={`/login?next=/join?token=${token}`}>
          <Button className="w-full">Login করুন</Button>
        </Link>
      </AuthLayout>
    );
  }

  // অবস্থা ১: নতুন user — ৩ ধাপে signup (Email verify → Phone verify → Account)
  return (
    <AuthLayout title="Account তৈরি করে Join করুন" subtitle="নিরাপত্তার জন্য প্রথমে email ও ফোন নম্বর verify করুন">
      {batchInfo}
      <StepDots step={step} />

      {(step === "email" || step === "email-code") && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
            <Input icon={Mail} value={invite.email} disabled />
          </div>

          {step === "email" ? (
            <Button onClick={sendEmailOtp} loading={busy} className="w-full">
              <ShieldCheck className="h-4 w-4" /> এই ইমেইলে কোড পাঠান
            </Button>
          ) : (
            <form onSubmit={verifyEmailOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Email-এ পাঠানো ৬-সংখ্যার কোড</label>
                <Input inputMode="numeric" maxLength={6} placeholder="১২৩৪৫৬" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} autoFocus />
              </div>
              <Button type="submit" loading={busy} className="w-full">Verify করুন</Button>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={sendEmailOtp}
                className="w-full text-center text-xs font-semibold text-brand-600 hover:underline disabled:text-ink-400 disabled:no-underline"
              >
                {cooldown > 0 ? `আবার কোড পাঠান (${cooldown}s)` : "আবার কোড পাঠান"}
              </button>
            </form>
          )}
        </div>
      )}

      {(step === "phone" || step === "phone-code") && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">মোবাইল নম্বর</label>
            <Input icon={Phone} placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={step === "phone-code"} />
          </div>

          {step === "phone" ? (
            <Button onClick={sendPhoneOtp} loading={busy} className="w-full">
              <ShieldCheck className="h-4 w-4" /> এই নম্বরে কোড পাঠান
            </Button>
          ) : (
            <form onSubmit={verifyPhoneOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">SMS-এ পাঠানো ৬-সংখ্যার কোড</label>
                <Input inputMode="numeric" maxLength={6} placeholder="১২৩৪৫৬" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} autoFocus />
              </div>
              <Button type="submit" loading={busy} className="w-full">Verify করুন</Button>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={sendPhoneOtp}
                className="w-full text-center text-xs font-semibold text-brand-600 hover:underline disabled:text-ink-400 disabled:no-underline"
              >
                {cooldown > 0 ? `আবার কোড পাঠান (${cooldown}s)` : "আবার কোড পাঠান"}
              </button>
            </form>
          )}
        </div>
      )}

      {step === "account" && (
        <form onSubmit={signup} className="space-y-4">
          <p className="flex items-center gap-1.5 rounded-lg bg-ok-bg px-3 py-2 text-xs font-medium text-ok">
            <ShieldCheck className="h-4 w-4" /> Email ও ফোন নম্বর verified
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">আপনার নাম</label>
            <Input icon={UserIcon} placeholder="রহিম" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
            <Input icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <p className="text-sm text-err">{error}</p>}
          <Button type="submit" loading={busy} className="w-full">Account তৈরি করুন ও Join করুন</Button>
        </form>
      )}

      {error && step !== "account" && <p className="mt-3 text-center text-sm text-err">{error}</p>}
    </AuthLayout>
  );
}
