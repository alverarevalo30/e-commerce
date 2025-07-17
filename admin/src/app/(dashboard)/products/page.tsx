"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";

import { AppSidebar } from "@/components/Sidebar";
import { ProductsTable } from "@/components/ProductsTable";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Products() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("admin-token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!baseURL) {
          throw new Error("API URL is not defined in environment variables.");
        }

        const response = await axios.get(`${baseURL}/api/product/list`);
        const result = response.data;

        if (result.success) {
          setData(
            Array.isArray(result.products) ? result.products : [result.products]
          );
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ProductsTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
