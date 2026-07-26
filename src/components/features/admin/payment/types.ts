export type PaymentTab = "approaching" | "overdue"
export type PaymentStatus = "pending" | "overdue" | "paid"

export type Payment = {
  id: string
  name: string
  initials: string
  room: string
  dueDate: string
  amount: number
  status: PaymentStatus
  tab: PaymentTab
}

export type BroadcastLogStatus = "success" | "failed"
export type BroadcastLogType = "sms" | "email" | "push"

export type BroadcastLog = {
  id: string
  recipient: string
  type: BroadcastLogType
  time: string
  status: BroadcastLogStatus
}
