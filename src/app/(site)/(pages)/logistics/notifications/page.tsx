import NotificationCenter from "@/components/Notifications/NotificationCenter";

export const metadata = {
 title: "Logistics Notifications",
};

export default function LogisticsNotificationsPage() {
 return (
 <div className="space-y-5">
 <div>
 <p className="text-sm font-semibold text-[var(--primary)]">Logistics Workspace</p>
 <h1 className="text-2xl font-bold text-[var(--foreground)]">
 Notifications
 </h1>
 <p className="mt-1 text-sm text-[var(--muted-foreground)]">
 Pickup, handover and delivery actions that require your team.
 </p>
 </div>
 <NotificationCenter />
 </div>
 );
}
