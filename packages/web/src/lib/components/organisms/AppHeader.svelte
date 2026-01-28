<script lang="ts">
	import Icon from '@iconify/svelte';
	import { APP_NAME } from '$lib/config';

	interface Props {
		showGenerate?: boolean;
	}

	let { showGenerate = true }: Props = $props();
</script>

<header style="view-transition-name: main-nav" class="w-full max-w-6xl flex justify-between items-center mb-10">
	<a href="/" class="flex items-center gap-4 group cursor-pointer">
		<img src="https://res.cloudinary.com/deo6w3xib/image/upload/q_100/v1769594451/cloakmail_sq5pfe.webp" alt="{APP_NAME} Logo" class="w-12 h-12" width="48" height="48">
		<span class="font-black text-2xl tracking-tighter uppercase">{APP_NAME}</span>
	</a>
	<div class="flex items-center gap-4">
		{#if showGenerate}
			<a
				href="/"
				class="hidden sm:flex items-center gap-2 px-6 py-3 bg-white neo-border neo-shadow-sm text-sm font-bold hover:bg-yellow-400 transition-colors neo-button text-black"
			>
				<Icon icon="lucide:plus-circle" class="text-xl" />
				<span>Generate</span>
			</a>
		{/if}
		<a
			href="https://github.com/DreamsHive/cloakmail"
			target="_blank"
			rel="dofollow"
			class="flex items-center gap-2 px-6 py-3 bg-white neo-border neo-shadow-sm text-sm font-bold hover:bg-yellow-400 transition-colors neo-button text-black"
		>
			<Icon icon="lucide:github" class="text-xl" />
			<span>GitHub</span>
		</a>
	</div>
</header>
