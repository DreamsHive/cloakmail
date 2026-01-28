import type { operations } from './api.d';

/** A single stored email from the API */
export type Email =
	operations['getApiEmailById']['responses']['200']['content']['application/json'];

/** Full inbox response including emails array and pagination */
export type InboxResponse =
	operations['getApiInboxByAddress']['responses']['200']['content']['application/json'];

/** Pagination metadata from an inbox response */
export type Pagination = InboxResponse['pagination'];

/** Response from deleting an inbox */
export type DeleteInboxResponse =
	operations['deleteApiInboxByAddress']['responses']['200']['content']['application/json'];

/** Response from deleting a single email */
export type DeleteEmailResponse =
	operations['deleteApiEmailById']['responses']['200']['content']['application/json'];

/** Health check response */
export type HealthResponse =
	operations['getApiHealth']['responses']['200']['content']['application/json'];
