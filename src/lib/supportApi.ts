import { getToken } from "./auth";

const SUPPORT_URL = "https://functions.poehali.dev/b4c0d5cd-d6f5-48da-b59c-f323fce0bb7d";

function headers() {
  const t = getToken();
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function call(action: string, params: Record<string, string> = {}, body?: object) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${SUPPORT_URL}/?${qs}`, {
    method: body ? "POST" : "GET",
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export interface SupportTicket {
  id: number;
  subject: string;
  status: "open" | "answered" | "closed";
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_id?: number;
  unread?: number;
  unread_admin?: number;
}

export interface SupportMessage {
  id: number;
  sender_id: number | null;
  is_admin: boolean;
  text: string;
  created_at: string;
  sender_name: string | null;
}

export const createTicket = (subject: string, message: string) =>
  call("create_ticket", {}, { subject, message }) as Promise<{ ticket_id?: number; error?: string }>;

export const myTickets = () =>
  call("my_tickets") as Promise<{ tickets: SupportTicket[]; unread: number }>;

export const getTicket = (ticket_id: number) =>
  call("get_ticket", { ticket_id: String(ticket_id) }) as Promise<{ ticket: SupportTicket; messages: SupportMessage[] }>;

export const sendMessage = (ticket_id: number, text: string) =>
  call("send_message", {}, { ticket_id, text });

export const adminListTickets = (status = "open") =>
  call("list_tickets", { status }) as Promise<{ tickets: SupportTicket[]; open_count: number }>;

export const adminReply = (ticket_id: number, text: string) =>
  call("admin_reply", {}, { ticket_id, text });

export const closeTicket = (ticket_id: number) =>
  call("close_ticket", {}, { ticket_id });

export const adminTicketsCount = () =>
  call("admin_tickets_count") as Promise<{ count: number }>;
