// GameState is a serializable object that represents the current state of the game.

import { randInt, shuffleArray } from "$lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

export class Game {
    constructor(
        private host_id: string,
        private players: string[],
        private policy_deck: Policy[],
        private discarded_policies: Policy[],
        private enacted_hen_policies: number,
        private enacted_len_policies: number,
        private roles: Record<string, Role>,
        private governor: number,  // Nominates main squeeze, draws and proposes policies
        private main_squeeze: number,  // Enacts policies, win condition if lenry becomes main squeeze
    ) {}

    static new(host_id: string, players: string[]): Game {
        if (players.length < 5 || players.length > 10) {
            // TODO: Add check to disallow lobbies with too many players
            throw new Error("Invalid number of players");
        }

        return new Game(
            host_id,
            players,
            create_policy_deck(),
            [],
            0,
            0,
            assign_roles(players),
            randInt(0, players.length - 1),
            -1,
        );
    }

    static async fromDB(supabase: SupabaseClient, host_id: string): Promise<Game | null> {
        const { data, error } = await supabase
            .from("games")
            .select("player_ids, state")
            .eq("host_id", host_id)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to fetch game from DB: ${error.message}`);
        }

        if (!data) {
            return null;
        }

        const { player_ids, state } = data;

        const playerRoles: Record<string, Role> = {};
        state.roles.forEach((role: Role, i: number) => {
            playerRoles[player_ids[i]] = role;
        });

        return new Game(
            host_id,
            player_ids,
            state.deck,
            state.discard,
            state.hen_pol,
            state.len_pol,
            playerRoles,
            state.governor,
            state.main_sq
        );
    }

    async toDB(supabase: SupabaseClient): Promise<void> {
        const gameData = {
            deck: this.policy_deck,
            discard: this.discarded_policies,
            hen_pol: this.enacted_hen_policies,
            len_pol: this.enacted_len_policies,
            roles: this.players.map((id) => this.roles[id]),
            governor: this.governor,
            main_sq: this.main_squeeze,
        };
        const { error } = await supabase
            .from("games")
            .upsert(
                { player_ids: this.players, state: gameData },
                { ignoreDuplicates: false, onConflict: "host_id" }
            )
            .eq("host_id", this.host_id);
        if (error) {
            throw new Error(`Failed to update game in DB: ${error.message}`);
        }
    }
}


type Policy = "l" | "h";
const n_len_policies = 11;
const n_hen_policies = 6;

function create_policy_deck(): Policy[] {
    const policies = Array(n_len_policies).fill("l").concat(
        Array(n_hen_policies).fill("h")
    );
    return shuffleArray(policies);
}


type Role = "j" | "h" | "l";

const ROLE_COUNTS: Record<number, Record<Role, number>> = {
    5: { j: 3, h: 1, l: 1 },
    6: { j: 4, h: 1, l: 1 },
    7: { j: 4, h: 2, l: 1 },
    8: { j: 5, h: 2, l: 1 },
    9: { j: 5, h: 3, l: 1 },
    10: { j: 6, h: 3, l: 1 },
}

function assign_roles(players: string[]): Record<string, Role> {
    const role_counts = ROLE_COUNTS[players.length];
    if (!role_counts) {
        throw new Error(`Invalid number of players: ${players.length}`);
    }
    const available_roles = shuffleArray(
        Object.entries(role_counts)
            .flatMap(([role, count]) => Array(count).fill(role as Role))
    );

    const roles: Record<string, Role> = {};
    players.forEach((player, i) => {
        roles[player] = available_roles[i];
    });

    return roles;
}
