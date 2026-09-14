import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Push no configurado");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function authenticatedUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const db = adminClient();
  const { data } = await db.auth.getUser(token);
  return data.user || null;
}

export function configureWebPush() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) throw new Error("VAPID no configurado");
  webpush.setVapidDetails(subject, publicKey, privateKey);
}
