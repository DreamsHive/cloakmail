<script lang="ts">
	interface Props {
		title?: string;
		message?: string;
		class?: string;
	}

	let {
		title = 'Warning:',
		message = 'This inbox is public. Don\'t use for banking. Emails are incinerated after 1 hour.',
		class: className = ''
	}: Props = $props();
</script>

<div class="hidden lg:block p-6 bg-zinc-100 neo-border text-sm font-medium text-black leading-relaxed {className}">
	<p class="font-bold mb-2 uppercase text-red-600">{title}</p>
	<p>{message}</p>
</div>
