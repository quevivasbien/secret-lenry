<script lang="ts">
    import { Turnstile } from "svelte-turnstile";
    import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
    import type { PageProps } from "./$types";
    import { goto } from "$app/navigation";

    let turnstileForm: HTMLFormElement | null = $state(null);
    function oncallback(
        event: CustomEvent<{ token: string; preClearanceObtained: boolean }>,
    ) {
        if (!turnstileForm) {
            throw new Error(
                "Tried to submit Turnstile form but form element is undefined!",
            );
        }
        turnstileForm.submit();
    }

    let { form }: PageProps = $props();
</script>

{#if form}
    {#if form.error}
        <div class="text-red-500 mt-2">{form.error}</div>
    {:else if form.success}
        <!-- should only be displayed intermittently -->
        <div class="text-green-500 mt-2">Authentication successful!</div>
    {/if}
{:else}
    <form bind:this={turnstileForm} method="POST">
        <Turnstile
            siteKey={PUBLIC_TURNSTILE_SITE_KEY}
            on:callback={oncallback}
        />
    </form>
{/if}
