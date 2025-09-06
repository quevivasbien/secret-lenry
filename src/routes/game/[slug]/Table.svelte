<script lang="ts">
    import type { Game } from "$lib/game";

    import lenryBGImage from "$lib/assets/SecretLenry.png";
    import Deck from "./Deck.svelte";

    let { game }: { game: Game } = $props();
    let policy_cards = $derived(game.policyCardInfo());
    let discarded_cards = $derived(game.policyCardInfo(true));
</script>

<div
    style="
        background-image: url({lenryBGImage});
        background-color: rgba(255,255,255,0.5);
        background-blend-mode: lighten;
    "
    class="relative flex flex-col items-center justify-center gap-4 p-4 bg-cover bg-center bg-opacity-50 rounded-lg shadow-lg"
>
    <Deck cards={policy_cards} side="back" />
    <Deck cards={discarded_cards} side="front" />
</div>
