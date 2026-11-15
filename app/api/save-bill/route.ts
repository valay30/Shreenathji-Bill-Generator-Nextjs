// app/api/save-bill/route.ts
// All Supabase writes happen here on the server — the service role key never reaches the browser.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabaseServer";

interface SaveBillRequest {
  customerName: string;
  mobileNumber: string;
  billingPeriod: string;
  milkQuantity: number;
  pricePerLiter: number;
  totalAmount: number;
}

function validate(body: SaveBillRequest): string | null {
  const { customerName, mobileNumber, billingPeriod, milkQuantity, pricePerLiter, totalAmount } = body;
  if (!customerName?.trim()) return "Customer name is required.";
  if (!mobileNumber?.trim() || !/^\d{10}$/.test(mobileNumber.trim()))
    return "A valid 10-digit mobile number is required.";
  if (!billingPeriod?.trim()) return "Billing period is required.";
  if (typeof milkQuantity !== "number" || milkQuantity <= 0) return "Milk quantity must be > 0.";
  if (typeof pricePerLiter !== "number" || pricePerLiter <= 0) return "Price per liter must be > 0.";
  if (typeof totalAmount !== "number" || totalAmount <= 0) return "Total amount must be > 0.";
  return null;
}

export async function POST(request: Request) {
  let body: SaveBillRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  const { customerName, mobileNumber, billingPeriod, milkQuantity, pricePerLiter, totalAmount } = body;
  const name = customerName.trim();
  const mobile = mobileNumber.trim();

  // 1. Upsert customer (insert or update on mobile_number conflict)
  const { error: customerError } = await supabaseServer
    .from("customers")
    .upsert([{ name, mobile_number: mobile }], { onConflict: "mobile_number" });

  if (customerError) {
    console.error("[save-bill] Customer upsert error:", customerError);
    return NextResponse.json(
      { error: `Failed to save customer: ${customerError.message}` },
      { status: 500 }
    );
  }

  // 2. Insert bill record
  const { error: billError } = await supabaseServer.from("bill_details").insert([
    {
      customer_name: name,
      mobile_number: mobile,
      billing_period: billingPeriod,
      milk_quantity: milkQuantity,
      price_per_liter: pricePerLiter,
      total_amount: totalAmount,
    },
  ]);

  if (billError) {
    console.error("[save-bill] Bill insert error:", billError);
    return NextResponse.json(
      { error: `Failed to save bill: ${billError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
