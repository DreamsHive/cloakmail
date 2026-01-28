<script lang="ts">
	import Icon from '@iconify/svelte';
	import ProtocolRule from '$lib/components/molecules/ProtocolRule.svelte';
	import SafetyNotice from '$lib/components/molecules/SafetyNotice.svelte';
	import { APP_NAME } from '$lib/config';
</script>

<div class="lg:col-span-4 flex flex-col gap-8">
	<!-- New Identity Card -->
	<div class="bg-black text-white neo-border neo-shadow p-6 md:p-8">
		<h2 class="text-xl font-black uppercase mb-4 text-yellow-400">New Identity</h2>
		<p class="text-sm font-medium leading-relaxed opacity-80">
			Generate a fresh, anonymous email address in seconds. Use it to dodge spam, sign up for one-off trials, or protect your primary inbox from data breaches.
		</p>
	</div>

	<!-- Protocol Rules -->
	<div class="bg-white neo-border neo-shadow p-6">
		<h3 class="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
			<Icon icon="lucide:info" class="text-lg" />
			Protocol Rules
		</h3>
		<ul class="flex flex-col gap-4 text-sm font-bold">
			<ProtocolRule color="bg-yellow-400" text="Addresses expire after 60 minutes of inactivity." />
			<ProtocolRule color="bg-green-400" text="Unlimited incoming emails while active." />
			<ProtocolRule color="bg-indigo-500" text="Custom prefixes allowed for personalization." />
		</ul>
	</div>

	<SafetyNotice
		title="Safety Notice:"
		message="{APP_NAME} is for temporary use only. Do not use for sensitive account recovery or long-term storage."
	/>
</div>
