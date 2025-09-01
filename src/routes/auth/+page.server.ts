import { TURNSTILE_SECRET_KEY } from '$env/static/private';
// import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

interface FormResponse {
    success: boolean,
    error?: string,
}

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
        const formData = await request.formData();
        const token = formData.get('cf-turnstile-response');
        if (token === null) {
            return { success: false, error: 'No Turnstile token provided' };
        }

        const supabaseResponse = await validateToken(supabase, token, TURNSTILE_SECRET_KEY);

        // Redirect to main page on success
        if (supabaseResponse.success) {
            redirect(303, '/');
        }

        return supabaseResponse;
    }
};