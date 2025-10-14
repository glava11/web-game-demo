import {ref, onUnmounted} from 'vue';
import type {GameMessage, ScoreSubmission} from '../types/game.types';

const WS_URL = 'ws://localhost:8080';

export function useWebSocket() {
	const ws = ref<WebSocket | null>(null);
	const connected = ref(false);
	const error = ref<string | null>(null);

	function connect() {
		try {
			ws.value = new WebSocket(WS_URL);

			ws.value.onopen = () => {
				console.log('WebSocket connected');
				connected.value = true;
				error.value = null;
			};

			ws.value.onclose = () => {
				console.log('WebSocket disconnected');
				connected.value = false;
			};

			ws.value.onerror = (event) => {
				console.error('WebSocket error:', event);
				error.value = 'Connection error';
			};

			ws.value.onmessage = (event) => {
				try {
					const message: GameMessage = JSON.parse(event.data);
					handleMessage(message);
				} catch (err) {
					console.error('Failed to parse message:', err);
				}
			};
		} catch (err) {
			error.value = 'Failed to connect';
			console.error('Connection failed:', err);
		}
	}

	function disconnect() {
		if (ws.value) {
			ws.value.close();
			ws.value = null;
		}
	}

	function send(message: GameMessage) {
		if (ws.value && ws.value.readyState === WebSocket.OPEN) {
			ws.value.send(JSON.stringify(message));
		} else {
			console.warn('WebSocket not connected');
		}
	}

	function submitScore(submission: ScoreSubmission) {
		send({
			type: 'SCORE_SUBMIT',
			payload: submission,
		});
	}

	// Message handlers - to be set by components
	const messageHandlers = new Map<string, (payload: any) => void>();

	function onMessage(type: string, handler: (payload: any) => void) {
		messageHandlers.set(type, handler);
	}

	function handleMessage(message: GameMessage) {
		const handler = messageHandlers.get(message.type);
		if (handler && message.payload) {
			handler(message.payload);
		}
	}

	// Cleanup on component unmount
	onUnmounted(() => {
		disconnect();
	});

	return {
		connected,
		error,
		connect,
		disconnect,
		send,
		submitScore,
		onMessage,
	};
}
