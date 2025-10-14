<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NicknameInput from './components/NicknameInput.vue'
import SliderGame from './components/SliderGame.vue'
import Leaderboard from './components/Leaderboard.vue'
import { useLeaderboardStore } from './stores/leaderboardStore'
import { useWebSocket } from './composables/useWebSocket'
import type { Player } from './types/game.types'

const leaderboardStore = useLeaderboardStore()
const { connected, connect, submitScore, onMessage } = useWebSocket()

const hasNickname = ref(false)

onMounted(() => {
  // Connect to WebSocket server
  connect()

  // Listen for leaderboard updates
  onMessage('LEADERBOARD_UPDATE', (payload: { players: Player[] }) => {
    leaderboardStore.updateLeaderboard(payload.players)
  })
})

function handleNicknameReady() {
  hasNickname.value = true
}

function handleScoreSubmit(score: number) {
  submitScore({
    nickname: leaderboardStore.currentNickname,
    score,
    framework: 'vue'
  })
}
</script>

<template>
	<div id="app">
		<!-- Connection status -->
		<div class="fixed top-4 right-4 z-50">
			<div class="px-4 py-2 rounded-full text-sm font-semibold" :class="connected ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'">
				{{ connected ? '🟢 Connected' : '🔴 Disconnected' }}
			</div>
		</div>

		<!-- Main content -->
		<div class="container mx-auto px-4 py-8 space-y-8">
			<!-- Nickname input (only show if no nickname set) -->
			<NicknameInput v-if="!hasNickname" @ready="handleNicknameReady" />

			<!-- Game and Leaderboard (show after nickname set) -->
			<template v-else>
				<SliderGame :on-score-submit="handleScoreSubmit" />
				<Leaderboard />
			</template>
		</div>
	</div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
