import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {Player} from '../types/game.types';

export const useLeaderboardStore = defineStore('leaderboard', () => {
	// State
	const players = ref<Player[]>([]);
	const currentNickname = ref<string>('');

	// Computed
	const topPlayers = computed(() => players.value.slice(0, 20));

	const currentPlayerRank = computed(() => {
		if (!currentNickname.value) return null;
		const index = players.value.findIndex((p) => p.nickname === currentNickname.value);
		return index >= 0 ? index + 1 : null;
	});

	const currentPlayerScore = computed(() => {
		if (!currentNickname.value) return null;
		const player = players.value.find((p) => p.nickname === currentNickname.value);
		return player?.score ?? null;
	});

	// Actions
	function updateLeaderboard(newPlayers: Player[]) {
		players.value = newPlayers;
	}

	function setNickname(nickname: string) {
		currentNickname.value = nickname;
	}

	function clearNickname() {
		currentNickname.value = '';
	}

	return {
		// State
		players,
		currentNickname,
		// Computed
		topPlayers,
		currentPlayerRank,
		currentPlayerScore,
		// Actions
		updateLeaderboard,
		setNickname,
		clearNickname,
	};
});
