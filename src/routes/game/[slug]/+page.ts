import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { Game } from "$lib/game";

export const load: PageLoad = async ({ params }) => {
    const host_id = params.slug;
    
    return { host_id };
};
