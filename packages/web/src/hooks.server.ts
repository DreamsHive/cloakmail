import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/')) {
		const api = (event.platform as any)?.env?.API;
		if (api) {
			// Forward via service binding. Host is irrelevant — bindings route by name.
			const forwarded = new Request(
				`https://api.internal${event.url.pathname}${event.url.search}`,
				event.request,
			);
			return api.fetch(forwarded);
		}
		// adapter-node fallback (Docker path): let SvelteKit's normal routing
		// miss the request, which 404s. Docker users hit the API at PUBLIC_API_URL
		// directly, so this branch never matters in practice.
	}
	return resolve(event);
};
