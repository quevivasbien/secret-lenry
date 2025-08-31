<script lang="ts">
    import lenry0 from "$lib/assets/SecretLenry_pixelated.png";
    import lenry1 from "$lib/assets/SecretLenry_pixelated1.png";
    import lenry2 from "$lib/assets/SecretLenry_pixelated2.png";
    import Button from "$lib/components/Button.svelte";
    import TextInput from "$lib/components/Input.svelte";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();

    const images = [lenry0, lenry1, lenry2];

    const im1prob = 0.11; // probability of changing to E
    const im2prob = 0.05; // probability of changing to CRET
    const flickerInterval = 152; // milliseconds

    let currentImage = $state(images[0]);

    setInterval(() => {
        if (Math.random() < im1prob) {
            currentImage = images[1];
        } else if (Math.random() < im2prob) {
            currentImage = images[2];
        } else {
            currentImage = images[0];
        }
    }, flickerInterval);
</script>

<div
    class="p-4 sm:p-8 md:p-12 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 m-auto flex flex-col justify-center items-center gap-4 sm:gap-8 bg-white"
>
    <img src={currentImage} alt="secret lenry" class="p-2 max-w-1/2" />
    <form
        class="p-4 flex flex-col gap-2 items-center border border-gray-300 bg-gray-100"
        method="POST"
        action="?/joinRoom"
    >
        <TextInput placeholder="Room Name" name="roomName" required />
        <Button type="submit">Join Existing Room</Button>
    </form>
    <form
        class="p-4 flex flex-col gap-2 items-center border border-gray-300 bg-gray-100"
        method="POST"
        action="?/createRoom"
    >
        <TextInput placeholder="Room Name" name="roomName" required />
        <Button type="submit">Create New Room</Button>
    </form>

    {#if form?.success}
        <div class="text-green-500 mt-2">Joining room...</div>
    {/if}
    {#if form?.error}
        <div class="text-red-500 mt-2">{form.error}</div>
    {/if}
</div>
