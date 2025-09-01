<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Deck from "$lib/components/Deck.svelte";
    import type { CardInfo } from "$lib/interfaces";
    import { shuffleArray } from "$lib/utils";

    let cardsBack: CardInfo[] = $state([
        { front: "a-front", back: "a-back" },
        { front: "b-front", back: "b-back" },
        { front: "c-front", back: "c-back" },
    ]);
    let cardsFront: CardInfo[] = $state([]);

    function drawCard() {
        const card = cardsBack.pop();
        if (card) {
            cardsFront.push(card);
        }
    }

    function resetCards() {
        cardsBack = shuffleArray([...cardsBack, ...cardsFront]);
        cardsFront = [];
    }
</script>

<div class="flex flex-row justify-center content-center gap-4">
    <Deck cards={cardsBack} side="back" />
    <Deck cards={cardsFront} side="front" />
</div>

<Button onclick={drawCard}>Draw Card</Button>
<Button onclick={resetCards}>Reset</Button>
