import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Sign In",
 description: "Sign in to your Xerin Marketplace account.",
 // other metadata
};

const SigninPage = () => {
 return (
 <main>
 <Signin />
 </main>
 );
};

export default SigninPage;
