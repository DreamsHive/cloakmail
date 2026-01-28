<script lang="ts">
	import Icon from '@iconify/svelte';
	import { copyToClipboard } from '$lib/utils/clipboard';

	interface Props {
		text: string;
		variant?: 'yellow' | 'dark';
		class?: string;
	}

	let { text, variant = 'yellow', class: className = '' }: Props = $props();

	let copied = $state(false);

	async function handleCopy() {
		const success = await copyToClipboard(text);
		if (success) {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	const baseClasses = $derived(
		variant === 'dark'
			? copied
				? 'bg-green-500 text-black'
				: 'bg-black text-yellow-400 hover:bg-zinc-800'
			: copied
				? 'bg-green-500 text-white hover:bg-green-400'
				: 'bg-yellow-400 text-black hover:bg-yellow-300'
	);
</script>

<button
	onclick={handleCopy}
	class="neo-border neo-shadow neo-button font-bold flex items-center justify-center gap-2 {baseClasses} {className}"
>
	{#if copied}
		<Icon icon="lucide:check" class="text-xl" />
		<span class="uppercase tracking-wider">Copied!</span>
	{:else}
		<Icon icon="lucide:copy" class="text-xl" />
		<span class="uppercase tracking-wider">Copy Address</span>
	{/if}
</button>
