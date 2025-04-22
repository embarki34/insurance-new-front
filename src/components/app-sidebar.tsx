import * as React from "react"
import {
  Bell,
  Briefcase,
  FileText,
  LifeBuoy,
  Send,
  Settings2,
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
      title: "الملفات القضائية",
      url: "/cases",
      icon: Briefcase,
      },
      
    ],
    navSecondary: [
    {
      title: "الدعم",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "التعليقات",
      url: "#",
      icon: Send,
    },
  ],
  navSettings: [
    {
      title: " إعدادات المُعاملات",
      icon: Settings2,
      url:"/settings/parameters",
      items:[
        
      ],
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
              <a href="/cases">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {/* <Command className="size-4" /> */}
                  <FileText />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-right"> ادارة الملفات القضائية</span>
                  <span className="truncate text-xs text-right">الإدارة القضائية</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSettings items={data.navSettings} />
        {/* <NavProjects projects={data.} /> */}
      

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  )
}
