"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";

import { AppSidebar } from "@/components/Sidebar";
import { OrdersTable } from "@/components/OrdersTable";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Orders() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const token = Cookies.get("admin-token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseURL) {
        throw new Error("API URL is not defined in environment variables.");
      }

      const response = await axios.post(
        `${baseURL}/api/order/listorders`,
        {},
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data;

      if (result.success) {
        setData(Array.isArray(result.orders) ? result.orders : [result.orders]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Orders" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <OrdersTable data={data} fetchOrders={fetchOrders} />
          </div>
        </div>
      </div>
    </>
  );
}
