import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon } from "@hugeicons/core-free-icons";

const Login = () => {
 const [dropdown, setDropdown] = useState(false);

 return (
 <div className="bg-card shadow-1 rounded-lg">
 <div
 onClick={() => setDropdown(!dropdown)}
 className={`cursor-pointer flex items-center gap-0.5 py-5 px-5.5 ${
 dropdown && "border-b border-border "
 }`}
 >
 Returning customer?
 <span className="flex items-center gap-2.5 pl-1 font-medium text-foreground">
 Click here to login
 <HugeiconsIcon icon={CheckIcon} size={22} />
 </span>
 </div>

 {/* <!-- dropdown menu --> */}
 <div
 className={`${
 dropdown ? "block" : "hidden"
 } pt-7.5 pb-8.5 px-4 sm:px-8.5`}
 >
 <p className="text-custom-sm mb-6">
 If you didn&apos;t Logged in, Please Log in first.
 </p>

 <div className="mb-5">
 <label htmlFor="name" className="block mb-2.5">
 Username or Email
 </label>

 <input
 type="text"
 name="name"
 id="name"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>

 <div className="mb-5">
 <label htmlFor="password" className="block mb-2.5">
 Password
 </label>

 <input
 type="password"
 name="password"
 id="password"
 autoComplete="on"
 className="rounded-md border border-border bg-muted placeholder:text-muted-foreground w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-ring/30"
 />
 </div>

 <button
 type="submit"
 className="inline-flex font-medium text-primary-foreground bg-primary py-3 px-10.5 rounded-md ease-out duration-200 hover:bg-primary-dark"
 >
 Login
 </button>
 </div>
 </div>
 );
};

export default Login;
