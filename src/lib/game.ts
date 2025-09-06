// GameState is a serializable object that represents the current state of the game.

import { randInt, shuffleArray } from "$lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CardInfo } from "./interfaces";

type DBGameState = {
    deck: Policy[];
    discard: Policy[];
    hen_pol: number;
    len_pol: number;
    roles: Role[];
    governor: number;
    main_sq: number;
    candidate?: number;
    votes?: boolean[];
};

export class Game {
    constructor(
        public host_id: string,
        public players: string[],
        public policy_deck: Policy[],
        public discarded_policies: Policy[],
        public enacted_hen_policies: number,
        public enacted_len_policies: number,
        public roles: Record<string, Role>,
        public governor: number,  // Nominates main squeeze, draws and proposes policies
        public main_squeeze: number,  // Enacts policies, win condition if lenry becomes main squeeze
        public main_squeeze_candidate: number = -1,
        public candidate_votes: boolean[] = [],
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
            0, // randInt(0, players.length - 1), // TODO: In prod, this should be random
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

        const { player_ids, state }: { player_ids: string[]; state: DBGameState } = data;

        const playerRoles: Record<string, Role> = {};
        state.roles.forEach((role: Role, i: number) => {
            playerRoles[player_ids[i]] = role;
        });

        const candidate = state.candidate ?? -1;
        const votes = state.votes ?? [];
        if (candidate === -1 && votes.length > 0) {
            throw new Error("Invalid game state: votes without candidate.");
        }

        return new Game(
            host_id,
            player_ids,
            state.deck,
            state.discard,
            state.hen_pol,
            state.len_pol,
            playerRoles,
            state.governor,
            state.main_sq,
            candidate,
            votes,
        );
    }

    async toDB(supabase: SupabaseClient): Promise<void> {
        const gameData: DBGameState = {
            deck: this.policy_deck,
            discard: this.discarded_policies,
            hen_pol: this.enacted_hen_policies,
            len_pol: this.enacted_len_policies,
            roles: this.players.map((id) => this.roles[id]),
            governor: this.governor,
            main_sq: this.main_squeeze,
        };
        if (this.main_squeeze_candidate !== -1) {
            gameData.candidate = this.main_squeeze_candidate;
            gameData.votes = this.candidate_votes;
        }

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

    policyCardInfo(discarded: boolean = false): CardInfo[] {
        const cards = discarded ? this.discarded_policies : this.policy_deck;
        return cards.map((policy) => ({
            front: policy === "h" ? "henry policy" : "lenry policy",
            back: "policy card",
        }));
    }

    getEligibleMainSqueezePlayers(): number[] {
        // Main squeeze cannot also be the governor
        // TODO: Add ability to also filter players who have recently been governor or main squeeze
        const eligible = [];
        for (let i = 0; i < this.players.length; i++) {
            if (i !== this.governor) {
                eligible.push(i);
            }
        }
        return eligible;
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
