import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/metrics/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return default metrics if backend is unavailable
      return NextResponse.json(
        {
          users: { total: 0 },
          usage: { totalPrompts: 0, totalTemplates: 0 },
          cached: false,
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    // Return safe defaults on error
    return NextResponse.json(
      {
        users: { total: 0 },
        usage: { totalPrompts: 0, totalTemplates: 0 },
        cached: false,
      },
      { status: 200 }
    );
  }
}
