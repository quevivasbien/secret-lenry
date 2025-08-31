import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url, params }) => {
    // get message param from url params
    const message = url.searchParams.get("message") || "An unknown error occurred";
    return { error_code: params.slug, message };
}