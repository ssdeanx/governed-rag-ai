import type { NextRequest } from 'next/server'
import { getMastraBaseUrl } from '../../../../lib/mastra/mastra-client'

function findToken(obj: any) {
    if (!obj) {
        return null
    }
    return (
        obj.token ??
        obj.jwt ??
        obj.accessToken ??
        obj.data?.token ??
        obj.data?.accessToken ??
        null
    )
}

export async function POST(req: NextRequest) {
    const body = await req.json()

    const url = `${getMastraBaseUrl()}/auth/signup`

    let res: Response
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: 'Failed to reach auth server' }),
            { status: 502, headers: { 'Content-Type': 'application/json' } }
        )
    }

    let data: any
    try {
        data = await res.json()
    } catch (e) {
        data = { message: await res.text() }
    }

    const token = findToken(data)

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }
    if (token) {
        const maxAge = 7 * 24 * 60 * 60 // 7 days
        const encoded = encodeURIComponent(token)
        const secureFlag =
            process.env.NODE_ENV === 'production' ? '; Secure' : ''
        const cookie = `mastra_jwt=${encoded}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secureFlag}`
        headers['Set-Cookie'] = cookie
    }

    return new Response(JSON.stringify(data), { status: res.status, headers })
}
