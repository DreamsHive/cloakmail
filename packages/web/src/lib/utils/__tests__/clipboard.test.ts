import { describe, test, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from '../clipboard';

const writeText = vi.fn();

beforeEach(() => {
	writeText.mockReset();
	vi.stubGlobal('navigator', {
		clipboard: { writeText }
	});
});

describe('copyToClipboard', () => {
	test('returns true on successful copy', async () => {
		writeText.mockResolvedValue(undefined);

		const result = await copyToClipboard('test text');
		expect(result).toBe(true);
		expect(writeText).toHaveBeenCalledWith('test text');
	});

	test('returns false when clipboard API throws', async () => {
		writeText.mockRejectedValue(new Error('Clipboard not available'));

		const result = await copyToClipboard('test text');
		expect(result).toBe(false);
	});
});
