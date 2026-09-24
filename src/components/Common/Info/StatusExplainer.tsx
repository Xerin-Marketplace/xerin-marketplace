"use client";

import React from "react";
import InfoPopover from "./InfoPopover";

const ORDER_STATUS_EXPLANATIONS: Record<string, string> = {
 pending: "Your order was received and is waiting for the seller to confirm it.",
 pending_payment: "The order exists but payment has not been completed yet.",
 confirmed: "The seller confirmed your order and is preparing it.",
 processing: "Your order is being prepared for handover to delivery.",
 dispatched: "Your order has been handed to the delivery network.",
 in_transit: "Your order is on the way to the delivery destination.",
 out_for_delivery: "A courier is heading to your delivery address with this order.",
 delivered: "The order was delivered. Confirm receipt to release the seller's payout.",
 completed: "This order is finished · delivered and accepted.",
 cancelled: "This order was cancelled and will not be fulfilled.",
 failed: "Something went wrong with this order. Contact support if it persists.",
 refunded: "Your payment for this order was returned to you.",
 disputed: "A problem was reported with this order. The team is reviewing it.",
};

const PAYMENT_STATUS_EXPLANATIONS: Record<string, string> = {
 pending: "The payment was initiated but is not confirmed yet.",
 processing: "The payment provider is confirming this transaction.",
 paid: "Payment confirmed · the order can now proceed.",
 completed: "Payment confirmed · the order can now proceed.",
 failed: "The payment could not be completed. You can try again from your order.",
 cancelled: "This payment attempt was cancelled.",
 refunded: "This payment was returned to you.",
};

export function orderStatusExplanation(status: string): string {
 return (
 ORDER_STATUS_EXPLANATIONS[status.toLowerCase()] ??
 "The current stage of this order in its fulfilment workflow."
 );
}

export function paymentStatusExplanation(status: string): string {
 return (
 PAYMENT_STATUS_EXPLANATIONS[status.toLowerCase()] ??
 "The current state of this payment transaction."
 );
}

type StatusExplainerProps = {
 status: string;
 kind?: "order" | "payment";
};

/** Tiny "?" next to a status · explains what the status means. */
export default function StatusExplainer({ status, kind = "order" }: StatusExplainerProps) {
 const text =
 kind === "payment"
 ? paymentStatusExplanation(status)
 : orderStatusExplanation(status);

 return (
 <InfoPopover title={`"${status.replaceAll("_", " ")}" status`} triggerLabel="What does this status mean?">
 <p>{text}</p>
 </InfoPopover>
 );
}
