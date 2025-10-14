<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
// import { useLeaderboardStore } from '../stores/leaderboardStore'
import { getScoreRating } from '../utils/scoring'

// Props - accept WebSocket submit function
const props = defineProps<{
  onScoreSubmit: (score: number) => void
}>()

const gameStore = useGameStore()
// const leaderboardStore = useLeaderboardStore()
const animationFrameId = ref<number | null>(null)
const startTime = ref<number>(0)

// Game configuration
const CYCLE_DURATION = 2000 // 2 seconds for full left-right cycle

function startGame() {
  gameStore.startGame()
  startTime.value = performance.now()
  animate()
}

function animate() {
  const currentTime = performance.now()
  const elapsed = currentTime - startTime.value

  // Calculate position using sine wave (smooth oscillation)
  const progress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION
  const position = 50 + 50 * Math.sin(progress * Math.PI * 2)

  gameStore.updatePosition(position)

  // Continue animation if game is still playing
  if (gameStore.isPlaying) {
    animationFrameId.value = requestAnimationFrame(animate)
  }
}

function stopGame() {
	if (animationFrameId.value) {
		cancelAnimationFrame(animationFrameId.value)
		animationFrameId.value = null
	}
	gameStore.stopGame()

	// Submit score via WebSocket
	if (gameStore.currentScore !== null) {
		props.onScoreSubmit(gameStore.currentScore)
	}
}

function playAgain() {
  gameStore.resetGame()
  startGame()
}

// Cleanup on component unmount
onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<template>
	<div class="game-container max-w-2xl w-full mx-auto">
		<!-- Game Title -->
		<div class="text-center mb-8">
			<h1 class="text-5xl font-bold mb-2">Quicky Finger</h1>
			<p class="text-gray-400">Stop the slider as close to center as possible!</p>
		</div>

		<!-- Best Score Display -->
		<div v-if="gameStore.bestScore > 0" class="text-center mb-4">
			<p class="text-sm text-gray-400">
				Best Score: <span class="text-yellow-400 font-bold">{{ gameStore.bestScore }}</span>
			</p>
		</div>

		<!-- Game Area -->
		<div class="bg-gray-800 rounded-xl p-8 shadow-2xl">
			<!-- Slider Track (only shown when playing) -->
			<div v-if="gameStore.isPlaying" class="mb-8">
				<div class="relative h-24 bg-gray-700 rounded-lg overflow-hidden">
					<!-- Target line (center) -->
					<div class="absolute top-0 bottom-0 w-1 bg-green-400" style="left: 50%; transform: translateX(-50%)"></div>

					<!-- Moving slider indicator -->
					<div
						class="absolute top-0 bottom-0 w-4 bg-primary rounded transition-transform"
						:style="{ 
              left: gameStore.sliderPosition + '%',
              transform: 'translateX(-50%)',
              willChange: 'transform'
            }"
					></div>
				</div>

				<!-- Position indicator -->
				<div class="text-center mt-2 text-gray-400 text-sm">Position: {{ Math.round(gameStore.sliderPosition) }}%</div>
			</div>

			<!-- Control Buttons -->
			<div class="flex justify-center gap-4">
				<!-- Start Button -->
				<button v-if="!gameStore.isPlaying && !gameStore.hasScore" @click="startGame" class="btn btn-primary text-2xl px-12 py-4">Start Game</button>

				<!-- Stop Button -->
				<button v-if="gameStore.isPlaying" @click="stopGame" class="btn btn-danger text-3xl px-16 py-6 animate-pulse">STOP!</button>
			</div>

			<!-- Score Display -->
			<div v-if="gameStore.hasScore" class="text-center mt-8">
				<div class="mb-6">
					<p class="text-6xl font-bold text-primary mb-2">
						{{ gameStore.currentScore }}
					</p>
					<p class="text-2xl text-gray-300">
						{{ getScoreRating(gameStore.currentScore!) }}
					</p>
				</div>

				<div class="text-gray-400 mb-6">
					<p>Final Position: {{ Math.round(gameStore.sliderPosition) }}%</p>
					<p>Distance from Center: {{ Math.abs(Math.round(gameStore.sliderPosition - 50)) }}%</p>
				</div>

				<button @click="playAgain" class="btn btn-success text-xl px-8 py-3">Play Again</button>
			</div>
		</div>

		<!-- Instructions -->
		<div class="text-center mt-8 text-gray-500 text-sm">
			<p>Perfect center (50%) = 1000 points</p>
			<p>Every 1% away = -20 points</p>
		</div>
	</div>
</template>

<style scoped>
.game-container {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
