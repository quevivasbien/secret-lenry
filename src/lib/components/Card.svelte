<script lang="ts">
    import { sharedState } from "$lib/state.svelte";

    let { front, back, side = "back" }: {
        front: string,
        back: string,
        side: "front" | "back",
    } = $props();

    let { cardWidth, cardHeight } = $derived.by(() => {
        if (sharedState.uiScale === "small") {
            return { cardWidth: 60, cardHeight: 80 };
        }
        return { cardWidth: 90, cardHeight: 120 };
    });
</script>

{#if side === "front"}
    <div class="p-4 border rounded shadow" style="width: {cardWidth}px; height: {cardHeight}px">
        {front}
    </div>
{:else}
    <div class="p-4 border rounded shadow bg-gray-100" style="width: {cardWidth}px; height: {cardHeight}px">
        {back}
    </div>
{/if}