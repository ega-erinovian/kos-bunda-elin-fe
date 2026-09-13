"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WHATSAPP_TEMPLATES,
  buildWaUrl,
  normalizePhoneForWa,
  isValidWaPhone,
  type WhatsAppTemplateId,
  type WhatsAppVars,
} from "@/lib/whatsapp";

type WhatsAppComposerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  vars: WhatsAppVars;
  defaultTemplateId?: WhatsAppTemplateId;
  title?: string;
};

/**
 * Client-only wa.me composer. No backend call.
 * Opens https://wa.me/{phone}?text=... in a new tab.
 * User must press Send in WhatsApp manually — not a blast API.
 */
export function WhatsAppComposer({
  open,
  onOpenChange,
  phone,
  vars,
  defaultTemplateId = "reminder_jatuh_tempo",
  title,
}: WhatsAppComposerProps) {
  const normalized = normalizePhoneForWa(phone);
  const validPhone = isValidWaPhone(phone);

  const [templateId, setTemplateId] = useState<WhatsAppTemplateId>(defaultTemplateId);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const template = WHATSAPP_TEMPLATES.find((t) => t.id === templateId);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemplateId(defaultTemplateId);
  }, [defaultTemplateId, open]);

  useEffect(() => {
    if (!template) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(template.render(vars));
  }, [template, vars, open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCopied(false);
  }, [message]);

  const waUrl = buildWaUrl(normalized, message);

  const handleOpen = () => {
    if (!validPhone || !message.trim()) return;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select textarea
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-140 overflow-hidden p-0">
        <div className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 z-10 border-b border-outline-variant/20 bg-popover px-6 pb-4 pt-6">
            <DialogTitle className="flex items-center gap-2 font-heading text-heading-md text-on-surface">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp">
                <MessageCircle className="h-4 w-4" />
              </span>
              {title ?? "Kirim via WhatsApp"}
            </DialogTitle>
            <DialogDescription className="text-label-md text-on-surface-variant">
              Pesan dibuka di WhatsApp (wa.me). Anda yang menekan Kirim di WhatsApp — bukan blast otomatis.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 p-6">
            {/* Phone preview */}
            <div className="rounded-xl bg-surface-container-low px-3.5 py-2.5">
              <p className="text-label-sm text-on-surface-variant">Tujuan</p>
              <p className="mt-0.5 flex items-center gap-2 font-mono text-label-md font-medium text-on-surface">
                {phone || "-"}
                {normalized !== phone && validPhone && (
                  <span className="font-sans text-label-sm font-normal text-on-surface-variant">
                    → {normalized}
                  </span>
                )}
              </p>
              {!validPhone && phone && (
                <p className="mt-1 text-label-sm text-destructive">Nomor tidak valid (harus 62xxxxxxxxxx / 08xxx).</p>
              )}
              {!phone && (
                <p className="mt-1 text-label-sm text-destructive">Nomor HP belum tersedia untuk penghuni ini.</p>
              )}
            </div>

            {/* Template picker */}
            <div className="space-y-2">
              <label className="text-label-md font-medium text-on-surface">Template Pesan</label>
              <Select value={templateId} onValueChange={(v) => setTemplateId(v as WhatsAppTemplateId)}>
                <SelectTrigger className="w-full border-outline-variant bg-surface-container-lowest">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WHATSAPP_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex flex-col items-start">
                        <span className="font-medium">{t.label}</span>
                        <span className="text-label-sm text-on-surface-variant">{t.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom — tulis manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Editable message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-label-md font-medium text-on-surface">Isi Pesan</label>
                <span className="text-label-sm text-on-surface-variant">{message.length} karakter</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={9}
                className="w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Tulis pesan WhatsApp..."
              />
              <p className="text-label-sm text-on-surface-variant">
                Variabel: nama, kamar, periode, nominal, sisa, jatuh tempo sudah terisi dari data tagihan.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopy}
                disabled={!message.trim()}
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Tersalin" : "Salin"}
              </Button>
              <Button
                className="flex-1 bg-whatsapp text-white hover:bg-whatsapp-hover focus-visible:ring-whatsapp/30"
                onClick={handleOpen}
                disabled={!validPhone || !message.trim()}
              >
                <ExternalLink className="h-4 w-4" />
                Buka WhatsApp
              </Button>
            </div>

            <p className="text-center text-label-sm leading-relaxed text-on-surface-variant">
              Dibuka via{" "}
              <span className="font-mono text-on-surface">wa.me/{normalized || "62xxxxxxxxxx"}</span> —{" "}
              <span className="font-medium">bukan</span> WhatsApp API / blast. Pastikan WhatsApp Web / aplikasi terpasang.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
