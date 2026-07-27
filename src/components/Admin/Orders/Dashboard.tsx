"use client";
import OrderList from "./OrderList";
import UnavailableFeature from "@/components/Admin/Common/UnavailableFeature";
const config:Record<string,{title:string;status?:string}>={all:{title:"All Orders"},pending:{title:"Pending Orders",status:"pending"},processing:{title:"Processing Orders",status:"processing"},completed:{title:"Completed Orders",status:"delivered"},cancelled:{title:"Cancelled Orders",status:"cancelled"}};
export default function AdminOrdersDashboard({initialTab="all"}:{initialTab?:string}){if(initialTab==="tracking")return <UnavailableFeature title="Order tracking is not available yet" description="The backend order response has no courier or tracking fields and no tracking mutation endpoint."/>;const view=config[initialTab]||config.all;return <OrderList view={initialTab} status={view.status} title={view.title}/>;}
