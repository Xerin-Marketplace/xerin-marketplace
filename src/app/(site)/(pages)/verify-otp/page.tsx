import { Metadata } from "next";
import VerifyOtp from "@/components/Auth/VerifyOtp";


export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Verify OTP",
 description: "Verify your Xerin Marketplace account using OTP.",
};

const VerifyOtpPage = () => {
 return (
 <main>
 <VerifyOtp />
 </main>
 );
};

export default VerifyOtpPage;
