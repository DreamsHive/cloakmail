const adapterName = process.env.ADAPTER || 'node';
const adapterModule = adapterName === 'cloudflare'
	? await import('@sveltejs/adapter-cloudflare')
	: await import('@sveltejs/adapter-node');
const adapter = adapterModule.default;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
