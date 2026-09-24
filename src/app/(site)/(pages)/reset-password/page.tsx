import { Metadata } from "next";
import ResetPassword from "@/components/Auth/ResetPassword";


export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Reset Password",
 description: "Reset your Xerin Market account password using OTP or reset token.",
};

const ResetPasswordPage = () => {
 return (
 <main>
 <ResetPassword />
 </main>
 );
};

export default ResetPasswordPage;
