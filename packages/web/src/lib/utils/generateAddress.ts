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

export function generateRandomPrefix(): string {
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	const num = Math.floor(Math.random() * 100);
	return `${adj}.${noun}${num}`;
}
