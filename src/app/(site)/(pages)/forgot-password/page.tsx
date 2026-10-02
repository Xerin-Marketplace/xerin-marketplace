import { Metadata } from "next";
import ForgotPassword from "@/components/Auth/ForgotPassword";


export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Forgot Password",
 description: "Request password reset instructions for your Xerin Mart account.",
};

const ForgotPasswordPage = () => {
 return (
 <main>
 <ForgotPassword />
 </main>
 );
};

export default ForgotPasswordPage;
