<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AppHeader from '$lib/components/organisms/AppHeader.svelte';
	import AppFooter from '$lib/components/organisms/AppFooter.svelte';
	import { APP_NAME } from '$lib/config';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let isHomePage = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{APP_NAME}</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-start p-4 md:p-6 lg:p-8">
	<AppHeader showGenerate={!isHomePage} />

	<main style="view-transition-name: main-content" class="w-full max-w-6xl grow">
		{@render children()}
	</main>

	<AppFooter />
</div>
