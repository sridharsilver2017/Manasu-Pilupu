import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, id, amount } = body;

    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderAmount = amount || 99.00;
    
    // We are using the Production URL
    const CASHFREE_API_URL = 'https://api.cashfree.com/pg/orders';

    const response = await fetch(CASHFREE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify({
        order_amount: parseFloat(orderAmount),
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: (!id || id === 'GUEST') ? `GUEST_${Date.now()}` : String(id),
          customer_name: username || 'Premium User',
          customer_email: email || 'user@example.com',
          customer_phone: '9999999999' // Cashfree requires a valid phone number format
        },
        order_meta: {
          return_url: 'http://localhost:3000/pricing?status=success'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Error:', data);
      return NextResponse.json({ error: data.message || 'Failed to create Cashfree order' }, { status: response.status });
    }

    return NextResponse.json({ payment_session_id: data.payment_session_id, order_id: data.order_id });
  } catch (error) {
    console.error('Internal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
