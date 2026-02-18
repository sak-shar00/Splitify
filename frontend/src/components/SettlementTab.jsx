import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowRight, Eye } from "lucide-react"
import { createSettlement, getSettlementsByGroup, getSettlementById, completeSettlement } from "@/apis/settlementApis"
import { getGroupBalances } from "@/apis/expenseApis"
import { toast } from "sonner"

export function SettlementTab({ groupId, isAdmin }) {
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState(null)
  const [runningBalances, setRunningBalances] = useState(null)
  const [creating, setCreating] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [form, setForm] = useState({ notes: "" })

  useEffect(() => {
    fetchSettlements()
  }, [groupId])

  const fetchSettlements = async () => {
    try {
      const data = await getSettlementsByGroup(groupId)
      setSettlements(data.settlements || [])
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch settlements")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const result = await createSettlement({ groupId, ...form })
      toast.success(result.message)
      setCreateDialogOpen(false)
      setForm({ notes: "" })
      fetchSettlements()
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create settlement")
    } finally {
      setCreating(false)
    }
  }

  const handleViewDetails = async (settlementId) => {
    try {
      const data = await getSettlementById(settlementId)
      setSelectedSettlement(data.settlement)
      setDetailDialogOpen(true)
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch settlement details")
    }
  }

  const handleComplete = async () => {
    if (!confirm("Mark this settlement as completed?")) return
    setCompleting(true)
    try {
      const result = await completeSettlement(selectedSettlement._id)
      toast.success(result.message)
      setDetailDialogOpen(false)
      fetchSettlements()
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to complete settlement")
    } finally {
      setCompleting(false)
    }
  }

  const handleShowBalances = async () => {
    try {
      const data = await getGroupBalances(groupId)
      setRunningBalances(data)
      setBalanceDialogOpen(true)
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch balances")
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button onClick={handleShowBalances} size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Show Running Balances
        </Button>
        {isAdmin && (
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Settlement
          </Button>
        )}
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No settlements yet. {isAdmin && "Create one to get started!"}
        </div>
      ) : (
        settlements.map((settlement) => (
          <Card key={settlement._id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleViewDetails(settlement._id)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Settlement</h3>
                    <Badge variant={settlement.status === "completed" ? "secondary" : "default"}>
                      {settlement.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(settlement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Settlement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Settlement Details</DialogTitle>
          </DialogHeader>
          {selectedSettlement && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={selectedSettlement.status === "completed" ? "secondary" : "default"}>
                  {selectedSettlement.status}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Balances</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSettlement.balances?.map((balance) => (
                      <TableRow key={balance.userId._id}>
                        <TableCell>{balance.userId.name}</TableCell>
                        <TableCell className="text-right">
                          <span className={balance.netBalance >= 0 ? "text-green-600" : "text-red-600"}>
                            ₹{Math.abs(balance.netBalance).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {balance.netBalance >= 0 ? "Gets back" : "Owes"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Transactions</h3>
                <div className="space-y-2">
                  {selectedSettlement.transactions?.map((txn, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-lg border">
                      <span className="font-medium">{txn.from.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{txn.to.name}</span>
                      <span className="ml-auto font-semibold">₹{txn.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSettlement.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedSettlement.notes}</p>
                </div>
              )}

              {isAdmin && selectedSettlement.status === "pending" && (
                <DialogFooter>
                  <Button onClick={handleComplete} disabled={completing}>
                    {completing ? "Completing..." : "Mark as Completed"}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Running Balances</DialogTitle>
          </DialogHeader>
          {runningBalances && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Current Balances</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runningBalances.balances?.map((balance) => (
                      <TableRow key={balance.user._id}>
                        <TableCell>{balance.user.name}</TableCell>
                        <TableCell className="text-right">
                          <span className={balance.netBalance >= 0 ? "text-green-600" : "text-red-600"}>
                            ₹{Math.abs(balance.netBalance).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {balance.netBalance >= 0 ? "Gets back" : "Owes"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Suggested Transactions</h3>
                <div className="space-y-2">
                  {runningBalances.transactions?.map((txn, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-lg border">
                      <span className="font-medium">{txn.from.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{txn.to.name}</span>
                      <span className="ml-auto font-semibold">₹{txn.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
