import { describe, test, expect } from 'vitest';
import { generateRandomPrefix } from '../generateAddress';

describe('generateRandomPrefix', () => {
	test('returns a string', () => {
		const result = generateRandomPrefix();
		expect(typeof result).toBe('string');
	});

	test('matches adjective.nounNN format', () => {
		const result = generateRandomPrefix();
		expect(result).toMatch(/^[a-z]+\.[a-z]+\d{1,2}$/);
	});

	test('number suffix is between 0 and 99', () => {
		for (let i = 0; i < 50; i++) {
			const result = generateRandomPrefix();
			const num = parseInt(result.match(/\d+$/)![0], 10);
			expect(num).toBeGreaterThanOrEqual(0);
			expect(num).toBeLessThan(100);
		}
	});

	test('generates varying output', () => {
		const results = new Set<string>();
		for (let i = 0; i < 20; i++) {
			results.add(generateRandomPrefix());
		}
		// With 18 adjectives * 18 nouns * 100 numbers = 32400 combos,
		// 20 calls should produce at least 2 unique values
		expect(results.size).toBeGreaterThan(1);
	});

	test('uses valid adjective and noun from word lists', () => {
		const adjectives = [
			'fast', 'swift', 'vibrant', 'silent', 'shadow', 'cosmic',
			'bold', 'dark', 'bright', 'clever', 'lucky', 'noble',
			'wild', 'calm', 'steel', 'iron', 'neon', 'crimson'
		];
		const nouns = [
			'tiger', 'falcon', 'wolf', 'hawk', 'phantom', 'viper',
			'raven', 'storm', 'blaze', 'frost', 'cipher', 'ghost',
			'knight', 'spark', 'ember', 'orbit', 'pulse', 'nexus'
		];

		for (let i = 0; i < 30; i++) {
			const result = generateRandomPrefix();
			const [adj, rest] = result.split('.');
			const noun = rest.replace(/\d+$/, '');
			expect(adjectives).toContain(adj);
			expect(nouns).toContain(noun);
		}
	});
});
