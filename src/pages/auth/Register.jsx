import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import client from "../../api/client";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await client.post("/api/auth/users/", form);
      navigate("/check-email", { state: { email: form.email } });
    } catch (err) {
      setErrors(err.response?.data || { detail: "কিছু একটা ভুল হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key) => errors[key]?.[0];

  return (
    <AuthLayout
      title="Account তৈরি করুন"
      subtitle="কোচিং পরিচালনা হোক আরও সহজ"
      footer={
        <>
          অ্যাকাউন্ট আছে?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            লগইন করুন
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">নাম</label>
            <Input
              icon={User}
              required
              placeholder="প্রথম নাম"
              value={form.first_name}
              onChange={set("first_name")}
              error={fieldError("first_name")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">&nbsp;</label>
            <Input
              placeholder="শেষ নাম"
              value={form.last_name}
              onChange={set("last_name")}
              error={fieldError("last_name")}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
          <Input
            icon={Mail}
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            error={fieldError("email")}
          />
          {fieldError("email") && (
            <p className="mt-1 text-xs text-err">{fieldError("email")}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
          <Input
            icon={Lock}
            type="password"
            required
            placeholder="কমপক্ষে ৮ অক্ষর"
            value={form.password}
            onChange={set("password")}
            error={fieldError("password")}
          />
          {fieldError("password") && (
            <p className="mt-1 text-xs text-err">{fieldError("password")}</p>
          )}
        </div>

        {errors.detail && (
          <p className="rounded-lg bg-err-bg px-3 py-2 text-sm text-err">{errors.detail}</p>
        )}

        <p className="text-xs text-ink-500">
          Account তৈরি করলেই আপনি batch খুলতে পারবেন। কোনো teacher-এর ব্যাচে
          student হিসেবে যোগ দিতে চাইলে তার invite code বা email-এর লিংক ব্যবহার করুন।
        </p>

        <Button type="submit" loading={loading} className="w-full">
          Account তৈরি করুন
        </Button>
      </form>
    </AuthLayout>
  );
}
