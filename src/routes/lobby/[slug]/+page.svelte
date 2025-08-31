<script lang="ts">
    const { data } = $props();
    const { lobbyName, lobby } = data;
</script>

<div
    class="p-4 sm:p-8 md:p-12 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 m-auto flex flex-col justify-center items-center gap-4 sm:gap-8 bg-white"
>
    <h1 class="text-3xl font-bold mb-4">Lobby: {lobbyName}</h1>
    {#if lobby}
        <p>Lobby ID: {lobby.id}</p>
        <p>Created At: {new Date(lobby.created_at).toLocaleString()}</p>
        <a href="/" class="text-blue-500 underline mt-4">Exit lobby</a>
    {:else}
        <p>Lobby not found.</p>
        <a href="/" class="text-blue-500 underline mt-4">Go back to home</a>
    {/if}
</div>
