
export async function api<T>(
    action: string,
    token?: string,
    payload: Record<string, unknown> = {}
): Promise<T> {
    const response = await fetch("/api/gas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ action, token, ...payload }),
        cache: "no-store"
    });

    const result = await response.json();

    if (!response.ok || result.ok === false) {
        throw new Error(
            result.error || `Permintaan gagal (${response.status}).`
        );
    }

    return result.data as T;
}

export async function login(username: string, password: string) {
    return api<{ user: import("./types").SessionUser }>(
        "login",
        undefined,
        { username, password }
    );
}
