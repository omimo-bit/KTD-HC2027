
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const gasUrl =
        process.env.GAS_API_URL ||
        process.env.NEXT_PUBLIC_GAS_API_URL;

    if (!gasUrl) {
        return Response.json(
            { ok: false, error: "GAS_API_URL belum diatur di Vercel." },
            { status: 500 }
        );
    }

    try {
        const body = await request.text();

        const upstream = await fetch(gasUrl, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body,
            cache: "no-store",
            redirect: "follow"
        });

        const text = await upstream.text();

        return new Response(text, {
            status: upstream.ok ? 200 : upstream.status,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        });
    } catch (error) {
        return Response.json({
            ok: false,
            error: error instanceof Error
                ? error.message
                : "Gagal menghubungi Apps Script."
        }, { status: 502 });
    }
}
