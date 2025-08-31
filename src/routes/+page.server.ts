import type { Actions, RequestEvent } from "@sveltejs/kit";

interface FormResponse {
    success: boolean;
    error?: string;
}

export const actions = {
    joinRoom: async (event: RequestEvent): Promise<FormResponse> => {
        const formData = await event.request.formData();
        console.log("formData", formData);

        // TODO: Request join room
        return { success: true };
    },
    createRoom: async () => {
       console.log("createRoom");

       // TODO: Request create room
       return { success: true };
    }
} satisfies Actions;