import { getToken } from "./auth";

const URL = "https://functions.poehali.dev/06c2d970-8953-4cdd-9896-1d25be362b0b";

function headers() {
  const t = getToken();
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function call(action: string, params: Record<string, string> = {}, body?: object) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${URL}/?${qs}`, {
    method: body ? "POST" : "GET",
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка");
  return data;
}

export interface Dialog {
  other_user_id: number;
  other_name: string;
  other_avatar?: string | null;
  last_message: string;
  last_time: string;
  is_mine: boolean;
  ad_id: number | null;
  ad_title: string | null;
  unread: number;
}

export interface Message {
  id: number;
  sender_id: number;
  text: string;
  created_at: string;
  ad_id: number | null;
  ad_title: string | null;
  sender_name: string;
}

export const getInbox = () => call("inbox") as Promise<{ dialogs: Dialog[] }>;

export const getThread = (other_id: number) =>
  call("thread", { other_id: String(other_id) }) as Promise<{
    messages: Message[];
    other: { id: number; name: string; avatar_url?: string | null } | null;
  }>;

export const sendMessage = (receiver_id: number, text: string, ad_id?: number) =>
  call("send", {}, { receiver_id, text, ...(ad_id ? { ad_id } : {}) });

export const getReviews = (user_id: number) =>
  call("reviews_list", { user_id: String(user_id) }) as Promise<{
    reviews: Array<{
      id: number; rating: number; text: string; created_at: string;
      author_name: string; author_id: number; ad_title: string | null; ad_id: number | null;
    }>;
    total: number;
    avg_rating: number;
    user: { id: number; name: string; created_at: string; ads_count: number } | null;
  }>;

export const createReview = (data: {
  target_user_id: number; rating: number; text?: string; ad_id?: number;
}) => call("reviews_create", {}, data);

export const getAdminStats = () => {
  const t = getToken();
  return fetch(`https://functions.poehali.dev/3f7b8301-8cf8-409e-ae75-11df2296bf1d/?action=stats`, {
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
  }).then(r => r.json());
};

export const adminCall = async (action: string, params: Record<string, string> = {}, body?: object) => {
  const t = getToken();
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`https://functions.poehali.dev/3f7b8301-8cf8-409e-ae75-11df2296bf1d/?${qs}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};