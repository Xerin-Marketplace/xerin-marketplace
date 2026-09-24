"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { BellIcon, Mail01Icon, Chat01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";

const STORAGE_KEY = "xerin_notification_preferences";

export type NotificationPreferencesState = {
 orderUpdates: boolean;
 paymentUpdates: boolean;
 deliveryUpdates: boolean;
 promotionalOffers: boolean;
 securityAlerts: boolean;
};

const defaultPreferences: NotificationPreferencesState = {
 orderUpdates: true,
 paymentUpdates: true,
 deliveryUpdates: true,
 promotionalOffers: false,
 securityAlerts: true,
};

export default function NotificationPreferences() {
 const [preferences, setPreferences] = useState<NotificationPreferencesState>(
 defaultPreferences,
 );
 const [loaded, setLoaded] = useState(false);

 useEffect(() => {
 try {
 const saved = localStorage.getItem(STORAGE_KEY);
 if (saved) {
 setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
 }
 } catch {
 // ignore parsing errors
 } finally {
 setLoaded(true);
 }
 }, []);

 const update = (key: keyof NotificationPreferencesState) => {
 setPreferences((prev) => {
 const next = { ...prev, [key]: !prev[key] };
 try {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
 } catch {
 // ignore storage errors
 }
 toast.success("Preferences saved on this device");
 return next;
 });
 };

 const items: {
 key: keyof NotificationPreferencesState;
 label: string;
 description: string;
 icon: IconSvgElement;
 }[] = [
 {
 key: "orderUpdates",
 label: "Order updates",
 description: "Confirmations, cancellations, and order changes",
 icon: BellIcon,
 },
 {
 key: "paymentUpdates",
 label: "Payment updates",
 description: "Successful payments, refunds, and billing issues",
 icon: Mail01Icon,
 },
 {
 key: "deliveryUpdates",
 label: "Delivery updates",
 description: "Shipment, transit, and delivery notifications",
 icon: SmartPhone01Icon,
 },
 {
 key: "promotionalOffers",
 label: "Promotional offers",
 description: "Sales, discounts, and marketing messages",
 icon: Chat01Icon,
 },
 {
 key: "securityAlerts",
 label: "Security alerts",
 description: "Password changes, sign-ins, and account warnings",
 icon: BellIcon,
 },
 ];

 if (!loaded) {
 return (
 <p className="py-10 text-center text-sm text-muted-foreground">
 Loading preferences...
 </p>
 );
 }

 return (
 <div className="space-y-4">
 <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
 Notification delivery is being prepared. Your choices below are saved on
 this device and will apply once the notification service is live.
 </p>
 {items.map(({ key, label, description, icon: Icon }) => (
 <label
 key={key}
 className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-4 hover:border-[var(--primary)]"
 >
 <div className="flex items-center gap-3">
 <span className="rounded-lg bg-primary/10 p-2 text-primary">
 <HugeiconsIcon icon={Icon} size={18} />
 </span>
 <div>
 <p className="font-semibold">{label}</p>
 <p className="text-xs text-muted-foreground">{description}</p>
 </div>
 </div>
 <input
 type="checkbox"
 checked={preferences[key]}
 onChange={() => update(key)}
 className="h-5 w-5 accent-[var(--primary)]"
 />
 </label>
 ))}
 </div>
 );
}
