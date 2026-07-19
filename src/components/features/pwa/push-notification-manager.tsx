"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import {
  isPushSupported,
  requestNotificationPermission,
  registerServiceWorker,
  getPushSubscription,
} from "@/lib/notifications";
import { api } from "@/lib/api";

export function PushNotificationManager() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
  }, []);

  const handleSubscribe = async () => {
    const permission = await requestNotificationPermission();
    if (permission !== "granted") return;

    const reg = await registerServiceWorker();
    if (!reg) return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
    const subscription = await getPushSubscription(reg, vapidKey);
    if (!subscription) return;

    try {
      await api.post("/notifications/subscribe", subscription);
      setSubscribed(true);
    } catch (err) {
      console.error("Failed to save subscription:", err);
    }
  };

  if (!supported) return null;

  return (
    <Button variant="outline" size="sm" onClick={handleSubscribe} disabled={subscribed}>
      {subscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Notifikasi Aktif
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Aktifkan Notifikasi
        </>
      )}
    </Button>
  );
}
