import { ScoreRating } from "@quicky-finger/shared";

/**
 * Calculate score based on how close position is to target
 * @param position - Current slider position (0-100)
 * @param target - Target position (default 50 = center)
 * @returns Score from 0 to 1000
 */
export function calculateScore(position: number, target: number = 50): number {
  if (position < 0 || position > 100) return 0;
  if (target < 0 || target > 100) return 0;

  const distance = Math.abs(position - target);
  const maxScore = 1000;
  const penaltyPerPercent = 20;
  const score = maxScore - Math.round(distance * penaltyPerPercent);

  return Math.max(0, score);
}

/**
 * Get rating message based on score
 */
export function getScoreRating(
  score: number,
): (typeof ScoreRating)[keyof typeof ScoreRating] {
  if (score >= 995) return ScoreRating.PERFECT;
  if (score >= 950) return ScoreRating.EXCELLENT;
  if (score >= 850) return ScoreRating.GREAT;
  if (score >= 700) return ScoreRating.GOOD;
  if (score >= 500) return ScoreRating.NOT_BAD;
  return ScoreRating.TRY_AGAIN;
}
