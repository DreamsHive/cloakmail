import { fetchInbox } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 20;
	const data = await fetchInbox(params.address, page, limit, fetch);
	return {
		address: params.address,
		...data,
	};
};
