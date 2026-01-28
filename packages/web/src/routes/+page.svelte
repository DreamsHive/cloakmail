<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import SidebarInfo from '$lib/components/organisms/SidebarInfo.svelte';
	import { generateRandomPrefix } from '$lib/utils/generateAddress';
	import { APP_NAME, EMAIL_DOMAIN } from '$lib/config';

	let prefix = $state(generateRandomPrefix());

	function regenerate() {
		prefix = generateRandomPrefix();
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = prefix.trim();
		if (!trimmed) return;
		const address = `${trimmed}@${EMAIL_DOMAIN}`;
		goto(`/confirm/${encodeURIComponent(address)}`);
	}
</script>

<svelte:head>
	<title>Generate Address - {APP_NAME}</title>
</svelte:head>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
	<SidebarInfo />

	<!-- Address Generator Form -->
	<div class="lg:col-span-8 bg-white neo-border neo-shadow flex flex-col grow">
		<div class="p-4 md:p-6 border-b-[3px] border-black flex justify-between items-center bg-zinc-50">
			<h2 class="text-xl font-black uppercase">Address Generator</h2>
			<div class="bg-yellow-400 border-2 border-black px-3 py-1 text-xs font-black uppercase">Step 01/02</div>
		</div>

		<div class="grow p-6 md:p-12 lg:p-16 flex flex-col justify-center items-center">
			<form onsubmit={handleSubmit} class="w-full max-w-xl space-y-8">
				<!-- Prefix Input -->
				<div>
					<label for="prefix-input" class="block text-xs font-black uppercase tracking-widest mb-3">
						Choose your prefix
					</label>
					<div class="flex gap-4">
						<div class="grow flex border-[3px] border-black bg-white neo-shadow-sm">
							<input
								id="prefix-input"
								type="text"
								bind:value={prefix}
								class="w-full p-4 font-bold text-xl outline-none bg-transparent placeholder:text-zinc-300"
								placeholder="e.g. shadow.walker"
							/>
							<div class="flex items-center px-4 bg-zinc-100 border-l-[3px] border-black font-black text-zinc-500">
								@{EMAIL_DOMAIN}
							</div>
						</div>
						<button
							type="button"
							onclick={regenerate}
							class="aspect-square w-16 flex items-center justify-center bg-white border-[3px] border-black neo-shadow-sm neo-button hover:bg-yellow-400 transition-colors group"
						>
							<Icon icon="lucide:refresh-cw" class="text-2xl group-active:rotate-180 transition-transform duration-300" />
						</button>
					</div>
				</div>

				<!-- Submit -->
				<div class="pt-8">
					<button
						type="submit"
						class="w-full flex items-center justify-center gap-3 bg-yellow-400 border-[3px] border-black p-6 neo-shadow neo-button text-2xl font-black uppercase tracking-tighter hover:bg-yellow-300 transition-colors"
					>
						<span>Initialize Inbox</span>
						<Icon icon="lucide:zap" class="text-3xl" />
					</button>
					<p class="text-center mt-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
						By clicking initialize, you agree to our fair usage policy.
					</p>
				</div>
			</form>
		</div>
	</div>
</div>
