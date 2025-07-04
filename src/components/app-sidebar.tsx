import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { ArrowLeftRight, GalleryVerticalEnd, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { IconCreditCard, IconDashboard, IconWallet } from "@tabler/icons-react";
import { Button } from "./ui/button";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Main",
      url: "/",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <IconDashboard />,
        },
        {
          title: "Wallets",
          url: "/wallets",
          icon: <IconWallet />,
        },
        {
          title: "Virtual Cards",
          url: "/virtual-cards",
          icon: <IconCreditCard />,
        },
        {
          title: "FX",
          url: "/fx",
          icon: <ArrowLeftRight className="size-5" />,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const { user, logOut } = useAuth();

  const navUser = {
    name: user?.firstName || "User",
    email: user?.email || "N/A",
    image: "https://github.com/shadcn.png",
    avatar: "https://github.com/shadcn.png",
  };

  const isActive = (url: string) =>
    pathname === url || pathname?.startsWith(url);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Zen Finance</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link href={item.url}>
                        {item.icon}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={navUser} />
        <Button onClick={logOut}>
          Log Out <LogOutIcon className="ml-2 h-4 w-4" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
