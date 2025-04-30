import * as React from "react"
import {

  Briefcase,
  Building2,
  FileText,
  LifeBuoy,
  Send,
  Settings2,
  Shield,
  Building,
  Map,
  Box
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavSettings } from "@/components/nav-settings"

const data = {
  user: {
    name: "شادن",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Contrats d'assurance",
      url: "/contracts",
      icon: Briefcase,
    },
    {
      title: "Objets",
      url: "/objects",
      icon: Box,
    },
    {
      title: "Zones ",
      url: "/zone-et-sites",
      icon: Map,
    },
    {
      title: "Sociétés",
      url: "/societe",
      icon: Building2,
    },
    {
      title: "Compagnies d'assurance",
      url: "/insurance-campanises",
      icon: Building,
    },
    {
      title: "Garanties",
      url: "/garanties",
      icon: Shield   ,
    },
   
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Commentaires",
      url: "#",
      icon: Send,
    },
  ],
  navSettings: [
    {
      title: "Paramètres des transactions",
      icon: Settings2,
      url: "/settings/parameters",
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/contracts">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FileText />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-right">Gestion des contrats d'assurance</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSettings items={data.navSettings} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  )
}
