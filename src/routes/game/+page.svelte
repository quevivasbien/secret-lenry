<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Deck from "$lib/components/Deck.svelte";
    import type { CardInfo } from "$lib/interfaces";

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

    function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
