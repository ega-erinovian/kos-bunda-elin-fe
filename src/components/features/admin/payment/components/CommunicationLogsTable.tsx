"use client"

import Link from "next/link"
import { MessageSquare, Mail, Bell, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BroadcastLog } from "../types"

const typeIconMap = { sms: MessageSquare, email: Mail, push: Bell }

type CommunicationLogsTableProps = {
  logs: BroadcastLog[]
}

export function CommunicationLogsTable({ logs }: CommunicationLogsTableProps) {
  return (
    <div className="col-span-12 mt-4 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface shadow-ambient-md">
      <div className="flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest/50 px-6 py-4">
        <h3 className="font-heading text-[18px] text-on-surface">Communication Logs</h3>
        <Link
          href="/admin/payments/logs"
          className="flex items-center gap-1 text-label-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low text-label-sm text-on-surface-variant">
              <th className="px-6 py-4 font-medium">Recipient</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-body-md text-on-surface">
            {logs.map((log) => {
              const Icon = typeIconMap[log.type]
              return (
                <tr key={log.id} className="transition-colors hover:bg-primary/5">
                  <td className="px-6 py-4">{log.recipient}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Icon className="h-4 w-4" />
                      {log.type === "sms" ? "SMS" : log.type === "email" ? "Email" : "App Push"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{log.time}</td>
                  <td className="px-6 py-4">
                    <Badge variant={log.status === "success" ? "default" : "destructive"}>
                      {log.status === "success" ? "Success" : "Failed"}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
