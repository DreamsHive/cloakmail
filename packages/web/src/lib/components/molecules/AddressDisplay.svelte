<script lang="ts">
	import Icon from '@iconify/svelte';
	import { copyToClipboard } from '$lib/utils/clipboard';

	interface Props {
		address: string;
		class?: string;
	}

	let { address, class: className = '' }: Props = $props();

	let copied = $state(false);

	async function handleCopy() {
		const success = await copyToClipboard(address);
		if (success) {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}
</script>

<div class="w-full bg-zinc-100 neo-border p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-white transition-colors {className}">
	<div class="text-left">
		<span class="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Disposable Email</span>
		<span class="text-2xl md:text-4xl font-black break-all">{address}</span>
	</div>
	<button
		onclick={handleCopy}
		class="shrink-0 flex items-center gap-2 px-8 py-4 font-black uppercase tracking-wider neo-button neo-shadow-sm {copied ? 'bg-green-500 text-black' : 'bg-black text-yellow-400 hover:bg-zinc-800'}"
	>
		{#if copied}
			<Icon icon="lucide:check" class="text-2xl" />
			<span>Copied!</span>
		{:else}
			<Icon icon="lucide:copy" class="text-2xl" />
			<span>Copy</span>
		{/if}
	</button>
</div>
