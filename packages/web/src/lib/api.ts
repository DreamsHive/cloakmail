import createClient from 'openapi-fetch';
import type { paths } from '$lib/types/api.d';
import { env } from '$env/dynamic/public';

const BASE_URL = env.PUBLIC_API_URL || 'http://localhost:3000';

export function createApiClient(customFetch?: typeof fetch) {
	return createClient<paths>({
		baseUrl: BASE_URL,
		...(customFetch ? { fetch: customFetch } : {})
	});
}

// Default client for client-side usage
const api = createApiClient();
export default api;

// Re-export types for convenience
export type { Email, InboxResponse, Pagination } from '$lib/types';

// Convenience wrapper functions
export async function fetchInbox(
	address: string,
	page = 1,
	limit = 20,
	f?: typeof fetch
) {
	const client = f ? createApiClient(f) : api;
	const { data, error } = await client.GET('/api/inbox/{address}', {
		params: {
			path: { address },
			query: { page: String(page), limit: String(limit) }
		}
	});
	if (error) throw new Error('Failed to fetch inbox');
	return data;
}

export async function fetchEmail(id: string, f?: typeof fetch) {
	const client = f ? createApiClient(f) : api;
	const { data, error } = await client.GET('/api/email/{id}', {
		params: { path: { id } }
	});
	if (error) throw new Error('Failed to fetch email');
	return data;
}

export async function deleteInbox(address: string, f?: typeof fetch) {
	const client = f ? createApiClient(f) : api;
	const { data, error } = await client.DELETE('/api/inbox/{address}', {
		params: { path: { address } }
	});
	if (error) throw new Error('Failed to delete inbox');
	return data;
}

export async function deleteEmail(id: string, f?: typeof fetch) {
	const client = f ? createApiClient(f) : api;
	const { data, error } = await client.DELETE('/api/email/{id}', {
		params: { path: { id } }
	});
	if (error) throw new Error('Failed to delete email');
	return data;
}
