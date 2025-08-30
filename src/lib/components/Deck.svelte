<script lang="ts">
    import type { CardInfo } from "$lib/interfaces";
    import Card from "./Card.svelte";

    let {
        cards,
        side = "back",
    }: {
        cards: CardInfo[];
        side: "front" | "back";
    } = $props();
</script>

<div class="relative w-[90px] h-[120px] sm:w-[135px] sm:h-[180px]">
    {#each cards as card (card.front + card.back)}
        <div class="absolute top-0 right-0">
            <Card {side} front={card.front} back={card.back} />
        </div>
    {/each}
</div>
