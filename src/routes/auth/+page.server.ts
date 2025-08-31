import { TURNSTILE_SECRET_KEY } from '$env/static/private';
// import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

interface FormResponse {
    success: boolean,
    error?: string,
}

// export const load: PageServerLoad = async ({ locals: { supabase } }) => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (user) {
//         // User is authenticated, no need to re-authenticate, redirect to main page
//         redirect(303, '/');
//     }
// };

async function validateToken(supabase: SupabaseClient, token: FormDataEntryValue, secret: string): Promise<FormResponse> {
    // Auth anonymously with supabase
    const { error } = await supabase.auth.signInAnonymously({ options: { captchaToken: token.toString() } });
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

export const actions = {
    default: async ({ request, locals: { supabase } }): Promise<FormResponse> => {
        console.log('Request received for Turnstile validation');
        const formData = await request.formData();
        console.log('Form Data:', formData);
        const token = formData.get('cf-turnstile-response');
        if (token === null) {
            return { success: false, error: 'No Turnstile token provided' };
        }

        console.log('Turnstile token:', token);

        const supabaseResponse = await validateToken(supabase, token, TURNSTILE_SECRET_KEY);

        return supabaseResponse;
    }
};