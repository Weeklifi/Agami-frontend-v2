import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function CreateBatchModal({ open, onClose, onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", subject: "", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [needsSub, setNeedsSub] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await client.post("/api/batches/", form);
      onCreated();
      onClose();
      setForm({ name: "", subject: "", description: "" });
    } catch (err) {
      if (err.response?.status === 403) setNeedsSub(true);
      else setErrors(err.response?.data || { detail: "কিছু একটা ভুল হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    setLoading(true);
    try {
      await client.post("/api/subscriptions/trial/");
      setNeedsSub(false);
    } catch {
      navigate("/teacher/subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="নতুন Batch">
      {needsSub ? (
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-warn-bg text-warn">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-sm leading-relaxed text-ink-600">
            Batch তৈরি করতে একটি active subscription বা trial প্রয়োজন।
          </p>
          <Button onClick={startTrial} loading={loading} className="w-full">
            ফ্রি Trial শুরু করুন
          </Button>
          <button onClick={() => navigate("/teacher/subscription")} className="block w-full text-sm text-brand-600 hover:underline">
            Plan দেখুন
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Batch নাম</label>
            <Input placeholder="HSC 2027 Physics" value={form.name} onChange={set("name")} error={errors.name?.[0]} />
            {errors.name?.[0] && <p className="mt-1 text-xs text-err">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">বিষয় (ঐচ্ছিক)</label>
            <Input value={form.subject} onChange={set("subject")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">বিবরণ (ঐচ্ছিক)</label>
            <Input value={form.description} onChange={set("description")} />
          </div>
          {errors.detail && <p className="text-sm text-err">{errors.detail}</p>}
          <Button type="submit" loading={loading} className="w-full">তৈরি করুন</Button>
        </form>
      )}
    </Modal>
  );
}
