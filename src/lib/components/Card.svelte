<script lang="ts">
    let {
        front,
        back,
        side = "back",
    }: {
        front: string;
        back: string;
        side: "front" | "back";
    } = $props();

    const MAX_ROTATION_DEG = 3;
    const rotation = -MAX_ROTATION_DEG + 2 * Math.random() * MAX_ROTATION_DEG;
</script>

<div
    class="m-1 p-1 border border-gray-200 rounded shadow flex flex-col justify-center content-center select-none w-[90px] h-[120px] sm:w-[135px] sm:h-[180px] bg-white text-sm sm:text-lg"
    style="transform: rotate({rotation}deg);"
>
    {#if side === "front"}
        <div class="justify-center text-center">{front}</div>
    {:else}
        <div
            class="p-1 h-full w-full border border-gray-400 bg-gray-300 rounded flex flex-col justify-center content-center"
        >
            <div class="justify-center text-center">{back}</div>
        </div>
    {/if}
</div>
