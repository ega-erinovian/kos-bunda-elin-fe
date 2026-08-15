"use client";

import { Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { targetAudienceOptions } from "../constants";

export function BroadcastCard() {
  return (
    <div className="col-span-12 flex flex-col rounded-xl border border-outline-variant/20 bg-surface p-lg shadow-ambient-md transition-shadow hover:shadow-ambient-lg lg:col-span-4">
      <div className="mb-6 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-heading-md text-on-surface">Broadcast</h2>
      </div>

      <form className="flex flex-1 flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-label-md text-on-surface-variant">Target Audience</label>
          <Select defaultValue="semua">
            <SelectTrigger className="w-full border-outline-variant bg-surface-container-lowest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {targetAudienceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col space-y-2">
          <label className="text-label-md text-on-surface-variant">Message</label>
          <textarea
            className="flex-1 resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ketik pesan pengingat pembayaran di sini..."
            rows={6}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Send className="h-4 w-4" />
          Send Message
        </Button>
      </form>
    </div>
  );
}
