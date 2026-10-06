"use client";

import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, Mail01Icon, Location01Icon } from "@hugeicons/core-free-icons";

type InquiryType = "logistics_partnership" | "general_query" | "newsletter";

const SUPPORT_EMAIL = "support@xerinmart.com";

const INQUIRY_LABELS: Record<InquiryType, string> = {
 logistics_partnership: "Logistics Partnership",
 general_query: "General Query",
 newsletter: "Newsletter / Updates",
};

const Contact = () => {
 const [inquiryType, setInquiryType] = useState<InquiryType>("logistics_partnership");

 const [formData, setFormData] = useState({
 firstName: "",
 lastName: "",
 email: "",
 phone: "",
 subject: "",
 message: "",
 companyName: "",
 businessLocation: "",
 isRegistered: "",
 companyPhone: "",
 companyEmail: "",
 logisticsDetails: "",
 });

 const isPartnership = inquiryType === "logistics_partnership";
 const [error, setError] = useState("");

 const handleChange = (
 e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
 ) => {
 const { name, value } = e.target;
 setFormData((prev) => ({
 ...prev,
 [name]: value,
 }));
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setError("");

 const lines: string[] = [`Inquiry type: ${INQUIRY_LABELS[inquiryType]}`, ""];

 if (isPartnership) {
 if (
 !formData.companyName.trim() ||
 !formData.businessLocation.trim() ||
 !formData.isRegistered ||
 !formData.companyPhone.trim() ||
 !formData.companyEmail.trim() ||
 !formData.logisticsDetails.trim()
 ) {
 setError("Please complete every required field before sending.");
 return;
 }
 lines.push(
 `Company: ${formData.companyName.trim()}`,
 `Business location: ${formData.businessLocation.trim()}`,
 `Registered business: ${formData.isRegistered}`,
 `Company phone: ${formData.companyPhone.trim()}`,
 `Company email: ${formData.companyEmail.trim()}`,
 "",
 "Partnership details:",
 formData.logisticsDetails.trim(),
 );
 } else {
 if (!formData.firstName.trim() || !formData.email.trim() || !formData.message.trim()) {
 setError("Please fill in your name, email and message before sending.");
 return;
 }
 lines.push(
 `Name: ${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
 `Email: ${formData.email.trim()}`,
 formData.phone.trim() ? `Phone: ${formData.phone.trim()}` : "",
 "",
 formData.message.trim(),
 );
 }

 const subject = isPartnership
 ? `Logistics partnership · ${formData.companyName.trim()}`
 : formData.subject.trim() || `Website enquiry · ${INQUIRY_LABELS[inquiryType]}`;

 // No contact endpoint exists yet; send through the visitor's email client
 // so the message genuinely reaches the support team.
 window.location.href =
 `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}` +
 `&body=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
 };

 return (
 <>
 <Breadcrumb title={"Contact"} pages={["contact"]} />

 <section className="overflow-hidden py-20 bg-muted">
 <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
 <div className="flex flex-col xl:flex-row gap-7.5">
 <div className="xl:max-w-[370px] w-full bg-card rounded-xl shadow-1">
 <div className="py-5 px-4 sm:px-7.5 border-b border-border">
 <p className="font-medium text-xl text-foreground">
 Contact Information
 </p>
 </div>

 <div className="p-4 sm:p-7.5">
 <div className="flex flex-col gap-4">
 <p className="flex items-center gap-4">
 <HugeiconsIcon icon={Call02Icon} size={22} />
 Name: Xerin Support Team
 </p>

 <p className="flex items-center gap-4">
 <HugeiconsIcon icon={Mail01Icon} size={22} />
 Email: support@xerinmart.com
 </p>

 <p className="flex gap-4">
 <HugeiconsIcon icon={Location01Icon} size={22} />
 Address: Dar es Salaam, Tanzania
 </p>
 </div>
 </div>
 </div>

 <div className="xl:max-w-[770px] w-full bg-card rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
 <form onSubmit={handleSubmit}>
 <div className="mb-5">
 <label
 htmlFor="inquiryType"
 className="block mb-2.5"
 >
 Inquiry Type <span className="text-red">*</span>
 </label>

 <select
 name="inquiryType"
 id="inquiryType"
 value={inquiryType}
 onChange={(e) =>
 setInquiryType(e.target.value as InquiryType)
 }
 className="rounded-md border border-border bg-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 >
 <option value="logistics_partnership">Logistics Partnership</option>
 <option value="general_query">General Query</option>
 <option value="newsletter">Newsletter / Updates</option>
 </select>
 </div>

 {isPartnership ? (
 <>
 <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
 <div className="w-full">
 <label
 htmlFor="companyName"
 className="block mb-2.5"
 >
 Company Name <span className="text-red">*</span>
 </label>
 <input
 type="text"
 name="companyName"
 id="companyName"
 value={formData.companyName}
 onChange={handleChange}
 placeholder="Enter company name"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>

 <div className="w-full">
 <label
 htmlFor="businessLocation"
 className="block mb-2.5"
 >
 Business Location <span className="text-red">*</span>
 </label>
 <input
 type="text"
 name="businessLocation"
 id="businessLocation"
 value={formData.businessLocation}
 onChange={handleChange}
 placeholder="e.g. Dar es Salaam, Tanzania"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>
 </div>

 <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
 <div className="w-full">
 <label
 htmlFor="isRegistered"
 className="block mb-2.5"
 >
 Is your business registered? <span className="text-red">*</span>
 </label>
 <select
 name="isRegistered"
 id="isRegistered"
 value={formData.isRegistered}
 onChange={handleChange}
 className="rounded-md border border-border bg-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 >
 <option value="">Select</option>
 <option value="yes">Yes</option>
 <option value="no">No</option>
 <option value="planning">Planning to register</option>
 </select>
 </div>

 <div className="w-full">
 <label
 htmlFor="companyPhone"
 className="block mb-2.5"
 >
 Company Phone <span className="text-red">*</span>
 </label>
 <input
 type="tel"
 name="companyPhone"
 id="companyPhone"
 value={formData.companyPhone}
 onChange={handleChange}
 placeholder="+255 700 000 000"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>
 </div>

 <div className="mb-5">
 <label
 htmlFor="companyEmail"
 className="block mb-2.5"
 >
 Company Email <span className="text-red">*</span>
 </label>
 <input
 type="email"
 name="companyEmail"
 id="companyEmail"
 value={formData.companyEmail}
 onChange={handleChange}
 placeholder="hello@company.com"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>

 <div className="mb-7.5">
 <label
 htmlFor="logisticsDetails"
 className="block mb-2.5"
 >
 Logistics Partnership Details <span className="text-red">*</span>
 </label>
 <textarea
 name="logisticsDetails"
 id="logisticsDetails"
 rows={5}
 value={formData.logisticsDetails}
 onChange={handleChange}
 placeholder="Tell us about your logistics operations, coverage area, fleet details, service model, and how you would like to partner with Xerin."
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full p-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 ></textarea>
 </div>
 </>
 ) : (
 <>
 <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
 <div className="w-full">
 <label
 htmlFor="firstName"
 className="block mb-2.5"
 >
 First Name <span className="text-red">*</span>
 </label>
 <input
 type="text"
 name="firstName"
 id="firstName"
 value={formData.firstName}
 onChange={handleChange}
 placeholder="First name"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>

 <div className="w-full">
 <label
 htmlFor="lastName"
 className="block mb-2.5"
 >
 Last Name <span className="text-red">*</span>
 </label>
 <input
 type="text"
 name="lastName"
 id="lastName"
 value={formData.lastName}
 onChange={handleChange}
 placeholder="Last name"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>
 </div>

 <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
 <div className="w-full">
 <label
 htmlFor="email"
 className="block mb-2.5"
 >
 Email <span className="text-red">*</span>
 </label>
 <input
 type="email"
 name="email"
 id="email"
 value={formData.email}
 onChange={handleChange}
 placeholder="you@example.com"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>

 <div className="w-full">
 <label
 htmlFor="phone"
 className="block mb-2.5"
 >
 Phone
 </label>
 <input
 type="text"
 name="phone"
 id="phone"
 value={formData.phone}
 onChange={handleChange}
 placeholder="+255 700 000 000"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>
 </div>

 <div className="mb-5">
 <label
 htmlFor="subject"
 className="block mb-2.5"
 >
 Subject
 </label>
 <input
 type="text"
 name="subject"
 id="subject"
 value={formData.subject}
 onChange={handleChange}
 placeholder="Type your subject"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>

 <div className="mb-7.5">
 <label
 htmlFor="message"
 className="block mb-2.5"
 >
 Message <span className="text-red">*</span>
 </label>
 <textarea
 name="message"
 id="message"
 rows={5}
 value={formData.message}
 onChange={handleChange}
 placeholder="Type your message"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full p-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 ></textarea>
 </div>
 </>
 )}

 {error && (
 <p className="mb-4 rounded-lg border border-red-light-4 bg-red-light-6 px-4 py-3 text-sm text-red-dark">
 {error}
 </p>
 )}

 <button
 type="submit"
 className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-primary-dark"
 >
 {isPartnership ? "Submit Partnership Request" : "Send Message"}
 </button>

 <p className="mt-4 text-xs leading-5 text-muted-foreground">
 This opens your email app addressed to{" "}
 <a
 href={`mailto:${SUPPORT_EMAIL}`}
 className="font-semibold text-primary"
 >
 {SUPPORT_EMAIL}
 </a>{" "}
 with your message ready to send.
 </p>
 </form>
 </div>
 </div>
 </div>
 </section>
 </>
 );
};

export default Contact;