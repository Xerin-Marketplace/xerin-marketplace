import NotificationCenter from "@/components/Notifications/NotificationCenter";

export const metadata = {
  title: "Logistics Notifications | Xerin Marketplace",
};

export default function LogisticsNotificationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[#f7941d]">Logistics Workspace</p>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Pickup, handover and delivery actions that require your team.
        </p>
      </div>
      <NotificationCenter />
    </div>
  );
}
