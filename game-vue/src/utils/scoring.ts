/**
 * Calculate score based on how close position is to target
 * @param position - Current slider position (0-100)
 * @param target - Target position (default 50 = center)
 * @returns Score from 0 to 1000
 */
export function calculateScore(position: number, target: number = 50): number {
	// Validate inputs
	if (position < 0 || position > 100) return 0;
	if (target < 0 || target > 100) return 0;

	// Calculate distance from target (percentage)
	const distance = Math.abs(position - target);

	// Perfect center = 1000 points
	// Each 1% away = -20 points
	const maxScore = 1000;
	const penaltyPerPercent = 20;

	const score = maxScore - Math.floor(distance * penaltyPerPercent);

	// Ensure minimum 0
	return Math.max(0, score);
}

/**
 * Get rating message based on score
 */
export function getScoreRating(score: number): string {
	if (score === 1000) return 'PERFECT!';
	if (score >= 950) return 'Excellent!';
	if (score >= 850) return 'Great!';
	if (score >= 700) return 'Good!';
	if (score >= 500) return 'Not bad!';
	return 'Try again!';
}
