<script lang="ts">
    const { status, message }: { status: number, message?: string } = $props();
</script>


<div
    class="p-4 sm:p-8 md:p-12 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 m-auto flex flex-col justify-center items-center gap-4 sm:gap-8 bg-white"
>
    <h1 class="text-3xl font-bold mb-4">Error {status}</h1>
    <p class="text-red-600">
        {#if message}
            {message}
        {:else}
            An unexpected error occurred.
        {/if}
    </p>
    <a href="/" class="text-blue-500 underline mt-4">Go back to home</a>
</div>