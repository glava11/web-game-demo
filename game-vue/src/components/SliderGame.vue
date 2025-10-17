<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
// import { useLeaderboardStore } from '../stores/leaderboardStore'
import { getScoreRating } from '../utils/scoring'
import { celebrateScore, celebrateNewBest } from '../utils/confetti'
import { playStart, playStop, playScore, playNewBest, playHover, startTension, stopTension } from '../utils/sounds'
import GameCountdown from './GameCountdown.vue'
// Props - accept WebSocket submit function
const props = defineProps<{
	onScoreSubmit: (score: number) => Promise<void> | void
}>()

const gameStore = useGameStore()
// const leaderboardStore = useLeaderboardStore()
const animationFrameId = ref<number | null>(null)
const startTime = ref<number>(0)
// FPS tracking
const frameRate = ref<number>(0)             // displayed FPS
const lastFrameTime = ref<number | null>(null)
const fpsSmoothingAlpha = 0.12
// Game configuration
const CYCLE_DURATION = 2000 // 2 seconds for full left-right cycle
const showCountdown = ref(false)
const elapsedTime = ref(0)

// Shake intensity increases with time
const shakeIntensity = computed(() => {
	if (!gameStore.isPlaying) return 0
	// Increase shake every second, max at 5 seconds
	return Math.min(elapsedTime.value / 1000, 5)
})

function initiateStart() {
	showCountdown.value = true
}

function onCountdownComplete() {
	showCountdown.value = false
	startGame()
}

function startGame() {
	gameStore.startGame()
	startTime.value = performance.now()
	// reset FPS tracking
	lastFrameTime.value = null
	frameRate.value = 0

	elapsedTime.value = 0
	playStart()
	startTension()
	animate()
}

function animate() {
	const currentTime = performance.now()
	const elapsed = currentTime - startTime.value
	elapsedTime.value = elapsed

	// FPS
	if (lastFrameTime.value !== null) {
		const delta = currentTime - lastFrameTime.value
		if (delta > 0) {
			const instantFps = 1000 / delta
			// exponential moving average to smooth displayed FPS
			frameRate.value = +(instantFps * fpsSmoothingAlpha + frameRate.value * (1 - fpsSmoothingAlpha)).toFixed(2)
		}
	}
	lastFrameTime.value = currentTime

	// Calculate position using sine wave (smooth oscillation)
	const progress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION
	const position = 50 + 50 * Math.sin(progress * Math.PI * 2)

	gameStore.updatePosition(position)

	// Continue animation if game is still playing
	if (gameStore.isPlaying) {
		animationFrameId.value = requestAnimationFrame(animate)
	}
}

async function stopGame() {
	if (animationFrameId.value) {
		cancelAnimationFrame(animationFrameId.value)
		animationFrameId.value = null
	}
	// stop FPS tracking
	lastFrameTime.value = null
	stopTension()
	playStop()
	gameStore.stopGame()

	// Celebrate the score and submit it via WebSocket
	if (gameStore.currentScore !== null) {
		playScore(gameStore.currentScore)
		celebrateScore(gameStore.currentScore)
		// Extra celebration for new personal best
		if (gameStore.currentScore > gameStore.bestScore) {
			setTimeout(() => {
				celebrateNewBest()
				playNewBest()
			}, 500)
		}

		try {
			await props.onScoreSubmit(gameStore.currentScore)
		} catch (error) {
			console.error('Error submitting score:', error)
		}
	}
}

function playAgain() {
	gameStore.resetGame()
	//   startGame()
	initiateStart()
}

// Cleanup on component unmount
onUnmounted(() => {
	if (animationFrameId.value) {
		cancelAnimationFrame(animationFrameId.value)
	}
	stopTension()
})
</script>

<template>
	<div class="game-container max-w-2xl w-full mx-auto">
		<!-- Countdown Overlay -->
		<GameCountdown v-if="showCountdown"
					   @complete="onCountdownComplete" />
		<!-- Game Title -->
		<div class="text-center mb-8">
			<h1 class="text-7xl font-bold mb-2 text-silver press-start-2p">Quicky Finger</h1>
			<p class="text-gray-400">Stop the slider as close to center as possible!</p>
		</div>

		<!-- FPS display -->
		<div class="fps-counter text-sm text-gray-400 mt-2">
			FPS: <span class="font-mono">{{ frameRate }}</span>
		</div>

		<!-- Best Score Display -->
		<div v-if="gameStore.bestScore > 0"
			 class="text-center mb-4">
			<p class="text-sm text-gray-400">
				Best Score: <span class="text-yellow-400 font-bold">{{ gameStore.bestScore }}</span>
			</p>
		</div>

		<!-- Game Area -->
		<div class="rounded-xl p-8 shadow-2xl game-area">
			<!-- Slider Track (only shown when playing) -->
			<div v-if="gameStore.isPlaying"
				 class="mb-8">
				<div class="relative h-40 rounded-lg overflow-hidden"
					 style="background-color: var(--color-bg-playground);">
					<!-- Target line (center) -->
					<div class="absolute top-0 bottom-0 w-1"
						 style="left: 50%;
						 		transform: translateX(-50%);
								background-color: var(--color-success);">
					</div>

					<!-- Moving slider indicator -->
					<div class="slider absolute top-0 bottom-0 w-3 rounded transition-transform"
						 :style="{
							left: gameStore.sliderPosition + '%',
							transform: 'translateX(-50%)',
							willChange: 'transform',
							backgroundColor: 'var(--color-indicator)'
						}"></div>
				</div>

				<!-- Position indicator -->
				<div class="text-center mt-2 text-gray-400 text-sm">
					Position: {{ Math.round(gameStore.sliderPosition) }}%
				</div>
			</div>

			<!-- Control Buttons -->
			<div class="flex justify-center gap-4 h-full">
				<!-- Start Button -->
				<button v-if="!gameStore.isPlaying && !gameStore.hasScore"
						@click="initiateStart"
						@mouseenter="playHover()"
						class="btn btn-primary text-4xl px-12 py-4 press-start-2p pulse-btn">Start Game</button>

				<!-- Stop Button -->
				<button v-if="gameStore.isPlaying"
						@click="stopGame"
						@mouseenter="playHover()"
						class="btn btn-danger text-4xl px-16 py-6 animate-pulse stop-button-shake press-start-2p"
						:style="{
							'--shake-intensity': `${shakeIntensity * 0.5}px`
						}">
					STOP!
				</button>
			</div>

			<!-- Score Display -->
			<div v-if="gameStore.hasScore"
				 class="text-center mt-8">
				<div class="mb-6">
					<p class="text-8xl font-bold text-gold mb-8 press-start-2p pulsate">
						{{ gameStore.currentScore }}
					</p>
					<p class="text-2xl text-rating text-gray-300 press-start-2p">
						{{ getScoreRating(gameStore.currentScore!) }}
					</p>
				</div>

				<div class="text-gray-400 mb-6">
					<p>Final Position: {{ Math.round(gameStore.sliderPosition) }}%</p>
					<p>Distance from Center: {{ Math.abs(Math.round(gameStore.sliderPosition - 50)) }}%</p>
				</div>

				<button @click="playAgain"
						@mouseenter="playHover()"
						class="btn btn-primary text-xl px-8 py-3 press-start-2p pulse-btn">Play Again</button>
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
.text-gold {
	color: var(--score-color);
	text-shadow: 0 0 20px var(--score-color),
		0 0 40px var(--score-color);
}

.text-silver {
	color: var(--color-silver);
	text-shadow: 0 0 40px var(--color-silver), 0 0 15px var(--color-silver);
}

.text-rating {
	color: var(--color-primary);
	text-shadow: 0 0 20px var(--color-primary),
		0 0 40px var(--color-primary);
}

.game-container {
	animation: fadeIn 0.5s ease-in;
}

.game-area {
	background-color: var(--color-bg-card);
	min-height: 27rem;
	height: 27rem;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.fps-counter {
	position: absolute;
	top: 0.25rem;
	left: 1rem;
	font-size: 1.1rem;

	span {
		color: yellow;
	}
}

@keyframes pulsate-fwd-normal {
	0% {
		transform: scale(1);
	}

	50% {
		transform: scale(1.15);
	}

	100% {
		transform: scale(1);
	}
}

@keyframes pulse-btn {
	0% {
		transform: scale(1) rotate(0deg);
	}

	50% {
		transform: scale(1.05) rotate(-1deg);
	}

	100% {
		transform: scale(1) rotate(0deg);
	}
}

.pulse-btn:hover {
	animation: pulse-btn .5s ease-in-out 0s 1 normal none;
	opacity: 1;
}

.pulsate {
	animation: pulsate-fwd-normal 2.5s ease-in-out 0s infinite normal none;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-20px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Shake animation - intensity increases with time */
.game-shaking {
	animation: gameShaking 0.15s infinite;
}

@keyframes gameShaking {

	0%,
	100% {
		transform: translate(0, 0) rotate(0deg);
	}

	25% {
		transform: translate(calc(var(--shake-intensity) * -0.5),
				calc(var(--shake-intensity) * 0.3)) rotate(calc(var(--shake-intensity) * -0.1deg));
	}

	50% {
		transform: translate(calc(var(--shake-intensity) * 0.5),
				calc(var(--shake-intensity) * -0.3)) rotate(calc(var(--shake-intensity) * 0.1deg));
	}

	75% {
		transform: translate(calc(var(--shake-intensity) * -0.3),
				calc(var(--shake-intensity) * 0.5)) rotate(calc(var(--shake-intensity) * -0.05deg));
	}
}

/* Shake animation - intensity increases with time */
.game-shake-roto {
	animation: gameShakeRoto 0.15s infinite;
}

/* Rotate shake (dizzying) */
@keyframes gameShakeRoto {
	0% {
		transform: rotate(0deg);
	}

	25% {
		transform: rotate(calc(var(--shake-intensity) * 0.5deg));
	}

	50% {
		transform: rotate(calc(var(--shake-intensity) * -0.5deg));
	}

	75% {
		transform: rotate(calc(var(--shake-intensity) * 0.3deg));
	}

	100% {
		transform: rotate(0deg);
	}
}

/* Shake animation - intensity increases with time */
.game-shake-bounce {
	animation: gameShakeBounce 0.15s infinite;
}

/* Vertical bounce (earthquake) */
@keyframes gameShakeBounce {

	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(calc(var(--shake-intensity) * -1px));
	}
}

/* Stop button shakes more intensely */
.stop-button-shake {
	animation: buttonShake 0.15s infinite;
	transform-origin: center;
}

@keyframes buttonShake {

	0%,
	100% {
		transform: translate(0, 0) scale(1);
	}

	33% {
		transform: translate(calc(var(--shake-intensity) * -0.5),
				0) scale(1.05);
	}

	66% {
		transform: translate(calc(var(--shake-intensity) * 0.5),
				0) scale(0.95);
	}
}

.game-shake {
	animation: gameShake 0.15s infinite;
	transform-origin: center;
}

@keyframes gameShake {

	0%,
	100% {
		transform: translate(0, 0) scale(1);
	}

	33% {
		transform: translate(calc(var(--shake-intensity) * -0.5),
				0) scale(1.15);
	}

	66% {
		transform: translate(calc(var(--shake-intensity) * 0.5),
				0) scale(0.85);
	}
}
</style>
