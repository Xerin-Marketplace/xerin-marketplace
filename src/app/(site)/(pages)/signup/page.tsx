import { SignupAuth as Signup } from "@/components/Auth/Signin";
import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Create Account",
 description: "Create your Xerin Mart account to shop, sell, and manage your orders.",
 // other metadata
};

const SignupPage = () => {
 return (
 <main>
 <Signup />
 </main>
 );
};

export default SignupPage;
