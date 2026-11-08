import { useLocation } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import AuthLayout from "../../components/layout/AuthLayout";

export default function CheckEmail() {
  const email = useLocation().state?.email;

  return (
    <AuthLayout title="Email চেক করুন">
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Mail className="h-8 w-8" strokeWidth={2} />
        </div>
        <p className="text-sm leading-relaxed text-ink-600">
          {email ? (
            <>
              <span className="font-semibold text-ink-900">{email}</span>-এ একটি
              activation link পাঠানো হয়েছে।
            </>
          ) : (
            "আপনার email-এ একটি activation link পাঠানো হয়েছে।"
          )}{" "}
          Link-এ ক্লিক করে account চালু করুন।
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-ok-bg px-3 py-2.5 text-left text-xs text-ok">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Activation link সফলভাবে পাঠানো হয়েছে।</span>
        </div>
      </div>
    </AuthLayout>
  );
}
