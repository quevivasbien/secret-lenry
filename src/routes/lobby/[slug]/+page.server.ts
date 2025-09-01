import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
    const lobbyName = params.slug;
    // Get host ID
    const lobbyDataResponse = await supabase
        .from("lobbies")
        .select("host_id")
        .eq("lobby_name", lobbyName)
        .maybeSingle();
    if (lobbyDataResponse.error) {
        error(500, lobbyDataResponse.error.message);
    }
    if (!lobbyDataResponse.data) {
        // Lobby does not exist
        const message = `Lobby "${lobbyName}" not found`;
        error(404, message);
    }
    const host_id = lobbyDataResponse.data.host_id;

    return { lobbyName, host_id };
};