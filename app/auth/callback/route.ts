// app/auth/callback/route.ts
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'


export async function GET(request: Request) {
const reqUrl = new URL(request.url)
const code = reqUrl.searchParams.get('code')
if (code) {
const supabase = createRouteHandlerClient({ cookies })
await supabase.auth.exchangeCodeForSession(code)
}
return NextResponse.redirect(new URL('/', reqUrl.origin))
}
