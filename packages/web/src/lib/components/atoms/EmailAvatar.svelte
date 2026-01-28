<script lang="ts">
	interface Props {
		name: string;
		class?: string;
	}

	let { name, class: className = '' }: Props = $props();

	const colors = [
		'bg-indigo-600', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500',
		'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500'
	];

	const initial = $derived(name.charAt(0).toUpperCase());
	const colorIndex = $derived(
		name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
	);
	const bgColor = $derived(colors[colorIndex]);
</script>

<div class="w-12 h-12 {bgColor} text-white border-2 border-black flex items-center justify-center font-black text-xl shrink-0 {className}">
	{initial}
</div>
