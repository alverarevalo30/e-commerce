"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import { ChartAreaInteractive } from "@/components/ChartArea";
import { SectionCards } from "@/components/SectionCards";
import { SiteHeader } from "@/components/SiteHeader";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("admin-token");
    if (!token) {
      router.replace("/login");
      return;
    }
  });

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
