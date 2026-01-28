<script lang="ts">
	const tips = [
		{
			title: 'Secure',
			text: 'Public inboxes are visible to anyone. Use with caution for private data.'
		},
		{
			title: 'Expiring',
			text: 'Everything is deleted after 60 minutes. Extended time coming soon.'
		},
		{
			title: 'Anonymous',
			text: "We don't track your IP or browser fingerprints. You are a ghost."
		}
	];
</script>

<div class="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
	{#each tips as tip}
		<div class="bg-zinc-100 p-6 neo-border border-zinc-300">
			<h4 class="font-black uppercase text-xs mb-2">{tip.title}</h4>
			<p class="text-sm font-medium">{tip.text}</p>
		</div>
	{/each}
</div>
