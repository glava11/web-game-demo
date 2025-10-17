import {describe, it, expect} from 'vitest';
import {calculateScore, getScoreRating} from './scoring';

describe('calculateScore', () => {
	it('awards 1000 points for perfect center', () => {
		expect(calculateScore(50, 50)).toBe(1000);
	});

	it('deducts 20 points per percent away from center', () => {
		expect(calculateScore(49, 50)).toBe(980); // 1% away
		expect(calculateScore(48, 50)).toBe(960); // 2% away
		expect(calculateScore(45, 50)).toBe(900); // 5% away
		expect(calculateScore(40, 50)).toBe(800); // 10% away
	});

	it('works for positions above center', () => {
		expect(calculateScore(51, 50)).toBe(980); // 1% above
		expect(calculateScore(55, 50)).toBe(900); // 5% above
		expect(calculateScore(60, 50)).toBe(800); // 10% above
	});

	it('returns 0 for positions at extremes', () => {
		expect(calculateScore(0, 50)).toBe(0); // 50% away = -1000 points
		expect(calculateScore(100, 50)).toBe(0); // 50% away = -1000 points
	});

	it('handles edge cases gracefully', () => {
		expect(calculateScore(-5, 50)).toBe(0); // Invalid negative
		expect(calculateScore(150, 50)).toBe(0); // Invalid > 100
		expect(calculateScore(50, -10)).toBe(0); // Invalid target
		expect(calculateScore(50, 110)).toBe(0); // Invalid target
	});

	it('works with different target positions', () => {
		expect(calculateScore(25, 25)).toBe(1000); // Perfect at 25%
		expect(calculateScore(75, 75)).toBe(1000); // Perfect at 75%
		expect(calculateScore(30, 25)).toBe(900); // 5% away from 25%
	});

	it('rounds down to nearest integer', () => {
		expect(calculateScore(48.7, 50)).toBe(974); // 1.3% away = -26 points
		expect(calculateScore(51.2, 50)).toBe(976); // 1.2% away = -24 points
	});
});

describe('getScoreRating', () => {
	it('returns correct rating for perfect score', () => {
		expect(getScoreRating(1000)).toBe('PERFECT');
	});

	it('returns correct rating for excellent score', () => {
		expect(getScoreRating(990)).toBe('Excellent');
		expect(getScoreRating(950)).toBe('Excellent');
	});

	it('returns correct rating for great score', () => {
		expect(getScoreRating(900)).toBe('Great');
		expect(getScoreRating(850)).toBe('Great');
	});

	it('returns correct rating for good score', () => {
		expect(getScoreRating(800)).toBe('Good');
		expect(getScoreRating(700)).toBe('Good');
	});

	it('returns correct rating for okay score', () => {
		expect(getScoreRating(600)).toBe('Not bad');
		expect(getScoreRating(500)).toBe('Not bad');
	});

	it('returns correct rating for low score', () => {
		expect(getScoreRating(400)).toBe('Try again');
		expect(getScoreRating(100)).toBe('Try again');
		expect(getScoreRating(0)).toBe('Try again');
	});

	it('handles boundary scores correctly', () => {
		expect(getScoreRating(949)).toBe('Great'); // Just below excellent
		expect(getScoreRating(950)).toBe('Excellent'); // At excellent threshold
		expect(getScoreRating(999)).toBe('PERFECT'); // Just below perfect
	});
});
