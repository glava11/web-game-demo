import {WebSocketServer} from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({port: PORT});

// In-memory leaderboard (Map: nickname -> player data)
const leaderboard = new Map();

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
	console.log('👤 New client connected');

	// Send current leaderboard to new connection
	ws.send(
		JSON.stringify({
			type: 'LEADERBOARD_UPDATE',
			payload: {
				players: getTopPlayers(20),
			},
		})
	);

	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data.toString());
			handleMessage(message, ws);
		} catch (error) {
			console.error('Invalid message:', error);
		}
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
});

function handleMessage(message, ws) {
	const {type, payload} = message;

	switch (type) {
		case 'SCORE_SUBMIT':
			handleScoreSubmit(payload);
			break;

		case 'PING':
			ws.send(JSON.stringify({type: 'PONG'}));
			break;

		default:
			console.warn('Unknown message type:', type);
	}
}

function handleScoreSubmit(payload) {
	const {nickname, score, framework = 'vue'} = payload;

	// Validate input
	if (!nickname || typeof score !== 'number') {
		console.warn('Invalid score submission:', payload);
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
		if (client.readyState === 1) {
			// 1 = OPEN
			client.send(message);
		}
	});
}

function getTopPlayers(limit = 20) {
	return Array.from(leaderboard.values())
		.sort((a, b) => b.score - a.score) // Sort by score descending
		.slice(0, limit);
}

function generateId() {
	return Math.random().toString(36).substring(2, 11);
}

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('Shutting down server...');
	wss.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});
