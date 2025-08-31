import { TURNSTILE_SECRET_KEY } from '$env/static/private';
import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';

interface FormResponse {
    success: boolean,
    error?: string,
}

async function validateToken(token: FormDataEntryValue, secret: string): Promise<FormResponse> {
    // Auth anonymously with supabase
    const { error } = await supabase.auth.signInAnonymously({ options: { captchaToken: token.toString() } });
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

export const actions = {
    default: async ({ request }): Promise<FormResponse> => {
        console.log('Request received for Turnstile validation');
        const formData = await request.formData();
        console.log('Form Data:', formData);
        const token = formData.get('cf-turnstile-response');
        if (token === null) {
            return { success: false, error: 'No Turnstile token provided' };
        }

        console.log('Turnstile token:', token);

        const supabaseResponse = await validateToken(token, TURNSTILE_SECRET_KEY);
        if (supabaseResponse.success) {
            redirect(303, '/');
        }
        
        return supabaseResponse;
    }
};