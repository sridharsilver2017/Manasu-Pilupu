export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const databaseId = 'b248c3bd-680a-44b4-b7b4-1e607806c0b0';

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const query = `
      INSERT INTO \`mp-contacts\` (name, email, message)
      VALUES (?, ?, ?)
    `;

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: [name, email, message],
        sql: query
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error('D1 error:', data.errors);
      return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
