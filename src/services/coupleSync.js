import { isSupabaseConfigured, supabase } from "./supabaseClient.js";

export const DEFAULT_COUPLE_ID = "private-couple";

export async function loadCoupleState(coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("couple_states").select("state").eq("couple_id", coupleId).maybeSingle();
  if (error) {
    console.error("Supabase state load failed:", error);
    throw error;
  }
  return data?.state ?? null;
}

export async function saveCoupleState(statePatch, coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) {
    const error = new Error("Supabase is not configured; state was not saved.");
    console.error("Supabase write failed:", error);
    throw error;
  }
  console.info("Saving state to Supabase...", { coupleId, domains: Object.keys(statePatch) });
  // The RPC atomically replaces only the changed top-level domains. This keeps
  // a task edit from overwriting a concurrent water or calendar update.
  const { error: rpcError } = await supabase.rpc("patch_couple_state", {
    p_couple_id: coupleId,
    p_state_patch: statePatch,
  });
  if (!rpcError) {
    console.info("Supabase write successful.");
    return;
  }

  // Existing deployments may not yet have the optional RPC from the migration.
  // Keep the established table write working while making the missing function
  // visible in the console instead of silently dropping every update.
  const missingRpc = rpcError.code === "PGRST202" || rpcError.code === "42883";
  if (!missingRpc) {
    console.error("Supabase write failed:", rpcError);
    throw rpcError;
  }

  console.warn("patch_couple_state is unavailable; using the compatible couple_states upsert.", rpcError);
  const { data: current, error: readError } = await supabase
    .from("couple_states")
    .select("state")
    .eq("couple_id", coupleId)
    .maybeSingle();
  if (readError) {
    console.error("Supabase write failed:", readError);
    throw readError;
  }
  const { error: upsertError } = await supabase.from("couple_states").upsert(
    { couple_id: coupleId, state: { ...(current?.state ?? {}), ...statePatch }, updated_at: new Date().toISOString() },
    { onConflict: "couple_id" },
  );
  if (upsertError) {
    console.error("Supabase write failed:", upsertError);
    throw upsertError;
  }
  console.info("Supabase write successful.");
}

export async function loadNotes(coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("daily_notes")
    .select("id, couple_id, author_id, author_name, body, note_date, created_at, updated_at")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Supabase notes load failed:", error);
    throw error;
  }
  return data ?? [];
}

export async function saveNote(note, coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("daily_notes").upsert(
    { ...note, couple_id: coupleId, updated_at: new Date().toISOString() },
    { onConflict: "couple_id,author_id,note_date" },
  );
  if (error) {
    console.error("Supabase note write failed:", error);
    throw error;
  }
}

export function subscribeToCoupleChanges({ coupleId = DEFAULT_COUPLE_ID, onState, onNotes }) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`couple:${coupleId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "couple_states", filter: `couple_id=eq.${coupleId}` }, (payload) => {
      if (payload.new?.state) onState(payload.new.state);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "daily_notes", filter: `couple_id=eq.${coupleId}` }, () => {
      loadNotes(coupleId).then(onNotes).catch((error) => console.error("Supabase realtime note refresh failed:", error));
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
