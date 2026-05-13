import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount,
      orderData
    } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update database
    // 1. Create the order in public.orders
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: amount,
        payment_method: "Razorpay",
        payment_status: "success",
        order_status: "ordered",
        shipping_address: orderData.address,
        customer_name: orderData.name || user.user_metadata?.full_name,
        customer_email: orderData.email || user.email,
        customer_phone: orderData.phone || user.user_metadata?.phone,
        razorpay_order_id: razorpay_order_id
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert items
    const itemsToInsert = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_name: item.name,
      quantity: item.qty,
      price: item.price,
      bottle_size: item.size
    }));

    await supabase.from("order_items").insert(itemsToInsert);

    // 3. Log the payment
    await supabase.from("payments").insert({
      user_id: user.id,
      order_id: order.id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount: amount,
      status: "captured"
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
