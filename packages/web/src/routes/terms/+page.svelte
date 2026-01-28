<script lang="ts">
	import { APP_NAME } from '$lib/config';
</script>

<svelte:head>
	<title>Terms of Service - {APP_NAME}</title>
</svelte:head>

<div class="w-full max-w-4xl mx-auto">
	<div class="bg-white neo-border neo-shadow p-8 md:p-12">
		<div class="mb-10 border-b-[3px] border-black pb-6">
			<h1 class="text-3xl md:text-4xl font-black uppercase tracking-tighter">Terms of Service</h1>
			<p class="text-sm font-bold text-zinc-500 uppercase mt-2">Last updated: January 2026</p>
		</div>

		<div class="space-y-8 text-sm font-medium leading-relaxed text-zinc-700">
			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">1. Service Description</h2>
				<p>
					{APP_NAME} provides temporary, disposable email addresses for short-term use. The service is provided "as is" without warranties of any kind. Email addresses and their associated data are automatically deleted after the configured expiration period.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">2. Acceptable Use</h2>
				<p class="mb-3">By using {APP_NAME}, you agree not to:</p>
				<ul class="list-none space-y-2">
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-red-400 border border-black mt-1.5 shrink-0"></span>
						<span>Use the service for illegal activities, harassment, or fraud</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-red-400 border border-black mt-1.5 shrink-0"></span>
						<span>Send spam or unsolicited emails through the service</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-red-400 border border-black mt-1.5 shrink-0"></span>
						<span>Attempt to disrupt or overload the service infrastructure</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="w-2 h-2 bg-red-400 border border-black mt-1.5 shrink-0"></span>
						<span>Use the service to circumvent security measures of other services</span>
					</li>
				</ul>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">3. No Guarantees</h2>
				<p>
					We do not guarantee the delivery of any email. Emails may be delayed, filtered, or lost. Do not rely on {APP_NAME} for critical communications, account recovery, or any use case requiring reliable long-term email access.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">4. Data Expiration</h2>
				<p>
					All data associated with generated email addresses is automatically and permanently deleted after the configured time-to-live period. We are not responsible for any data loss resulting from this automatic expiration. You acknowledge that this is a core feature of the service.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">5. Abuse Policy</h2>
				<p>
					We reserve the right to block or remove any email address or content that violates these terms. Repeated abuse may result in IP-level restrictions. We may cooperate with law enforcement if required by applicable law.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">6. Limitation of Liability</h2>
				<p>
					{APP_NAME} and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the service. Use the service at your own risk.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-black uppercase mb-3 text-black">7. Changes to Terms</h2>
				<p>
					We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.
				</p>
			</section>
		</div>
	</div>
</div>
