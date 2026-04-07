import { fetchInbox } from '$lib/api';
import { bindingFetch } from '$lib/api-binding';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { params, url } = event;
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 20;
	const data = await fetchInbox(params.address, page, limit, bindingFetch(event));
	return {
		address: params.address,
		...data,
	};
};
