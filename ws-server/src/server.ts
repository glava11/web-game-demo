import {WebSocketServer, WebSocket} from 'ws';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const MAX_NICKNAME_LENGTH = 20;
const MIN_NICKNAME_LENGTH = 2;
const MAX_SCORE = 1000;
const MIN_SCORE = 0;
const RATE_LIMIT_WINDOW = 10000;
const MAX_REQUESTS_PER_WINDOW = 10;
let TOTAL_CONNECTIONS = 0;

interface Player {
	id: string;
	nickname: string;
	score: number;
	framework: 'vue' | 'react' | 'angular';
	timestamp: number;
}

interface GameMessage {
	type: 'SCORE_SUBMIT' | 'PING';
	payload?: {
		nickname?: string;
		score?: number;
		framework?: 'vue' | 'react' | 'angular';
	};
}

interface ClientRateLimit {
	requests: number[];
}

// In-memory storage
const leaderboard = new Map<string, Player>();
const clientRateLimits = new Map<WebSocket, ClientRateLimit>();

const wss = new WebSocketServer({port: PORT});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
console.log(`Rate limiting: (${MAX_REQUESTS_PER_WINDOW} req/${RATE_LIMIT_WINDOW}ms)`);

wss.on('connection', (ws: WebSocket) => {
	TOTAL_CONNECTIONS++;
	console.log('New client connected. Total connections: ', TOTAL_CONNECTIONS);

	// Initialize rate limit for this client
	clientRateLimits.set(ws, {requests: []});

	// Send current leaderboard to new connection
	sendLeaderboardUpdate(ws);

	ws.on('message', (data: Buffer) => {
		try {
			// Rate limiting check
			if (!checkRateLimit(ws)) {
				sendError(ws, 'Rate limit exceeded. Please slow down.');
				return;
			}

			const message: GameMessage = JSON.parse(data.toString());
			handleMessage(message, ws);
		} catch (error) {
			console.error('Invalid message:', error);
			sendError(ws, 'Invalid message format');
		}
	});

	ws.on('close', () => {
		TOTAL_CONNECTIONS--;
		console.log('Client disconnected Total connections: ', TOTAL_CONNECTIONS);
		clientRateLimits.delete(ws);
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
		clientRateLimits.delete(ws);
	});
});

function checkRateLimit(ws: WebSocket): boolean {
	const limit = clientRateLimits.get(ws);
	if (!limit) return true;

	const now = Date.now();

	// Remove old requests outside the window
	limit.requests = limit.requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW);

	// Check if limit exceeded
	if (limit.requests.length >= MAX_REQUESTS_PER_WINDOW) {
		console.warn('Rate limit exceeded for client');
		return false;
	}

	// Add current request
	limit.requests.push(now);
	return true;
}

function handleMessage(message: GameMessage, ws: WebSocket) {
	const {type, payload} = message;

	switch (type) {
		case 'SCORE_SUBMIT':
			if (payload) {
				handleScoreSubmit(payload, ws);
			}
			break;

		case 'PING':
			ws.send(JSON.stringify({type: 'PONG'}));
			break;

		default:
			console.warn('Unknown message type:', type);
	}
}

function handleScoreSubmit(payload: {nickname?: string; score?: number; framework?: string}, ws: WebSocket) {
	// Validate nickname
	const nickname = sanitizeNickname(payload.nickname);
	if (!nickname) {
		sendError(ws, 'Invalid nickname');
		return;
	}

	if (nickname.length < MIN_NICKNAME_LENGTH || nickname.length > MAX_NICKNAME_LENGTH) {
		sendError(ws, `Nickname must be between ${MIN_NICKNAME_LENGTH} and ${MAX_NICKNAME_LENGTH} characters`);
		return;
	}

	// Validate score
	const score = payload.score;
	if (typeof score !== 'number' || score < MIN_SCORE || score > MAX_SCORE) {
		sendError(ws, `Invalid score. Must be between ${MIN_SCORE} and ${MAX_SCORE}`);
		return;
	}

	// Validate framework
	const framework = payload.framework;
	if (framework !== 'vue' && framework !== 'react' && framework !== 'angular') {
		sendError(ws, 'Invalid framework');
		return;
	}

	// Update or add player (keep highest score)
	const existingPlayer = leaderboard.get(nickname);

	if (!existingPlayer || score > existingPlayer.score) {
		leaderboard.set(nickname, {
			nickname,
			score,
			framework,
			timestamp: Date.now(),
			id: generateId(),
		});

		console.log(`Score updated: ${nickname} = ${score} (${framework})`);

		// Broadcast updated leaderboard to all clients
		broadcastLeaderboard();
	} else {
		console.log(`Score ${score} not higher than existing ${existingPlayer.score} for ${nickname}`);
	}
}

function sanitizeNickname(nickname: unknown): string | null {
	if (typeof nickname !== 'string') return null;

	// Remove leading/trailing whitespace
	let sanitized = nickname.trim();

	// Remove any non-alphanumeric characters except spaces, dashes, underscores
	sanitized = sanitized.replace(/[^a-zA-Z0-9 _-]/g, '');

	// Collapse multiple spaces into one
	sanitized = sanitized.replace(/\s+/g, ' ');

	return sanitized || null;
}

function sendError(ws: WebSocket, message: string) {
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(
			JSON.stringify({
				type: 'ERROR',
				payload: {message},
			})
		);
	}
}

function sendLeaderboardUpdate(ws: WebSocket) {
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(
			JSON.stringify({
				type: 'LEADERBOARD_UPDATE',
				payload: {
					players: getTopPlayers(20),
				},
			})
		);
	}
}

function broadcastLeaderboard() {
	const message = JSON.stringify({
		type: 'LEADERBOARD_UPDATE',
		payload: {
			players: getTopPlayers(20),
		},
	});

	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	});
}

function getTopPlayers(limit: number = 20): Player[] {
	return Array.from(leaderboard.values())
		.sort((a, b) => b.score - a.score) // Sort by score descending
		.slice(0, limit);
}

function generateId(): string {
	return Math.random().toString(36).substring(2, 11);
}

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
	console.log('Shutting down server...');

	// Close all client connections
	wss.clients.forEach((client) => {
		client.close(1000, 'Server shutting down');
	});

	wss.close(() => {
		console.log('Server closed');
		process.exit(0);
	});

	// Force exit after 5 seconds if graceful shutdown fails
	setTimeout(() => {
		console.error('Forced shutdown');
		process.exit(1);
	}, 5000);
}
