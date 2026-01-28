<script lang="ts">
	interface Props {
		color: string;
		text: string;
	}

	let { color, text }: Props = $props();
</script>

<li class="flex items-start gap-3">
	<div class="w-5 h-5 {color} border-2 border-black flex-shrink-0 mt-0.5"></div>
	<span>{text}</span>
</li>
