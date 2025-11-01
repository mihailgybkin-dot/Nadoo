import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'


export async function GET(req: Request) {
const url = new URL(req.url)
const q = url.searchParams.get('q')?.trim()
const supabase = createRouteHandlerClient({ cookies })
if (!q) return Response.json({ items: [] })
const { data } = await supabase.from('items').select('id, title, description').ilike('title', `%${q}%`).limit(10)
return Response.json({ items: data ?? [] })
}
