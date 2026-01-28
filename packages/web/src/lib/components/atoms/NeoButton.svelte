<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'danger' | 'dark';

	interface ButtonProps {
		children: Snippet;
		variant?: Variant;
		href?: string;
		class?: string;
		[key: string]: unknown;
	}

	let { children, variant = 'primary', href, class: className = '', ...rest }: ButtonProps = $props();

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-yellow-400 hover:bg-yellow-300 text-black',
		secondary: 'bg-white hover:bg-zinc-100 text-black',
		danger: 'bg-white hover:bg-red-500 hover:text-white text-black',
		dark: 'bg-black text-yellow-400 hover:bg-zinc-800'
	};

	const baseClasses = `neo-border neo-shadow-sm neo-button font-bold ${variantClasses[variant]} ${className}`;
</script>

{#if href}
	<a {href} class={baseClasses} {...rest}>
		{@render children()}
	</a>
{:else}
	<button class={baseClasses} {...rest}>
		{@render children()}
	</button>
{/if}
