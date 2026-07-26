"use client"

import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { targetAudienceOptions } from "../constants"

export function MobileBroadcastForm() {
  return (
    <div className="rounded-2xl border border-secondary-fixed bg-secondary-container/30 p-lg">
      <h2 className="mb-md font-heading text-heading-md text-on-secondary-container">
        Broadcast Cepat
      </h2>
      <form className="space-y-lg" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="mb-2 block text-label-md text-on-secondary-container">
            Target Audience
          </label>
          <div className="relative">
            <select className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20">
              {targetAudienceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-label-md text-on-secondary-container">
            Isi Pesan Pengingat
          </label>
          <textarea
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ketik pesan pengingat pembayaran di sini..."
            rows={4}
          />
        </div>
        <Button type="submit" size="lg" className="w-full">
          <Send className="h-4 w-4" />
          Kirim Pesan
        </Button>
      </form>
    </div>
  )
}
