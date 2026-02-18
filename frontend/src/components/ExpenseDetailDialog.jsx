import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ExpenseDetailDialog({ open, onOpenChange, expense }) {
  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{expense.title}</h3>
            <p className="text-2xl font-bold mt-2">{expense.currency} {expense.amount?.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid by:</span>
              <span className="font-medium">{expense.paidBy?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Split method:</span>
              <span className="capitalize">{expense.splitMethod}</span>
            </div>
          </div>
          {expense.metadata?.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes:</p>
              <p className="text-sm">{expense.metadata.notes}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium mb-2">Split details:</p>
            <div className="space-y-2">
              {expense.participants?.map((participant) => (
                <div key={participant.userId._id} className="flex justify-between text-sm">
                  <span>{participant.userId.name}</span>
                  <span>{expense.currency} {participant.share?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
