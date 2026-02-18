import { Input } from "@/components/ui/input"

export function DatePicker({ date, onDateChange }) {
  return (
    <Input
      type="date"
      value={date || new Date().toISOString().split('T')[0]}
      onChange={(e) => onDateChange(e.target.value)}
      className="w-full"
    />
  )
}
