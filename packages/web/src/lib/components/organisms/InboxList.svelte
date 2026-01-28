<script lang="ts">
	import Icon from '@iconify/svelte';
	import EmailRow from '$lib/components/molecules/EmailRow.svelte';
	import type { Email } from '$lib/types';
	import { fetchEmail } from '$lib/api';

	type SortOrder = 'newest' | 'oldest';

	interface Props {
		emails: Email[];
		totalEmails: number;
	}

	let { emails, totalEmails }: Props = $props();

	let expandedId = $state<string | null>(null);
	let loadedEmails = $state<Record<string, Email>>({});
	let sortOrder = $state<SortOrder>('newest');

	let sortedEmails = $derived(
		[...emails].sort((a, b) => {
			const diff = new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
			return sortOrder === 'newest' ? diff : -diff;
		})
	);

	function toggleSort() {
		sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
	}

	async function toggleExpand(email: Email) {
		if (expandedId === email.id) {
			expandedId = null;
			return;
		}

		if (!loadedEmails[email.id] && (!email.html && !email.text)) {
			try {
				const full = await fetchEmail(email.id);
				loadedEmails[email.id] = full;
			} catch {
				// Fall back to the summary data
			}
		}

		expandedId = email.id;
	}

	function getEmail(email: Email): Email {
		return loadedEmails[email.id] ?? email;
	}
</script>

<div class="lg:col-span-8 flex flex-col h-150 lg:h-auto bg-white neo-border neo-shadow overflow-hidden">
	<!-- Toolbar -->
	<div class="p-4 md:p-6 border-b-[3px] border-black flex justify-between items-center bg-zinc-50 sticky top-0 z-20">
		<div class="flex items-center gap-4">
			<h2 class="text-xl font-black uppercase">Inbox</h2>
			{#if totalEmails > 0}
				<span class="bg-black text-white text-xs font-bold px-3 py-1 border-2 border-black">
					{totalEmails} {totalEmails === 1 ? 'EMAIL' : 'EMAILS'}
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			<div class="text-xs font-bold uppercase text-zinc-500 hidden sm:block mr-2">
				{sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
			</div>
			<button
				onclick={toggleSort}
				class="w-10 h-10 flex items-center justify-center border-2 border-black hover:bg-yellow-400 transition-colors {sortOrder === 'oldest' ? 'bg-yellow-400' : 'bg-white'}"
				title="Toggle sort order"
			>
				<Icon icon={sortOrder === 'newest' ? 'lucide:arrow-down-narrow-wide' : 'lucide:arrow-up-narrow-wide'} />
			</button>
		</div>
	</div>

	<!-- Email List -->
	<div class="flex flex-col h-full overflow-y-auto">
		{#each sortedEmails as email (email.id)}
			<EmailRow
				email={getEmail(email)}
				expanded={expandedId === email.id}
				onclick={() => toggleExpand(email)}
			/>
		{/each}

		{#if emails.length === 0}
			<div class="grow flex flex-col items-center justify-center text-center p-8 text-zinc-400 min-h-75">
				<Icon icon="lucide:inbox" class="text-4xl mb-2 opacity-30" />
				<p class="text-sm font-bold uppercase">Waiting for incoming mail...</p>
			</div>
		{/if}
	</div>
</div>
