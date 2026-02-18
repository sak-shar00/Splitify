import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getProfile, updateSettings } from "@/apis/authApis"

export default function SettingsPage() {
  const [allowAutoAdd, setAllowAutoAdd] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await getProfile()
      setUser(response.data.user)
      setAllowAutoAdd(response.data.user.allowAutoAdd || false)
    } catch (error) {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (checked) => {
    try {
      await updateSettings(checked)
      setAllowAutoAdd(checked)
      toast.success("Settings updated successfully")
    } catch (error) {
      toast.error("Failed to update settings")
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-muted-foreground">Username</Label>
            <p className="text-sm font-medium">{user?.username}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <p className="text-sm font-medium">{user?.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Invitations</CardTitle>
          <CardDescription>Manage how you receive group invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-add">Allow anyone to add me to groups</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, you'll be automatically added to groups without needing to accept invitations
              </p>
            </div>
            <Switch
              id="auto-add"
              checked={allowAutoAdd}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
