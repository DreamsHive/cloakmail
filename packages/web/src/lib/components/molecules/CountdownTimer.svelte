<script lang="ts">
	interface Props {
		totalSeconds?: number;
		class?: string;
	}

	let props: Props = $props();

	let total = $derived(props.totalSeconds ?? 3600);
	let className = $derived(props.class ?? '');
	let remaining = $state(props.totalSeconds ?? 3600);

	$effect(() => {
		const interval = setInterval(() => {
			remaining = Math.max(0, remaining - 1);
			if (remaining <= 0) clearInterval(interval);
		}, 1000);
		return () => clearInterval(interval);
	});

	let minutes = $derived(Math.floor(remaining / 60).toString().padStart(2, '0'));
	let seconds = $derived((remaining % 60).toString().padStart(2, '0'));
	let progress = $derived((remaining / total) * 100);
</script>

<div class="bg-white neo-border neo-shadow p-6 flex flex-col gap-4 {className}">
	<div class="border-b-2 border-black pb-2">
		<p class="text-xs font-bold uppercase text-zinc-500 mb-1">Self-Destruct In</p>
		<div class="text-3xl font-black font-mono tracking-tighter">{minutes}:{seconds}</div>
	</div>
	<div class="h-4 w-full border-2 border-black p-[2px]">
		<div class="h-full bg-yellow-400 transition-all duration-1000" style="width: {progress}%"></div>
	</div>
</div>
