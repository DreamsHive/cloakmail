<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		icon: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { icon, size = 'md', class: className = '' }: Props = $props();

	const sizeClasses: Record<string, string> = {
		sm: 'w-10 h-10 text-xl',
		md: 'w-12 h-12 text-3xl',
		lg: 'w-24 h-24 text-6xl'
	};
</script>

<div class="bg-black text-yellow-400 flex items-center justify-center neo-border neo-shadow-sm {sizeClasses[size]} {className}">
	<Icon {icon} />
</div>
