// app/api/csp-report/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (body) {
    console.warn('[CSP Violation]', JSON.stringify(body))
  }
  return NextResponse.json({ ok: true }, { status: 204 })
}
