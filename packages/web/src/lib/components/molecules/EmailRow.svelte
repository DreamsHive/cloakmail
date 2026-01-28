<script lang="ts">
	import EmailAvatar from '$lib/components/atoms/EmailAvatar.svelte';
	import type { Email } from '$lib/types';

	interface Props {
		email: Email;
		expanded?: boolean;
		onclick?: () => void;
	}

	let { email, expanded = false, onclick }: Props = $props();

	function formatTimeAgo(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'JUST NOW';
		if (mins < 60) return `${mins} MIN AGO`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs} HR AGO`;
		return `${Math.floor(hrs / 24)} DAY AGO`;
	}

	function getSenderName(from: string): string {
		const match = from.match(/^([^<@]+)/);
		return match ? match[1].trim() : from.split('@')[0];
	}
</script>

<div class="flex flex-col border-b-[3px] border-black {expanded ? 'bg-zinc-50' : ''}">
	<button
		{onclick}
		class="p-5 flex gap-4 cursor-pointer hover:bg-yellow-100 transition-colors group text-left w-full"
	>
		<div class="mt-1">
			<EmailAvatar name={getSenderName(email.from)} />
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex justify-between items-start mb-1">
				<h3 class="font-bold text-lg text-black truncate">{getSenderName(email.from)}</h3>
				<span class="text-xs font-mono font-bold border border-black px-1 bg-white shrink-0 ml-2">
					{formatTimeAgo(email.receivedAt)}
				</span>
			</div>
			<p class="text-sm font-bold truncate text-black">{email.subject}</p>
			{#if email.text}
				<p class="text-sm text-zinc-600 truncate">{email.text.slice(0, 100)}</p>
			{/if}
		</div>
	</button>

	{#if expanded}
		<div class="p-6 md:p-8 border-t-[3px] border-black bg-white">
			<div class="bg-zinc-50 border-2 border-black p-6 md:p-8 neo-shadow-sm">
				<div class="mb-8">
					<h1 class="text-2xl font-black mb-2 uppercase text-black">{email.subject}</h1>
					<p class="text-sm font-mono border-b border-black inline-block pb-1 text-black">
						From: <span class="font-bold">{email.from}</span>
					</p>
				</div>
				{#if email.html}
					<div class="w-full">
						<iframe
							srcdoc={email.html}
							sandbox="allow-same-origin"
							class="w-full min-h-[300px] border-2 border-black bg-white"
							title="Email content"
						></iframe>
					</div>
				{:else if email.text}
					<div class="prose prose-sm max-w-none text-black font-medium whitespace-pre-wrap">
						{email.text}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
