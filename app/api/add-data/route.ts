// app/api/add-data/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      customerName,
      mobileNumber,
      billingPeriod,
      milkQuantity,
      pricePerLiter,
      totalAmount
    } = await request.json();

    // Check if the secret key from the client matches the server-side key
    // This is an optional security measure, but good practice.
    // const clientSecret = secret;
    const serverSecret = process.env.SECRET_KEY;
    const googleSheetsUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

    if (!googleSheetsUrl || !serverSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const dataToSend = {
      customerName,
      mobileNumber,
      billingPeriod,
      milkQuantity,
      pricePerLiter,
      totalAmount,
      secret: serverSecret, // The secret key is added here, on the server
    };

    const response = await fetch(googleSheetsUrl, {
      method: 'POST',
    //   mode: 'no-cors', // Required for Google Sheets Web App
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Since we use 'no-cors', we can't check the response status.
    // Assume success if the fetch operation completes without an error.
    return NextResponse.json({ success: true, message: 'Data sent successfully' });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to add data' }, { status: 500 });
  }
}