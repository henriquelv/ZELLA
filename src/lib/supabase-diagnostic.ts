import { supabase } from "./supabase";

/**
 * Sanity check no boot. Loga resultado no console.
 * Remover em produção quando tudo estiver estável.
 */
export async function runSupabaseDiagnostic(): Promise<{ ok: boolean; details: Record<string, unknown> }> {
    const details: Record<string, unknown> = {};

    details.envUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    details.envKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
        const { data: sessionData } = await supabase.auth.getSession();
        details.hasSession = !!sessionData.session;
        details.userId = sessionData.session?.user?.id ?? null;
    } catch (e) {
        details.authError = (e as Error).message;
    }

    try {
        const { error } = await supabase.from("profiles").select("id").limit(1);
        details.profilesReadable = !error;
        if (error) details.profilesError = error.message;
    } catch (e) {
        details.profilesError = (e as Error).message;
    }

    try {
        const { error } = await supabase.from("missions").select("id").limit(1);
        details.missionsReadable = !error;
        if (error) details.missionsError = error.message;
    } catch (e) {
        details.missionsError = (e as Error).message;
    }

    const ok = Boolean(details.envUrl && details.envKey && details.profilesReadable);

    if (typeof window !== "undefined") {
        console.log(
            `%c[ZELLA Supabase] ${ok ? "OK ✓" : "PROBLEM ✗"}`,
            `color:${ok ? "#10b981" : "#ef4444"};font-weight:bold`,
            details
        );
    }

    return { ok, details };
}
