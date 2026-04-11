import { getToken } from "./auth";

const ADS_URL = "https://functions.poehali.dev/20fb4d0c-9d4b-45b1-b857-f639e2beaa7a";

export interface Ad {
  id: number;
  title: string;
  price: number;
  city: string;
  category: string;
  views: number;
  image_url: string | null;
  created_at: string;
  seller_name?: string;
  seller_avatar?: string | null;
  status?: string;
  moderation_comment?: string | null;
  sold_on_omo?: boolean;
  sold_at?: string | null;
  subcategory?: string | null;
  condition?: string | null;
  quantity?: number;
  viewed_at?: string;
}

export interface ListFilters {
  category?: string;
  subcategory?: string;
  city?: string;
  min_price?: string;
  max_price?: string;
  search?: string;
  limit?: number;
  offset?: number;
  user_id?: string;
  user_city?: string;
  sort_by?: string;
  condition?: string;
  max_mileage?: string;
  min_year?: string;
  max_year?: string;
  brand?: string;
  body_type?: string;
  transmission?: string;
  fuel?: string;
  drive?: string;
  size?: string;
  gender?: string;
  price_type?: string;
}

async function call(action: string, params: Record<string, string> = {}, body?: object) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${ADS_URL}/?${qs}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export async function listAds(filters: ListFilters = {}): Promise<{ ads: Ad[]; total: number }> {
  const params: Record<string, string> = {};
  if (filters.category) params.category = filters.category;
  if (filters.subcategory) params.subcategory = filters.subcategory;
  if (filters.city && filters.city !== "Все города") params.city = filters.city;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;
  if (filters.search) params.search = filters.search;
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.offset) params.offset = String(filters.offset);
  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.user_city) params.user_city = filters.user_city;
  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.condition) params.condition = filters.condition;
  if (filters.max_mileage) params.max_mileage = filters.max_mileage;
  if (filters.min_year) params.min_year = filters.min_year;
  if (filters.max_year) params.max_year = filters.max_year;
  if (filters.brand) params.brand = filters.brand;
  if (filters.body_type) params.body_type = filters.body_type;
  if (filters.transmission) params.transmission = filters.transmission;
  if (filters.fuel) params.fuel = filters.fuel;
  if (filters.drive) params.drive = filters.drive;
  if (filters.size) params.size = filters.size;
  if (filters.gender) params.gender = filters.gender;
  if (filters.price_type) params.price_type = filters.price_type;
  return call("list", params);
}

export async function myAds(status: string = "active"): Promise<{ ads: Ad[]; active_count: number; total_views: number }> {
  return call("my", { status });
}

export async function createAd(data: {
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  city: string;
  image_url?: string;
  media_urls?: Array<{ url: string; type: string }>;
  condition?: string;
  quantity?: number;
  bargain?: boolean;
  exchange?: boolean;
  price_type?: string;
  mileage?: number;
  extras?: Record<string, string>;
}): Promise<{ ad: Ad }> {
  return call("create", {}, data);
}

export async function getAd(id: number): Promise<{ ad: AdFull }> {
  return call("get", { id: String(id) });
}

export interface AdFull {
  id: number; title: string; description: string; price: number;
  city: string; category: string; views: number; image_url: string | null;
  created_at: string; status: string; user_id: number; seller_name: string;
  media: Array<{ url: string; type: string }>;
  subcategory?: string | null;
  condition?: string | null;
  quantity?: number;
  seller_phone?: string | null;
  seller_avatar?: string | null;
  bargain?: boolean;
  exchange?: boolean;
  price_type?: string;
  mileage?: number | null;
  extras?: Record<string, string> | null;
}

export async function deleteAd(id: number): Promise<void> {
  await call("delete", {}, { id });
}

export async function pauseAd(id: number): Promise<{ new_status: string }> {
  return call("pause", {}, { id });
}

export async function markSold(id: number, soldOnOmo: boolean): Promise<{ ok: boolean; sold_on_omo: boolean }> {
  return call("mark_sold", {}, { id, sold_on_omo: soldOnOmo });
}

export async function getUserStats(): Promise<{
  active_ads: number; sold_ads: number; reviews_count: number;
  avg_rating: number; joined_at: string; unread_messages: number;
}> {
  return call("user_stats");
}

export async function getSiteStats(): Promise<{ total_ads: number; total_users: number; total_cities: number; total_deals: number }> {
  return call("site_stats");
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  text: string;
  ad_id: number | null;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<{ notifications: Notification[]; unread_count: number }> {
  return call("notifications");
}

export async function markNotificationsRead(id?: number): Promise<void> {
  await call("notifications_read", {}, id ? { id } : {});
}

export async function getViewedIds(): Promise<{ ids: number[] }> {
  return call("viewed_ids");
}

export async function getViewHistory(limit = 30, offset = 0): Promise<{ ads: Ad[] }> {
  return call("view_history", { limit: String(limit), offset: String(offset) });
}

export async function getAdViewStats(adId: number, period: "day" | "3days" | "week" | "month" = "week"): Promise<{ stats: Array<{ date: string; views: number }> }> {
  return call("ad_view_stats", { ad_id: String(adId), period });
}

export async function offerPrice(adId: number, offeredPrice: number, message?: string): Promise<{ ok: boolean; offer_id: number }> {
  return call("offer_price", {}, { ad_id: adId, offered_price: offeredPrice, message: message || "" });
}

export async function getOffers(adId: number): Promise<{ offers: Array<{ id: number; offered_price: number; message: string; status: string; created_at: string; buyer_name: string }> }> {
  return call("get_offers", { ad_id: String(adId) });
}

export async function getRecommendations(limit = 8): Promise<{ ads: Ad[]; based_on: string[] }> {
  return call("recommendations", { limit: String(limit) });
}

export async function getHotAds(limit = 8): Promise<{ ads: Ad[] }> {
  return call("hot_ads", { limit: String(limit) });
}

export interface Subscription {
  id: number;
  type: "category" | "keyword";
  value: string;
  created_at: string;
}

export async function subscribe(type: "category" | "keyword", value: string): Promise<{ ok: boolean; created: boolean }> {
  return call("subscribe", {}, { type, value });
}

export async function unsubscribe(id: number): Promise<{ ok: boolean }> {
  return call("unsubscribe", {}, { id });
}

export async function getMySubscriptions(): Promise<{ subscriptions: Subscription[] }> {
  return call("my_subscriptions");
}

export async function getSimilarAds(adId: number, limit = 6): Promise<{ ads: Ad[] }> {
  return call("similar", { ad_id: String(adId), limit: String(limit) });
}

export async function getPriceHistory(adId: number): Promise<{ history: Array<{ price: number; changed_at: string }> }> {
  return call("price_history", { ad_id: String(adId) });
}

export async function getTemplates(): Promise<{ templates: Array<{ id: number; name: string; data: Record<string, string>; created_at: string }> }> {
  return call("templates_list");
}

export async function saveTemplate(name: string, data: Record<string, string>): Promise<{ id: number }> {
  return call("templates_save", {}, { name, data });
}

export async function deleteTemplate(id: number): Promise<{ ok: boolean }> {
  return call("templates_delete", {}, { id });
}

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleDateString("ru-RU");
}