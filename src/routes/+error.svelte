<script lang="ts">
    import { page } from "$app/state";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
</script>

<ErrorMessage status={page.status} message={page.error?.message} />
