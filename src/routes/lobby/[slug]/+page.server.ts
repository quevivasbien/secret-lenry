import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
    const lobbyName = params.slug;
    // Get host ID
    const lobbyDataRespose = await supabase.from("lobbies").select("host_id").eq("lobby_name", lobbyName).maybeSingle();
    if (lobbyDataRespose.error) {
        console.error("Error fetching lobby data:", lobbyDataRespose.error);
        throw redirect(303, `/error/500?message=${lobbyDataRespose.error.message}`);
    }
    if (!lobbyDataRespose.data) {
        // Lobby does not exist
        const encodedMessage = encodeURIComponent(`Lobby "${lobbyName}" not found`);
        throw redirect(303, `/error/404?message=${encodedMessage}`);
    }
    const host_id = lobbyDataRespose.data.host_id;

    // Add self to lobby
    const upsertResponse = await supabase.from("lobby_members").upsert({ host_id: host_id });
    if (upsertResponse.error) {
        console.error("Error adding self to lobby:", upsertResponse.error);
        throw redirect(303, `/error/500?message=${upsertResponse.error.message}`);
    }

    return { lobbyName, host_id };
};