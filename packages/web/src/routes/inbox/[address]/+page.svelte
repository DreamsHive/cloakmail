<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { deleteInbox } from '$lib/api';
	import IdentityCard from '$lib/components/organisms/IdentityCard.svelte';
	import InboxList from '$lib/components/organisms/InboxList.svelte';
	import CountdownTimer from '$lib/components/molecules/CountdownTimer.svelte';
	import SafetyNotice from '$lib/components/molecules/SafetyNotice.svelte';
	import { APP_NAME } from '$lib/config';

	let { data } = $props();

	async function handleDeleteAll() {
		if (!confirm(`Delete all emails for ${data.address}?`)) return;
		await deleteInbox(data.address);
		await invalidateAll();
	}

	function handleRefresh() {
		invalidateAll();
	}
</script>

<svelte:head>
	<title>{data.address} - {APP_NAME}</title>
</svelte:head>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
	<!-- Left Sidebar -->
	<div class="lg:col-span-4 flex flex-col gap-8">
		<IdentityCard
			address={data.address}
			onrefresh={handleRefresh}
			ondelete={handleDeleteAll}
		/>
		<CountdownTimer />
		<SafetyNotice />
	</div>

	<!-- Right: Inbox -->
	<InboxList
		emails={data.emails}
		totalEmails={data.pagination.totalEmails}
	/>
</div>
