import type { RequestEvent } from '@sveltejs/kit';

/**
 * Returns a fetch implementation suitable for SSR data loads.
 *
 * Under Cloudflare Workers, `event.platform.env.API` is the service binding
 * to the API Worker. We rewrite incoming URLs to a synthetic
 * `https://api.internal/<path>` and dispatch through the binding so the
 * request never leaves the Cloudflare edge.
 *
 * Under adapter-node (Docker path), there is no platform binding, so we
 * fall back to SvelteKit's `event.fetch` which respects the local relative
 * routing rules and existing `PUBLIC_API_URL` configuration.
 */
export function bindingFetch(event: RequestEvent): typeof fetch {
	const api = (event.platform as any)?.env?.API;
	if (!api) return event.fetch;
	return async (input, init) => {
		const url = typeof input === 'string' ? input : (input as Request).url;
		const pathOnly = url.replace(/^https?:\/\/[^/]+/, '');
		return api.fetch(new Request(`https://api.internal${pathOnly}`, init));
	};
}
