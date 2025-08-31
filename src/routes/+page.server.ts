import { getUser, supabase } from "$lib/supabase";
import { redirect, type Actions, type RequestEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

interface FormResponse {
    success: boolean;
    error?: string;
}

export const load: PageServerLoad = getUser;

function processValidateLobbyName(lobbyName: FormDataEntryValue | null): { lobbyName: string, error: null } | { lobbyName: null, error: string } {
    if (!lobbyName) {
        return { lobbyName: null, error: "Lobby name is required" };
    }
    lobbyName = lobbyName.toString().trim();
    if (lobbyName.length < 3 || lobbyName.length > 10) {
        return { lobbyName: null, error: "Lobby name must be between 3 and 10 characters" };
    }
    return { lobbyName, error: null };
}

function transformErrorMessage(message: string): string {
    if (message.includes("duplicate key value")) {
        return "A lobby with that name already exists. Please choose a different name.";
    }
    return message;
}

export const actions = {
    joinRoom: async (event: RequestEvent): Promise<FormResponse> => {
        const formData = await event.request.formData();
        console.log("formData", formData);
        const { lobbyName, error } = processValidateLobbyName(formData.get("roomName"));

        if (error) {
            return { success: false, error };
        }

        redirect(303, `/lobby/${encodeURIComponent(lobbyName as string)}`);
    },
    createRoom: async (event: RequestEvent): Promise<FormResponse> => {
        console.log("createRoom");
        const formData = await event.request.formData();
        const { lobbyName, error } = processValidateLobbyName(formData.get("roomName"));

        if (error) {
            return { success: false, error };
        }

        const response = await supabase
            .from("lobbies")
            .upsert(
                { lobby_name: lobbyName },
                { ignoreDuplicates: false, onConflict: "host_id" }
            );

        if (response.error) {
            console.error("Error creating lobby:", response.error);
            const message = transformErrorMessage(response.error.message);
            return { success: false, error: message };
        }

        // Go to the lobby page
        redirect(303, `/lobby/${lobbyName}`);
    }
} satisfies Actions;