import { isSupabaseConfigured, supabase } from "./supabaseClient.js";

export const DEFAULT_COUPLE_ID = "private-couple";

export async function loadCoupleState(coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("couple_states").select("state").eq("couple_id", coupleId).maybeSingle();
  if (error) throw error;
  return data?.state ?? null;
}

export async function saveCoupleState(statePatch, coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) return;
  // The RPC atomically replaces only the changed top-level domains. This keeps
  // a task edit from overwriting a concurrent water or calendar update.
  const { error } = await supabase.rpc("patch_couple_state", {
    p_couple_id: coupleId,
    p_state_patch: statePatch,
  });
  if (error) throw error;
}

export async function loadNotes(coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("daily_notes")
    .select("id, couple_id, author_id, author_name, body, note_date, created_at, updated_at")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveNote(note, coupleId = DEFAULT_COUPLE_ID) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("daily_notes").upsert(
    { ...note, couple_id: coupleId, updated_at: new Date().toISOString() },
    { onConflict: "couple_id,author_id,note_date" },
  );
  if (error) throw error;
}

export function subscribeToCoupleChanges({ coupleId = DEFAULT_COUPLE_ID, onState, onNotes }) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`couple:${coupleId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "couple_states", filter: `couple_id=eq.${coupleId}` }, (payload) => {
      if (payload.new?.state) onState(payload.new.state);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "daily_notes", filter: `couple_id=eq.${coupleId}` }, () => {
      loadNotes(coupleId).then(onNotes).catch(() => {});
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
