// app/api/csp-report/route.ts

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (body) {
    console.warn('[CSP Violation]', JSON.stringify(body))
  }
  return new Response(null, { status: 204 })
}
