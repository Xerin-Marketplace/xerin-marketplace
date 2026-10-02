import Contact from "@/components/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
 title: "Contact Us",
 description: "Contact Xerin Mart support for help with shopping, selling, orders, and delivery.",
 // other metadata
};

const ContactPage = () => {
 return (
 <main>
 <Contact />
 </main>
 );
};

export default ContactPage;
