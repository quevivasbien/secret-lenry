<button
    {...$$restProps}
    class="bg-blue-500 text-white font-bold m-2 py-2 px-4 rounded cursor-pointer hover:bg-blue-700 active:scale-95 transition-transform {$$props.class ||
        ''}"
>
    <slot />
</button>
