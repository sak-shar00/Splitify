import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CreateGroupDialog } from "@/components/CreateGroupDialog"
import { NotificationBell } from "@/components/NotificationBell"
import { getAllGroups, createGroup } from "@/apis/groupApis"
import { toast } from "sonner"

export default function DashboardLayout() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const data = await getAllGroups()
      setGroups(data.groups || [])
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch groups")
    }
  }

  const handleCreateGroup = async (formData) => {
    setLoading(true)
    try {
      await createGroup(formData)
      toast.success("Group created successfully")
      setCreateDialogOpen(false)
      fetchGroups()
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar groups={groups} onCreateGroup={() => setCreateDialogOpen(true)} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger />
          <NotificationBell />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateGroup}
        loading={loading}
      />
    </SidebarProvider>
  )
}
