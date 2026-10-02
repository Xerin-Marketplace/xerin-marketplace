import { formatCurrency } from "@/lib/formatCurrency";
import type { Order, Payment } from "@/types/api/commerce";
import type { Address } from "@/types/api/user";

const brandColor = "#d97706";
const ink = "#1c1917";
const muted = "#78716c";
const line = "#e7e5e4";
const soft = "#fafaf9";

const escapeHtml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const statusColors: Record<string, { bg: string; fg: string }> = {
  paid: { bg: "#dcfce7", fg: "#166534" },
  completed: { bg: "#dcfce7", fg: "#166534" },
  delivered: { bg: "#dcfce7", fg: "#166534" },
  confirmed: { bg: "#dcfce7", fg: "#166534" },
  processing: { bg: "#dbeafe", fg: "#1e40af" },
  shipped: { bg: "#dbeafe", fg: "#1e40af" },
  pending: { bg: "#fef3c7", fg: "#92400e" },
  pending_payment: { bg: "#fef3c7", fg: "#92400e" },
  on_hold: { bg: "#fef3c7", fg: "#92400e" },
  failed: { bg: "#fee2e2", fg: "#991b1b" },
  cancelled: { bg: "#fee2e2", fg: "#991b1b" },
  refunded: { bg: "#fee2e2", fg: "#991b1b" },
  disputed: { bg: "#fee2e2", fg: "#991b1b" },
};

const statusBadge = (status: string): string => {
  const key = status.toLowerCase();
  const c = statusColors[key] ?? { bg: "#f5f5f4", fg: "#57534e" };
  return `<span style="display:inline-block;padding:5px 14px;border-radius:999px;background:${c.bg};color:${c.fg};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(status.replaceAll("_", " "))}</span>`;
};

const orderItemsHtml = (order: Order): string =>
  order.items
    .map(
      (item, i) => `
    <tr style="background:${i % 2 ? soft : "#fff"};">
      <td style="padding:12px 14px;border-bottom:1px solid ${line};font-weight:600;color:${ink};">${escapeHtml(item.product_name)}${item.variant_name ? `<br><small style="color:${muted};font-weight:400;">${escapeHtml(item.variant_name)}</small>` : ""}</td>
      <td style="padding:12px 14px;border-bottom:1px solid ${line};text-align:center;color:${muted};">${item.quantity}</td>
      <td style="padding:12px 14px;border-bottom:1px solid ${line};text-align:right;color:${muted};">${formatCurrency(item.unit_price, order.currency)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid ${line};text-align:right;font-weight:600;color:${ink};">${formatCurrency(item.total_price, order.currency)}</td>
    </tr>`,
    )
    .join("");

const totalsHtml = (order: Order): string => `
  <div style="margin-top:24px;display:flex;justify-content:flex-end;">
    <table style="width:300px;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:${muted};">Subtotal</td><td style="padding:6px 0;text-align:right;color:${ink};">${formatCurrency(order.subtotal, order.currency)}</td></tr>
      <tr><td style="padding:6px 0;color:${muted};">Shipping</td><td style="padding:6px 0;text-align:right;color:${ink};">${formatCurrency(order.shipping_amount, order.currency)}</td></tr>
      <tr><td style="padding:6px 0;color:${muted};">Tax</td><td style="padding:6px 0;text-align:right;color:${ink};">${formatCurrency(order.tax_amount, order.currency)}</td></tr>
      ${order.discount_amount && Number(order.discount_amount) > 0 ? `<tr><td style="padding:6px 0;color:${muted};">Discount</td><td style="padding:6px 0;text-align:right;color:#166534;">−${formatCurrency(order.discount_amount, order.currency)}</td></tr>` : ""}
      <tr>
        <td style="padding:14px 0 0;border-top:2px solid ${ink};font-size:15px;font-weight:800;color:${ink};">Total</td>
        <td style="padding:14px 0 0;border-top:2px solid ${ink};text-align:right;font-size:18px;font-weight:800;color:${brandColor};">${formatCurrency(order.total, order.currency)}</td>
      </tr>
    </table>
  </div>
`;

const baseDocument = (title: string, body: string): string => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(title)}</title>
      <style>
        body { font-family: -apple-system, "Segoe UI", Arial, sans-serif; color: ${ink}; padding: 40px; max-width: 760px; margin: 0 auto; }
        h1 { margin: 0; font-size: 22px; letter-spacing: -0.01em; }
        h3 { margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: ${muted}; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 24px; border: 1px solid ${line}; border-radius: 8px; overflow: hidden; }
        table.items th { background: ${soft}; text-align: left; padding: 10px 14px; border-bottom: 1px solid ${line}; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: ${muted}; }
        .muted { color: ${muted}; }
        .topbar { border-bottom: 3px solid ${brandColor}; padding-bottom: 18px; }
        .brand { color: ${brandColor}; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>
`;

export const printOrderInvoice = (
  order: Order,
  address?: Address | null,
  payment?: Payment | null,
) => {
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : "—";
  const body = `
    <div class="topbar" style="display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <p class="brand">Xerin Mart</p>
        <h1>Invoice</h1>
        <p class="muted" style="margin:4px 0 0;font-size:13px;">Order #${order.id.slice(0, 12).toUpperCase()}</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0 0 6px;">${statusBadge(order.status)}</p>
        <p class="muted" style="margin:0;font-size:12px;">${orderDate}</p>
      </div>
    </div>

    <div style="margin-top:26px;display:flex;gap:40px;">
      <div style="flex:1;">
        <h3>Bill To</h3>
        <p class="muted" style="margin:0;font-size:13px;line-height:1.6;">${address ? escapeHtml(`${address.street}, ${address.city}, ${address.region}, ${address.country}`) : "Address on file"}</p>
      </div>
      ${payment ? `
      <div style="flex:1;">
        <h3>Payment</h3>
        <p class="muted" style="margin:0;font-size:13px;line-height:1.6;">
          ${escapeHtml((payment.provider || payment.method || "—").replaceAll("_", " "))}<br>
          ${statusBadge(payment.status)}<br>
          Ref: ${escapeHtml(payment.provider_transaction_id || payment.id.slice(0, 8))}
        </p>
      </div>
      ` : ""}
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Price</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(order)}
      </tbody>
    </table>

    ${totalsHtml(order)}

    <p style="margin-top:44px;font-size:12px;border-top:1px solid ${line};padding-top:16px;" class="muted">Thank you for shopping with Xerin Mart · support@xerinmarketplace.com</p>
  `;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(baseDocument(`Invoice ${order.id}`, body));
  w.document.close();
  w.focus();
  w.print();
};

export const printPaymentReceipt = (payment: Payment) => {
  const paymentDate = payment.paid_at
    ? new Date(payment.paid_at).toLocaleString()
    : payment.created_at
      ? new Date(payment.created_at).toLocaleString()
      : "—";

  const body = `
    <div class="topbar" style="text-align:center;">
      <p class="brand">Xerin Mart</p>
      <h1>Payment Receipt</h1>
      <p class="muted" style="margin:6px 0 0;font-size:13px;">Ref: ${escapeHtml(payment.provider_transaction_id || payment.id.slice(0, 12).toUpperCase())}</p>
    </div>

    <div style="margin-top:30px;border:1px solid ${line};border-radius:8px;padding:20px;background:${soft};">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:${muted};">Order</td><td style="padding:8px 0;text-align:right;font-weight:600;">#${payment.order_id.slice(0, 12).toUpperCase()}</td></tr>
        <tr><td style="padding:8px 0;color:${muted};">Method</td><td style="padding:8px 0;text-align:right;">${escapeHtml((payment.provider || payment.method || "—").replaceAll("_", " "))}</td></tr>
        <tr><td style="padding:8px 0;color:${muted};">Status</td><td style="padding:8px 0;text-align:right;">${statusBadge(payment.status)}</td></tr>
        <tr><td style="padding:8px 0;color:${muted};">Date</td><td style="padding:8px 0;text-align:right;">${paymentDate}</td></tr>
        <tr><td style="padding:14px 0 0;border-top:2px solid ${ink};font-weight:800;font-size:15px;">Amount paid</td><td style="padding:14px 0 0;border-top:2px solid ${ink};text-align:right;font-weight:800;font-size:18px;color:${brandColor};">${formatCurrency(payment.amount, payment.currency)}</td></tr>
      </table>
    </div>

    <p style="margin-top:44px;font-size:12px;border-top:1px solid ${line};padding-top:16px;" class="muted">This is an official receipt for your records · Xerin Mart</p>
  `;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(baseDocument(`Receipt ${payment.id}`, body));
  w.document.close();
  w.focus();
  w.print();
};
