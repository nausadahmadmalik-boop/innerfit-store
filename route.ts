import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cleanText } from "@/lib/validation";
function authorized(req: Request) {
  const token = process.env.ADMIN_API_TOKEN;
  return !!token && req.headers.get("authorization") === `Bearer ${token}`;
}
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Admin authentication is not configured. Add a secure admin login before using this dashboard." }, { status: 401 });
  try { const { data, error } = await supabaseAdmin().from("products").select("*").order("created_at", { ascending: false }); if (error) throw error; return NextResponse.json({ products: data }); }
  catch { return NextResponse.json({ error: "Could not load products." }, { status: 500 }); }
}
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Admin authentication is not configured. Add a secure admin login before using this dashboard." }, { status: 401 });
  try {
    const b = await req.json(); const name = cleanText(b.name, 120); const category = cleanText(b.category, 20);
    const price = Number(b.price), stock = Number(b.stock);
    if (!name || !["Men","Women","Kids"].includes(category) || !Number.isFinite(price) || price <= 0 || price > 100000 || !Number.isInteger(stock) || stock < 0 || !Array.isArray(b.sizes) || b.sizes.length > 30) return NextResponse.json({ error: "Invalid product details." }, { status: 400 });
    const payload = { name, category, description: cleanText(b.description, 500), price, stock, sizes: b.sizes.map((s: unknown)=>cleanText(s,20)).filter(Boolean), image_emoji: cleanText(b.image_emoji,8)||"🩲", active: true };
    const { data, error } = await supabaseAdmin().from("products").insert(payload).select().single(); if (error) throw error; return NextResponse.json({ product: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not save product. Check database schema." }, { status: 500 }); }
}
export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 401 });
  try { const b = await req.json(); if (typeof b.id !== "string" || typeof b.active !== "boolean") return NextResponse.json({ error: "Invalid request." }, { status: 400 }); const { error } = await supabaseAdmin().from("products").update({active:b.active}).eq("id",b.id); if(error) throw error; return NextResponse.json({ok:true}); }
  catch { return NextResponse.json({ error: "Could not update product." }, { status: 500 }); }
}
