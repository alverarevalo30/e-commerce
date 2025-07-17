"use client";

import * as React from "react";
import {
  IconLayoutDashboard,
  IconPackage,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/NavMain";

import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Forever_Logo from "../assets/logo.png";

const data = {
  user: {
    name: "Forever Admin",
    email: "admin@forever.com",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconLayoutDashboard,
    },
    {
      title: "Products",
      url: "/products",
      icon: IconPackage,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconShoppingCart,
    },
    /* {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    }, */
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <div className="relative w-1/2 aspect-[332/138] ml-2">
                  <Image
                    src={Forever_Logo}
                    alt="Forever Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
