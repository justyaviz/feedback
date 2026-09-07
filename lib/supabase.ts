import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let clientPromise: Promise<SupabaseClient> | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    const response = await fetch("/api/config", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Supabase konfiguratsiyasini olib bo‘lmadi.");
    }

    const config = await response.json();
    if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
      throw new Error(
        "Supabase ulanmagan. Railway Variables ichida SUPABASE_URL va SUPABASE_ANON_KEY (yoki NEXT_PUBLIC_* variantlari) bo‘lishi kerak."
      );
    }

    return createClient(config.supabaseUrl, config.supabaseAnonKey);
  })();

  try {
    return await clientPromise;
  } catch (error) {
    clientPromise = null;
    throw error;
  }
}
