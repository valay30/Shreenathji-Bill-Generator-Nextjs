// app/api/settings/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabaseServer";

export interface DbSettings {
  id: string;
  dairy_name: string;
  tagline: string;
  contact_phone: string;
  address: string;
  default_price_per_liter: number;
  upi_id: string;
  updated_at?: string;
}

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("app_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json({
      dairyName: data.dairy_name,
      tagline: data.tagline || "",
      contactPhone: data.contact_phone || "",
      address: data.address || "",
      defaultPricePerLiter: Number(data.default_price_per_liter) || 50,
      upiId: data.upi_id || "abcdairy@upi",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      dairyName,
      tagline,
      contactPhone,
      address,
      defaultPricePerLiter,
      upiId,
    } = body;

    const row: DbSettings = {
      id: "default",
      dairy_name: dairyName || "ABC Dairy",
      tagline: tagline || "",
      contact_phone: contactPhone || "",
      address: address || "",
      default_price_per_liter: Number(defaultPricePerLiter) || 50,
      upi_id: upiId || "abcdairy@upi",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseServer
      .from("app_settings")
      .upsert([row], { onConflict: "id" });

    if (error) {
      console.error("[api/settings] Upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: row });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
