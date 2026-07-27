"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { customersService, type SupportTicket } from "@/lib/api/endpoints/customers";
import { ApiError } from "@/lib/api/client";
import UnavailableFeature from "@/components/Admin/Common/UnavailableFeature";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const PRIORITY_BADGES: Record<string, string> = {
  low: "bg-[#f3f4f6] text-[#4b5563]",
  medium: "bg-[#fef3c7] text-[#92400e]",
  high: "bg-[#fecaca] text-[#8f2727]",
  urgent: "bg-[#fde2e2] text-[#8f2727]",
};

const STATUS_BADGES: Record<string, string> = {
  open: "bg-[#dbeafe] text-[#1e40af]",
  pending: "bg-[#fef3c7] text-[#92400e]",
  in_progress: "bg-[#e0e7ff] text-[#3730a3]",
  resolved: "bg-[#d1fae5] text-[#065f46]",
  closed: "bg-[#f3f4f6] text-[#4b5563]",
};

const AdminCustomerSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customersService.listSupportTickets({
        status: status || undefined,
        priority: priority || undefined,
      });
      setTickets(data);
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      if (!(error instanceof ApiError && error.status === 401)) toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [status, priority]);

  const open = tickets.filter((t) => t.status === "open").length;
  const closed = tickets.filter((t) => t.status === "closed").length;
  const pending = tickets.filter((t) => t.status === "pending").length;
  const high = tickets.filter((t) => t.priority === "high" || t.priority === "urgent").length;

  return (
    <div className="space-y-4">
      {!loading && !error && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Open Tickets" value={open} />
        <SummaryCard label="Closed" value={closed} />
        <SummaryCard label="Pending" value={pending} />
        <SummaryCard label="High Priority" value={high} />
      </div>}

      <UnavailableFeature title="Ticket mutations are unavailable" description="The backend currently supports listing and filtering support tickets, but does not expose view-detail, assignment, or status-update operations." />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading tickets...</div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => void fetchData()} className="mt-3 rounded-lg bg-red-700 px-3 py-2 font-medium text-white">Retry</button></div>
        ) : tickets.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No support tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Ticket No</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Priority</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Assigned To</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{t.ticket_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.customer_name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.subject}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_BADGES[t.priority] ?? "bg-gray-100 text-gray-600"}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGES[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.assigned_to_name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.updated_at ? new Date(t.updated_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-2 text-xl font-semibold text-[#111827]">{value}</p>
  </div>
);

export default AdminCustomerSupport;
