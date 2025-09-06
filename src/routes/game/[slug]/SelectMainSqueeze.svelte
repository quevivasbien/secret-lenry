<script lang="ts">
    import Button from "$lib/components/Button.svelte";

    let {
        eligiblePlayers,
        mainSqueezeSelected,
    }: {
        eligiblePlayers: number[];
        mainSqueezeSelected: (player: number) => void;
    } = $props();

    let playerSelected = $state<number | null>(null);
</script>

<form
    class="flex flex-col gap-2"
    onsubmit={(e) => {
        e.preventDefault();
        if (playerSelected) {
            mainSqueezeSelected(playerSelected);
        }
    }}
>
    {#each eligiblePlayers as player}
        <label>
            <input
                type="radio"
                name="mainSqueeze"
                value={player}
                bind:group={playerSelected}
            />
            Player {player + 1}
        </label>
        <br />
    {/each}
    <Button disabled={!playerSelected} type="submit">
        Select Main Squeeze
    </Button>
</form>
