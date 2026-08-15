import { Notification } from "./NotificationSection";

export const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "new_tenant",
    title: "Penghuni Baru",
    message: "Ahmad Fauzi telah check-in ke Kamar 05",
    time: "5 menit lalu",
    read: false,
  },
  {
    id: "2",
    type: "payment_due",
    title: "Pembayaran Tertunda",
    message: "Kamar 03, 07, 12 jatuh tempo dalam 3 hari",
    time: "1 jam lalu",
    read: false,
  },
  {
    id: "3",
    type: "broadcast",
    title: "Broadcast Terkirim",
    message: "Pengingat tagihan bulanan berhasil dikirim ke 18 penghuni",
    time: "3 jam lalu",
    read: false,
  },
  {
    id: "4",
    type: "check_in",
    title: "Check-out Terjadwal",
    message: "Kamar 10 akan check-out besok pukul 12:00",
    time: "1 hari lalu",
    read: true,
  },
];
