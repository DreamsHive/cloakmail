<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'yellow' | 'green' | 'dark' | 'neutral';

	interface Props {
		children: Snippet;
		variant?: Variant;
		class?: string;
	}

	let { children, variant = 'yellow', class: className = '' }: Props = $props();

	const variantClasses: Record<Variant, string> = {
		yellow: 'bg-yellow-400 border-2 border-black',
		green: 'bg-green-400 border-2 border-black',
		dark: 'bg-black text-white border-2 border-black',
		neutral: 'bg-white border border-black'
	};
</script>

<span class="text-xs font-black uppercase tracking-widest px-3 py-1 neo-shadow-sm {variantClasses[variant]} {className}">
	{@render children()}
</span>
