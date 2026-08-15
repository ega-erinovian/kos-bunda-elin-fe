import type { Payment, BroadcastLog } from "./types";

export const PAGE_SIZE = 5;

export const dummyPayments: Payment[] = [
  {
    id: "1",
    name: "Alina Smith",
    initials: "AS",
    room: "204",
    dueDate: "Due in 2 days",
    amount: 2500000,
    status: "pending",
    tab: "approaching",
  },
  {
    id: "2",
    name: "Budi Santoso",
    initials: "BS",
    room: "102",
    dueDate: "Due tomorrow",
    amount: 1800000,
    status: "pending",
    tab: "approaching",
  },
  {
    id: "3",
    name: "Citra Dewi",
    initials: "CD",
    room: "305",
    dueDate: "Due in 3 days",
    amount: 3200000,
    status: "pending",
    tab: "approaching",
  },
  {
    id: "4",
    name: "Doni Prasetyo",
    initials: "DP",
    room: "201",
    dueDate: "Overdue 5 days",
    amount: 1500000,
    status: "overdue",
    tab: "overdue",
  },
  {
    id: "5",
    name: "Eka Fitriani",
    initials: "EF",
    room: "103",
    dueDate: "Overdue 2 days",
    amount: 2000000,
    status: "overdue",
    tab: "overdue",
  },
  {
    id: "6",
    name: "Fajar Nugroho",
    initials: "FN",
    room: "301",
    dueDate: "Overdue 1 day",
    amount: 1750000,
    status: "overdue",
    tab: "overdue",
  },
  {
    id: "7",
    name: "Gita Permata",
    initials: "GP",
    room: "202",
    dueDate: "Due in 5 days",
    amount: 2500000,
    status: "pending",
    tab: "approaching",
  },
  {
    id: "8",
    name: "Hendra Gunawan",
    initials: "HG",
    room: "304",
    dueDate: "Overdue 10 days",
    amount: 3000000,
    status: "overdue",
    tab: "overdue",
  },
];

export const LOGS_PAGE_SIZE = 8;

export const dummyBroadcastLogs: BroadcastLog[] = [
  {
    id: "1",
    recipient: "Lantai 2 (Group)",
    type: "sms",
    time: "Today, 09:00 AM",
    status: "success",
  },
  {
    id: "2",
    recipient: "Budi Santoso (102)",
    type: "email",
    time: "Yesterday, 14:30 PM",
    status: "success",
  },
  {
    id: "3",
    recipient: "Semua Penghuni",
    type: "push",
    time: "Oct 12, 10:00 AM",
    status: "failed",
  },
  {
    id: "4",
    recipient: "Citra Dewi (305)",
    type: "sms",
    time: "Oct 11, 08:15 AM",
    status: "success",
  },
  {
    id: "5",
    recipient: "Lantai 1 (Group)",
    type: "push",
    time: "Oct 10, 04:45 PM",
    status: "success",
  },
  {
    id: "6",
    recipient: "Doni Prasetyo (201)",
    type: "email",
    time: "Oct 09, 11:30 AM",
    status: "failed",
  },
  {
    id: "7",
    recipient: "Lantai 3 (Group)",
    type: "sms",
    time: "Oct 08, 09:00 AM",
    status: "success",
  },
  {
    id: "8",
    recipient: "Eka Fitriani (103)",
    type: "push",
    time: "Oct 07, 01:20 PM",
    status: "success",
  },
  {
    id: "9",
    recipient: "Semua Penghuni",
    type: "sms",
    time: "Oct 06, 10:00 AM",
    status: "success",
  },
  {
    id: "10",
    recipient: "Fajar Nugroho (301)",
    type: "email",
    time: "Oct 05, 03:10 PM",
    status: "failed",
  },
  {
    id: "11",
    recipient: "Lantai 2 (Group)",
    type: "push",
    time: "Oct 04, 07:45 AM",
    status: "success",
  },
  {
    id: "12",
    recipient: "Gita Permata (202)",
    type: "sms",
    time: "Oct 03, 12:00 PM",
    status: "success",
  },
];

export const targetAudienceOptions = [
  { value: "semua", label: "Semua Penghuni" },
  { value: "lantai-1", label: "Lantai 1" },
  { value: "lantai-2", label: "Lantai 2" },
  { value: "lantai-3", label: "Lantai 3" },
  { value: "menunggak", label: "Menunggak Saja" },
];

export const typeIconMap: Record<string, string> = {
  sms: "MessageSquare",
  email: "Mail",
  push: "Bell",
};
