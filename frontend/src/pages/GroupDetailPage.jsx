import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Trash2, Plus, Send, Image as ImageIcon } from "lucide-react"
import { getGroupById, inviteMember, removeMember, deleteGroup } from "@/apis/groupApis"
import { createExpense, getExpensesByGroup } from "@/apis/expenseApis"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { InviteMemberDialog } from "@/components/InviteMemberDialog"
import { AddExpenseDialog } from "@/components/AddExpenseDialog"
import { ExpenseDetailDialog } from "@/components/ExpenseDetailDialog"
import { GroupChat } from "@/components/GroupChat"
import { SettlementTab } from "@/components/SettlementTab"

export default function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [inviting, setInviting] = useState(false)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [expenseDetailOpen, setExpenseDetailOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [sharedWithOpen, setSharedWithOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    sharedWith: [],
    splitMethod: "equal",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    customShares: {}
  })

  useEffect(() => {
    fetchGroup()
    fetchExpenses()
  }, [id])

  const fetchGroup = async () => {
    try {
      const data = await getGroupById(id)
      setGroup(data.group)
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch group")
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenses = async () => {
    try {
      const data = await getExpensesByGroup(id)
      setExpenses(data.expenses || [])
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch expenses")
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    try {
      const result = await inviteMember(id, username)
      toast.success(result.message)
      setInviteDialogOpen(false)
      setUsername("")
      fetchGroup()
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to invite member")
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return
    try {
      await removeMember(id, memberId)
      toast.success("Member removed successfully")
      fetchGroup()
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove member")
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) return
    try {
      await deleteGroup(id)
      toast.success("Group deleted successfully")
      navigate("/groups")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete group")
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    try {
      const selectedMembers = expenseForm.sharedWith.length > 0 
        ? expenseForm.sharedWith
        : group.memberIds.map(m => m._id)

      const participants = expenseForm.splitMethod === "equal"
        ? selectedMembers.map(userId => ({ userId, share: 1 }))
        : selectedMembers.map(userId => ({
            userId,
            share: expenseForm.customShares[userId] || 0
          }))
      
      await createExpense({
        groupId: id,
        title: expenseForm.title,
        amount: parseFloat(expenseForm.amount),
        splitMethod: expenseForm.splitMethod,
        participants,
        notes: expenseForm.notes
      })
      toast.success("Expense added successfully")
      setAddExpenseOpen(false)
      setExpenseForm({
        title: "",
        amount: "",
        sharedWith: [],
        splitMethod: "equal",
        date: new Date().toISOString().split('T')[0],
        notes: "",
        customShares: {}
      })
      fetchExpenses()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense")
    }
  }

  const toggleSharedWith = (memberId) => {
    setExpenseForm(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.includes(memberId)
        ? prev.sharedWith.filter(id => id !== memberId)
        : [...prev.sharedWith, memberId]
    }))
  }

  if (loading) return <div>Loading...</div>
  if (!group) return <div>Group not found</div>

  const isAdmin = group.ownerId?._id === user?.id || group.ownerId?._id === user?._id

  return (
    <div className="space-y-4 pb-20">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
        <Tabs defaultValue="info" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settlement">Settlement</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="flex justify-between items-center mt-4">
              <h2 className="text-lg font-semibold">Members</h2>
              <div className="space-x-4">
                {isAdmin && (
                  <Button variant="destructive" onClick={handleDeleteGroup} size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Group
                  </Button>
                )}
                <Button onClick={() => setInviteDialogOpen(true)} size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>   
              </div>
            </div>
            <div className="space-y-2">
              {group.memberIds?.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar>
                    <AvatarFallback>{member.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">@{member.username}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {member._id === group.ownerId?._id ? "Admin" : "Member"}
                  </span>
                  {isAdmin && member._id !== user?.id && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expenses yet. Add one to get started!
              </div>
            ) : (
              expenses.map((expense) => (
                <Card key={expense._id} className="cursor-pointer hover:bg-accent/50" onClick={() => {
                  setSelectedExpense(expense)
                  setExpenseDetailOpen(true)
                }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{expense.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Paid by {expense.paidBy?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Split among {expense.participants?.length} member(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{expense.currency} {expense.amount?.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="chat">
            <GroupChat groupId={id} currentUserId={user?.id || user?._id} />
          </TabsContent>

          <TabsContent value="settlement" className="space-y-4">
            <SettlementTab groupId={id} isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>

      {activeTab !== "chat" && (
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          onClick={() => setAddExpenseOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        username={username}
        setUsername={setUsername}
        onSubmit={handleInvite}
        inviting={inviting}
      />

      <AddExpenseDialog
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        onSubmit={handleAddExpense}
        group={group}
        sharedWithOpen={sharedWithOpen}
        setSharedWithOpen={setSharedWithOpen}
        toggleSharedWith={toggleSharedWith}
      />

      <ExpenseDetailDialog
        open={expenseDetailOpen}
        onOpenChange={setExpenseDetailOpen}
        expense={selectedExpense}
      />
    </div>
  )
}
