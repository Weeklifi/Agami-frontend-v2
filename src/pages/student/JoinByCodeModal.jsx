import { useState } from "react";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function JoinByCodeModal({ open, onClose, onJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post("/api/batches/join/code/", { invite_code: code.trim().toUpperCase() });
      onJoined(data.batch);
      setCode("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.invite_code?.[0] || err.response?.data?.detail || "Join করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Code দিয়ে Join করুন">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Invite Code</label>
          <Input
            placeholder="ABCD2345"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            style={{ letterSpacing: "0.2em", fontFamily: "monospace" }}
          />
          <p className="mt-1.5 text-xs text-ink-400">আপনার শিক্ষকের কাছ থেকে ৮ অক্ষরের code-টি নিন</p>
        </div>
        {error && <p className="text-sm text-err">{error}</p>}
        <Button type="submit" loading={loading} disabled={code.length < 8} className="w-full">Join করুন</Button>
      </form>
    </Modal>
  );
}
