<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		icon: string;
		label: string;
	}

	let { icon, label }: Props = $props();
</script>

<div class="flex items-center gap-1">
	<Icon {icon} />
	<span>{label}</span>
</div>
