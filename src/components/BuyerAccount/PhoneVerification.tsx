"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Call02Icon, ShieldCheckIcon } from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function PhoneVerification({ phone }: { phone?: string | null }) {
 const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp } = useAuth();
 const [otpSent, setOtpSent] = useState(false);
 const [otpCode, setOtpCode] = useState("");
 const [verified, setVerified] = useState(false);

 if (!phone) {
 return (
 <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
 Add a phone number in your account details to enable verification.
 </div>
 );
 }

 const handleSendOtp = async () => {
 try {
 await sendOtp({ phone, purpose: "generic" });
 setOtpSent(true);
 toast.success(`OTP sent to ${phone}`);
 } catch {
 toast.error("Failed to send OTP. Please try again.");
 }
 };

 const handleVerifyOtp = async () => {
 if (!otpCode.trim()) return;
 try {
 await verifyOtp({ phone, otp_code: otpCode.trim(), purpose: "generic" });
 setVerified(true);
 toast.success("Phone number verified");
 } catch {
 toast.error("Invalid or expired OTP");
 }
 };

 if (verified) {
 return (
 <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-700">
 <HugeiconsIcon icon={ShieldCheckIcon} size={18} />
 Phone number verified.
 </div>
 );
 }

 return (
 <div className="space-y-4 rounded-xl border border-border p-4">
 <div className="flex items-center gap-3">
 <span className="rounded-lg bg-primary/10 p-2 text-primary">
 <HugeiconsIcon icon={Call02Icon} size={18} />
 </span>
 <div>
 <p className="font-semibold">Phone verification</p>
 <p className="text-xs text-muted-foreground">{phone}</p>
 </div>
 </div>

 {!otpSent ? (
 <button
 onClick={() => void handleSendOtp()}
 disabled={isSendingOtp}
 className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
 >
 {isSendingOtp && <Spinner size={16} />}
 Send verification code
 </button>
 ) : (
 <div className="space-y-3">
 <p className="text-sm text-muted-foreground">
 Enter the code sent to {phone}.
 </p>
 <div className="flex flex-wrap gap-3">
 <input
 type="text"
 inputMode="numeric"
 value={otpCode}
 onChange={(e) => setOtpCode(e.target.value)}
 placeholder="OTP code"
 className="w-40 rounded-xl border border-border bg-muted px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
 />
 <button
 onClick={() => void handleVerifyOtp()}
 disabled={isVerifyingOtp || !otpCode.trim()}
 className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
 >
 {isVerifyingOtp && <Spinner size={16} />}
 Verify
 </button>
 </div>
 <button
 onClick={() => void handleSendOtp()}
 disabled={isSendingOtp}
 className="text-sm font-semibold text-primary disabled:opacity-50"
 >
 Resend code
 </button>
 </div>
 )}
 </div>
 );
}
