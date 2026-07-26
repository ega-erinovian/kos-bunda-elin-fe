import { MessageSquare, Mail, Bell, Users, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BroadcastLog } from "../types"

const typeIcons = { sms: MessageSquare, email: Mail, push: Bell }

function isGroupRecipient(recipient: string) {
  return recipient.includes("Group") || recipient.includes("Semua")
}

function getIconBgClass(recipient: string) {
  return isGroupRecipient(recipient)
    ? "bg-secondary-fixed text-on-secondary-fixed"
    : "bg-primary-fixed text-on-primary-fixed-variant"
}

type MobileLogEntryProps = {
  log: BroadcastLog
}

export function MobileLogEntry({ log }: MobileLogEntryProps) {
  const Icon = typeIcons[log.type]
  const bgClass = getIconBgClass(log.recipient)

  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bgClass}`}>
        {isGroupRecipient(log.recipient) ? (
          <Users className="h-5 w-5" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <h3 className="truncate text-label-md text-on-surface">{log.recipient}</h3>
          <span className="text-label-sm text-[10px] text-on-surface-variant">{log.time}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-on-surface-variant" />
          <span className="text-label-sm text-on-surface-variant">
            {log.type === "sms" ? "SMS" : log.type === "email" ? "Email" : "App Push"}
          </span>
        </div>
      </div>
      <Badge variant={log.status === "success" ? "default" : "destructive"}>
        {log.status === "success" ? "Success" : "Failed"}
      </Badge>
    </div>
  )
}
