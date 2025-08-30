<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte"
    import { sharedState } from "$lib/state.svelte";
    let side: "front" | "back" = $state("front");
</script>

<Card front="Hello" back="World" {side} />
<Button onclick={() => side = side === "front" ? "back" : "front"}>
    Flip
</Button>

<Button onclick={() => {
    if (sharedState.uiScale === "small") {
        sharedState.uiScale = "large";
    } else {
        sharedState.uiScale = "small";
    }
}}>
    Toggle Size (currently {sharedState.uiScale})
</Button>