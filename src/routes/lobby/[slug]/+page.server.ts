import { supabase } from "$lib/supabase";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const { data, error } = await supabase
        .from("lobbies")
        .select("*")
        .eq("lobby_name", params.slug)
        .maybeSingle();

    console.log("Lobby data:", data, error);

    if (error) {
        // Server error
        throw redirect(303, `/error/500&message=${error.message}`);
    }

    // Note that data is null if no lobby found
    return { lobbyName: params.slug, lobby: data };
};