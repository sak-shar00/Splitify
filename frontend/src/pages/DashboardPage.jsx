import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Receipt, DollarSign } from "lucide-react"
import { getDashboardStats } from "@/apis/expenseApis"
import { toast } from "sonner"

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalGroups: 0, totalExpenses: 0, userBalance: 0, expenses: [] })
  const [loading, setLoading] = useState(true)
  const [showExpenses, setShowExpenses] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data.stats)
    } catch (error) {
      toast.error("Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowExpenses(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.userBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.userBalance >= 0 ? '+' : ''}{stats.userBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showExpenses} onOpenChange={setShowExpenses}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Your Expenses</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {stats.expenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expenses yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.expenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>{expense.groupName}</TableCell>
                      <TableCell>{expense.currency} {expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(expense.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
