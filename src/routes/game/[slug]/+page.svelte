<script lang="ts">
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import Table from "./Table.svelte";
    import { Game } from "$lib/game.js";
    import { onMount } from "svelte";
    import SelectMainSqueeze from "./SelectMainSqueeze.svelte";

    let { data } = $props();
    let { host_id, supabase, user } = $derived(data);

    let amHost = $derived(user?.id === host_id);
    let game: Game | null = $state(null);

    let errorState: { status: number; message: string } | null = $state(null);
    let statusMessage: string | null = $state(null);

    let showSelectMainSqueeze = $state(false);

    onMount(() => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        Game.fromDB(supabase, host_id)
            .then((g) => {
                game = g;
                if (!game) {
                    errorState = { status: 404, message: "Game not found" };
                } else {
                    gameTurn();
                }
            })
            .catch((e) => {
                console.error("Error loading game from DB:", e);
                if (e.message.includes("invalid input syntax for type uuid")) {
                    errorState = { status: 404, message: "Game not found" };
                } else {
                    console.error(e);
                    errorState = {
                        status: 500,
                        message: "Internal server error",
                    };
                }
            });

        // TODO: Listen for game state updates
    });

    function gameTurn() {
        if (!game) {
            throw new Error("Game not loaded");
        }
        if (!user) {
            throw new Error("User not authenticated");
        }

        if (game.players[game.governor] == user.id) {
            // User is the governor, allow taking action
            showSelectMainSqueeze = true;
        } else {
            statusMessage =
                "Waiting for the governor to nominate a main squeeze...";
        }
    }

    function mainSqueezeSelected(player: number) {
        if (!game) {
            throw new Error("Game not loaded");
        }
        statusMessage = `You nominated player ${player} as main squeeze.`;

        game.main_squeeze_candidate = player;
        game
            .toDB(supabase)
            .then(() => {
                showSelectMainSqueeze = false;
                statusMessage = "Voting on main squeeze...";
            })
            .catch((e) => {
                console.error("Error saving game to DB:", e);
                errorState = {
                    status: 500,
                    message: "Internal server error",
                };
            });
    }
</script>

{#if errorState}
    <ErrorMessage status={errorState.status} message={errorState.message} />
{:else if !game}
    <p class="text-center">Loading game...</p>
{:else}
    <div class="flex flex-col gap-4 m-2 sm:m-4">
        <Table {game} />
        {#if showSelectMainSqueeze}
            <p class="text-green-600">
                It's your turn to nominate a main squeeze!
            </p>
            <SelectMainSqueeze
                eligiblePlayers={game.getEligibleMainSqueezePlayers()}
                mainSqueezeSelected={mainSqueezeSelected}
            />
        {/if}
        {#if statusMessage}
            <p class="text-yellow-600">{statusMessage}</p>
        {/if}
        {JSON.stringify(game)}
    </div>
{/if}
