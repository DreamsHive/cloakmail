import { describe, test, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from '../clipboard';

describe('copyToClipboard', () => {
	beforeEach(() => {
		// Reset navigator.clipboard mock
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn()
			}
		});
	});

	test('returns true on successful copy', async () => {
		vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

		const result = await copyToClipboard('test text');
		expect(result).toBe(true);
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
	});

	test('returns false when clipboard API throws', async () => {
		vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
			new Error('Clipboard not available')
		);

		const result = await copyToClipboard('test text');
		expect(result).toBe(false);
	});
});
