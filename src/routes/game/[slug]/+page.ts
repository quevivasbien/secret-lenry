import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
    const host_id = params.slug;
    
    return { host_id };
};
