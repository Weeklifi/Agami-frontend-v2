import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(params.get("next") || "/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Email অথবা password ভুল হয়েছে।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="লগইন করুন"
      subtitle="আপনার Agami অ্যাকাউন্টে ফিরে আসুন"
      footer={
        <>
          অ্যাকাউন্ট নেই?{" "}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Account তৈরি করুন
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
          <Input
            icon={Mail}
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
          <Input
            icon={Lock}
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-err-bg px-3 py-2 text-sm text-err">{error}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          লগইন করুন
        </Button>
      </form>
    </AuthLayout>
  );
}
