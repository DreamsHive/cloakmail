<script lang="ts">
	import { APP_NAME } from '$lib/config';
</script>

<svelte:head>
	<title>Privacy Policy - {APP_NAME}</title>
</svelte:head>

<div class="w-full max-w-4xl mx-auto">
	<div class="bg-white neo-border neo-shadow p-8 md:p-12">
		<div class="mb-10 border-b-[3px] border-black pb-6">
			<h1 class="text-3xl md:text-4xl font-black uppercase tracking-tighter">Privacy Policy</h1>
			<p class="text-sm font-bold text-zinc-500 uppercase mt-2">Last updated: January 2026</p>
		</div>

		<div class="space-y-8 text-sm font-medium leading-relaxed text-zinc-700">
			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">1. Overview</h2>
				<p>
					{APP_NAME} is a disposable email service designed with privacy at its core. We collect the absolute minimum data required to operate the service and automatically delete all information after a defined retention period.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">2. Data We Collect</h2>
				<p class="mb-3">When you use {APP_NAME}, the following data is temporarily stored:</p>
				<ul class="list-none space-y-2">
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-yellow-400 border border-black mt-1.5 shrink-0"></span>
						<span><strong class="text-black">Email content</strong> — Incoming emails (sender, subject, body, headers) sent to your generated address.</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-yellow-400 border border-black mt-1.5 shrink-0"></span>
						<span><strong class="text-black">Generated addresses</strong> — The temporary email addresses you create.</span>
					</li>
				</ul>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">3. Data We Do Not Collect</h2>
				<ul class="list-none space-y-2">
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-green-400 border border-black mt-1.5 shrink-0"></span>
						<span>No personal identification information (name, real email, phone number)</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-green-400 border border-black mt-1.5 shrink-0"></span>
						<span>No IP address logging</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-green-400 border border-black mt-1.5 shrink-0"></span>
						<span>No analytics or tracking cookies</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-green-400 border border-black mt-1.5 shrink-0"></span>
						<span>No third-party tracking scripts</span>
					</li>
				</ul>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">4. Data Retention</h2>
				<p>
					All email data is automatically and permanently deleted after the configured time-to-live (TTL) period. Once expired, data cannot be recovered. There are no backups or archives of expired data.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">5. Third Parties</h2>
				<p>
					We do not sell, share, or transfer any data to third parties. Email content is stored exclusively in our infrastructure and is never accessed for advertising, profiling, or any purpose other than displaying it to you.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">6. Cookies</h2>
				<p>
					{APP_NAME} does not use cookies. No session cookies, no tracking cookies, no third-party cookies.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">7. Changes to This Policy</h2>
				<p>
					We may update this policy from time to time. Changes will be reflected on this page with an updated revision date.
				</p>
			</section>
		</div>
	</div>
</div>
