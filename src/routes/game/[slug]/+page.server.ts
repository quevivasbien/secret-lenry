import { redirect } from "@sveltejs/kit";
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
        console.error("Error fetching lobby data:", lobbyDataResponse.error);
        throw redirect(303, `/error/500?message=${lobbyDataResponse.error.message}`);
    }
    if (!lobbyDataResponse.data) {
        // Lobby does not exist
        const encodedMessage = encodeURIComponent(`Lobby "${lobbyName}" not found`);
        throw redirect(303, `/error/404?message=${encodedMessage}`);
    }
    const host_id = lobbyDataResponse.data.host_id;

    return { lobbyName, host_id };
};
