import { Home, Users, Receipt, Settings, Plus, Mail } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarGroupAction,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "Invitations", url: "/invitations", icon: Mail },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar({ groups = [], onCreateGroup }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Expense Splitter</span>
            <span className="text-xs text-sidebar-foreground/60">{user?.name}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Groups</SidebarGroupLabel>
          <SidebarGroupAction onClick={onCreateGroup}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Create Group</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {groups.length === 0 ? (
                <div className="px-2 py-4 text-xs text-sidebar-foreground/60">
                  No groups yet
                </div>
              ) : (
                groups.map((group) => (
                  <SidebarMenuItem key={group._id}>
                    <SidebarMenuButton asChild>
                      <Link to={`/groups/${group._id}`}>
                        <Users className="h-4 w-4" />
                        <span>{group.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button variant="outline" onClick={logout} className="w-full">
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
