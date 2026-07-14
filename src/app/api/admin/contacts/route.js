export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isAuth = cookieStore.get('admin_auth');

    if (!isAuth || isAuth.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const databaseId = 'b248c3bd-680a-44b4-b7b4-1e607806c0b0';

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const query = `
      SELECT * FROM \`mp-contacts\` ORDER BY created_at DESC
    `;

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: query
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error('D1 error:', data.errors);
      return NextResponse.json({ error: 'Failed to fetch from database' }, { status: 500 });
    }

    // Cloudflare D1 query results are inside result[0].results
    const contacts = data.result[0]?.results || [];

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
