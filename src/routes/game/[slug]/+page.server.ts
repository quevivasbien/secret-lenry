import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
    const host_id = params.slug;
    // Check that game exists
    const gameDataResponse = await supabase
        .from("games")
        .select("*")
        .eq("host_id", host_id)
        .maybeSingle();
    if (gameDataResponse.error) {
        error(500, gameDataResponse.error.message);
    }
    if (!gameDataResponse.data) {
        // Game does not exist
        const message = `Game "${host_id}" not found`;
        error(404, message);
    }

    return { host_id, gameData: gameDataResponse.data };
};
