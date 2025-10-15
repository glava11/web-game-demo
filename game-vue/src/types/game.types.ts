// Message types for WebSocket communication
export type MessageType = 'SCORE_SUBMIT' | 'LEADERBOARD_UPDATE' | 'PING' | 'PONG';

export type Framework = 'vue' | 'react' | 'angular';

// avoiding enum to respect erasableSyntaxOnly
// "as const" Type Assertion => creates a readonly object with literal types
// keyof typeof ScoreRating => use the keys as types
export const ScoreRating = {
	PERFECT: 'PERFECT',
	EXCELLENT: 'Excellent',
	GREAT: 'Great',
	GOOD: 'Good',
	NOT_BAD: 'Not bad',
	TRY_AGAIN: 'Try again',
} as const;

export type ScoreRatingType = keyof typeof ScoreRating;

// Player data structure
export interface Player {
	id: string;
	nickname: string;
	score: number;
	framework: Framework;
	timestamp: number;
}

// WebSocket message structure
export interface GameMessage {
	type: MessageType;
	payload?: {
		nickname?: string;
		score?: number;
		framework?: Framework;
		players?: Player[];
	};
}

// Score submission payload
export interface ScoreSubmission {
	nickname: string;
	score: number;
	framework: Framework;
}
