import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { redirect } from "@sveltejs/kit";

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // User not authenticated, redirect to auth page
        redirect(303, '/auth');
    }
    return { user };
}