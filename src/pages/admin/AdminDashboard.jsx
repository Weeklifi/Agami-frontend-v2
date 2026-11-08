import { useEffect, useState } from "react";
import {
  Users, BadgeCheck, Clock3, Wallet, AlertTriangle,
} from "lucide-react";
import client from "../../api/client";
import Card from "../../components/ui/Card";
import Sidebar from "../../components/layout/Sidebar";
import { adminNavItems } from "./navItems";

const STATUS_LABEL = {
  ACTIVE: "Active",
  TRIALING: "Trialing",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
};

const STATUS_STYLE = {
  ACTIVE: "bg-ok-bg text-ok",
  TRIALING: "bg-brand-50 text-brand-600",
  PENDING: "bg-warn-bg text-warn",
  CANCELLED: "bg-err-bg text-err",
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-ink-900">{value}</p>
    </Card>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[status] || "bg-page text-ink-500"}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .get("/api/subscriptions/admin/overview/")
      .then((res) => setData(res.data))
      .catch(() => setError("ডেটা লোড করা যায়নি।"));
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-page">
      <Sidebar items={adminNavItems} brand="Agami Admin" tagline="Platform Monitoring" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 border-b border-line bg-surface/90 px-5 py-3.5 backdrop-blur">
          <span className="text-sm font-bold text-ink-900">Subscription Monitoring</span>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-6xl space-y-5">
        {error && (
          <p className="rounded-xl bg-err-bg px-4 py-3 text-sm text-err">{error}</p>
        )}

        {data === null && !error ? (
          <p className="py-10 text-center text-sm text-ink-400">লোড হচ্ছে…</p>
        ) : data && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard icon={Users} label="Total Teachers" value={data.stats.total_teachers} />
              <StatCard icon={BadgeCheck} label="Active Subscriptions" value={data.stats.active_subscriptions} />
              <StatCard icon={Clock3} label="On Trial" value={data.stats.trialing} />
              <StatCard icon={Wallet} label="Revenue This Month" value={`৳${Number(data.stats.revenue_this_month).toLocaleString("en-IN")}`} />
            </div>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold text-ink-900">Expiring Soon (৭ দিনের মধ্যে)</h2>
                {data.expiring_soon.length > 0 && (
                  <span className="rounded-full bg-warn-bg px-1.5 py-0.5 text-[10px] font-bold text-warn">{data.expiring_soon.length}</span>
                )}
              </div>

              {data.expiring_soon.length === 0 ? (
                <p className="py-4 text-center text-sm text-ink-400">আগামী ৭ দিনে কারো subscription শেষ হচ্ছে না।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                        <th className="pb-2 pr-4">Teacher</th>
                        <th className="pb-2 pr-4">Plan</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2">Ends</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {data.expiring_soon.map((s) => (
                        <tr key={s.id}>
                          <td className="py-2.5 pr-4">
                            <p className="font-medium text-ink-900">{s.teacher_name}</p>
                            <p className="text-xs text-ink-400">{s.teacher_email}</p>
                          </td>
                          <td className="py-2.5 pr-4 text-ink-600">{s.plan_name}</td>
                          <td className="py-2.5 pr-4"><StatusBadge status={s.status} /></td>
                          <td className="py-2.5 flex items-center gap-1.5 text-warn font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" /> {fmtDate(s.end_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold text-ink-900">Recent Subscription Activity</h2>
              {data.recent.length === 0 ? (
                <p className="py-4 text-center text-sm text-ink-400">কোনো subscription activity নেই।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                        <th className="pb-2 pr-4">Teacher</th>
                        <th className="pb-2 pr-4">Plan</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Paid</th>
                        <th className="pb-2 pr-4">Start</th>
                        <th className="pb-2">End</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {data.recent.map((s) => (
                        <tr key={s.id}>
                          <td className="py-2.5 pr-4">
                            <p className="font-medium text-ink-900">{s.teacher_name}</p>
                            <p className="text-xs text-ink-400">{s.teacher_email}</p>
                          </td>
                          <td className="py-2.5 pr-4 text-ink-600">{s.plan_name}</td>
                          <td className="py-2.5 pr-4"><StatusBadge status={s.status} /></td>
                          <td className="py-2.5 pr-4 text-ink-600">৳{Number(s.price_paid).toLocaleString("en-IN")}</td>
                          <td className="py-2.5 pr-4 text-ink-400">{s.start_date ? fmtDate(s.start_date) : "—"}</td>
                          <td className="py-2.5 text-ink-400">{s.end_date ? fmtDate(s.end_date) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}
