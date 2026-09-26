import TrackShipment from "@/components/TrackShipment";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "Track Shipment",
 description: "Track your Xerin Market order and delivery status.",
 alternates: { canonical: "/track" },
};

export default function TrackPage() {
 return <TrackShipment />;
}
