import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown } from "lucide-react"
import { DatePicker } from "@/components/DatePicker"
import { cn } from "@/lib/utils"

export function AddExpenseDialog({ 
  open, 
  onOpenChange, 
  expenseForm, 
  setExpenseForm, 
  onSubmit, 
  group,
  sharedWithOpen,
  setSharedWithOpen,
  toggleSharedWith
}) {
  const selectedMembers = expenseForm.sharedWith.length > 0 
    ? group.memberIds?.filter(m => expenseForm.sharedWith.includes(m._id))
    : group.memberIds

  const updateMemberShare = (memberId, share) => {
    setExpenseForm(prev => ({
      ...prev,
      customShares: {
        ...prev.customShares,
        [memberId]: parseFloat(share) || 0
      }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                placeholder="Dinner at restaurant"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Shared With</FieldLabel>
              <Popover open={sharedWithOpen} onOpenChange={setSharedWithOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {expenseForm.sharedWith.length > 0
                      ? `${expenseForm.sharedWith.length} member(s) selected`
                      : "All members"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search member..." />
                    <CommandList>
                      <CommandGroup>
                        {group.memberIds?.map((member) => (
                          <CommandItem
                            key={member._id}
                            value={member.name}
                            onSelect={() => toggleSharedWith(member._id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                expenseForm.sharedWith.includes(member._id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {member.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="splitMethod">Split Method</FieldLabel>
              <Select value={expenseForm.splitMethod} onValueChange={(value) => setExpenseForm({ ...expenseForm, splitMethod: value, customShares: {} })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="shares">Shares</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {expenseForm.splitMethod !== "equal" && selectedMembers?.length > 0 && (
              <Field>
                <FieldLabel>
                  {expenseForm.splitMethod === "amount" && "Amount per member"}
                  {expenseForm.splitMethod === "percentage" && "Percentage per member"}
                  {expenseForm.splitMethod === "shares" && "Shares per member"}
                </FieldLabel>
                <div className="space-y-2 max-h-[150px] overflow-y-auto border rounded-md p-2">
                  {selectedMembers.map((member) => (
                    <div key={member._id} className="flex items-center gap-2">
                      <span className="text-sm flex-1">{member.name}</span>
                      <Input
                        type="number"
                        step={expenseForm.splitMethod === "percentage" ? "0.01" : "1"}
                        placeholder={expenseForm.splitMethod === "percentage" ? "0.00" : "0"}
                        value={expenseForm.customShares?.[member._id] || ""}
                        onChange={(e) => updateMemberShare(member._id, e.target.value)}
                        className="w-24"
                        required
                      />
                      {expenseForm.splitMethod === "percentage" && <span className="text-sm">%</span>}
                    </div>
                  ))}
                </div>
              </Field>
            )}

            <Field>
              <FieldLabel>Date</FieldLabel>
              <DatePicker
                date={expenseForm.date || new Date().toISOString().split('T')[0]}
                onDateChange={(date) => setExpenseForm({ ...expenseForm, date })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes (Optional)</FieldLabel>
              <Textarea
                id="notes"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                placeholder="Add a note..."
                className="min-h-[60px]"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
