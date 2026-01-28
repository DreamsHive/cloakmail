<script lang="ts">
	import Icon from '@iconify/svelte';
	import AddressDisplay from '$lib/components/molecules/AddressDisplay.svelte';
	import TrustIndicator from '$lib/components/molecules/TrustIndicator.svelte';
	import QuickTips from '$lib/components/organisms/QuickTips.svelte';
	import { APP_NAME } from '$lib/config';

	let { data } = $props();
</script>

<svelte:head>
	<title>Address Ready - {APP_NAME}</title>
</svelte:head>

<div class="w-full flex flex-col items-center justify-center">
	<div class="w-full max-w-3xl bg-white neo-border neo-shadow p-8 md:p-12 relative">
		<!-- Success Badge -->
		<div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-400 border-4 border-black px-6 py-2 neo-shadow-sm">
			<span class="font-black text-xl uppercase tracking-widest">Generated Successfully</span>
		</div>

		<div class="flex flex-col items-center text-center mt-4">
			<div class="w-24 h-24 bg-yellow-400 neo-border neo-shadow-sm flex items-center justify-center mb-8">
				<Icon icon="lucide:check-circle-2" class="text-6xl text-black" />
			</div>

			<h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
				Your Identity is Ready
			</h1>

			<p class="text-zinc-500 font-bold uppercase text-sm mb-8 max-w-md leading-relaxed">
				This address is active and ready to receive mail. It will automatically self-destruct in 60 minutes.
			</p>

			<AddressDisplay address={data.address} class="mb-10" />

			<!-- Navigation Actions -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
				<a
					href="/inbox/{encodeURIComponent(data.address)}"
					class="flex items-center justify-center gap-3 py-5 bg-yellow-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:bg-yellow-300 neo-button"
				>
					<Icon icon="lucide:inbox" class="text-2xl" />
					<span>Open Inbox</span>
				</a>
				<a
					href="/"
					class="flex items-center justify-center gap-3 py-5 bg-white text-black font-black uppercase tracking-widest neo-border neo-shadow hover:bg-zinc-50 neo-button"
				>
					<Icon icon="lucide:refresh-ccw" class="text-2xl" />
					<span>Generate New</span>
				</a>
			</div>

			<!-- Trust Indicators -->
			<div class="mt-12 flex items-center gap-4 text-xs font-black uppercase text-zinc-400">
				<TrustIndicator icon="lucide:shield-check" label="End-to-End Encrypted" />
				<div class="w-1.5 h-1.5 bg-zinc-300"></div>
				<TrustIndicator icon="lucide:clock" label="Zero Logs Policy" />
			</div>
		</div>
	</div>

	<QuickTips />
</div>
