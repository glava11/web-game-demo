<script setup lang="ts">
import { ref, onUnmounted, computed } from "vue";
import { useGameStore } from "../stores/gameStore";
import { getScoreRating } from "../utils/scoring";
import {
  celebrateScore,
  celebrateNewBest,
  cleanupConfetti,
} from "../utils/confetti";
import {
  playStart,
  playStop,
  playScore,
  playNewBest,
  playHover,
  startTension,
  stopTension,
  cleanupSounds,
} from "../utils/sounds";
import { playEffects, vibrateStop } from "../utils/effects";
import GameCountdown from "./GameCountdown.vue";
// Props - accept WebSocket submit function
const props = defineProps<{
  onScoreSubmit: (score: number) => Promise<void> | void;
}>();

const gameStore = useGameStore();
const animationFrameId = ref<number | null>(null);
const startTime = ref<number>(0);
// FPS tracking
const frameRate = ref<number>(0); // displayed FPS
const lastFrameTime = ref<number | null>(null);
const maxFrameRate = ref<number>(0);
const fpsSmoothingAlpha = 0.12;
// Game configuration
const CYCLE_DURATION = 2000; // 2 seconds for full left-right cycle
const showCountdown = ref(false);
const elapsedTime = ref(0);
const progress = ref<number>(0);
const direction = ref<1 | -1>(1); // 1 = right, -1 = left

// Shake intensity increases with time
const shakeIntensity = computed(() => {
  if (!gameStore.isPlaying) return 0;
  // Increase shake every second, max at 5 seconds
  return Math.min(elapsedTime.value / 1000, 5);
});

function initiateStart(): void {
  showCountdown.value = true;
}

function onCountdownComplete(): void {
  showCountdown.value = false;
  startGame();
}

function startGame(): void {
  gameStore.startGame();
  startTime.value = performance.now();
  // reset FPS tracking
  lastFrameTime.value = null;
  frameRate.value = 0;
  maxFrameRate.value = 0;
  elapsedTime.value = 0;
  progress.value = 0;
  playStart();
  startTension();
  animate();
}

function animate(): void {
  const currentTime = performance.now();
  const elapsed = currentTime - startTime.value;
  elapsedTime.value = elapsed;

  // Calculate position using sine wave (smooth oscillation)
  progress.value = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
  const position = 50 + 50 * Math.sin(progress.value * Math.PI * 2);
  direction.value = Math.cos(progress.value * Math.PI * 2) >= 0 ? -1 : 1;

  gameStore.updatePosition(position);

  // Continue animation if game is still playing
  if (gameStore.isPlaying) {
    animationFrameId.value = requestAnimationFrame(animate);
  }

  // FPS
  if (lastFrameTime.value !== null) {
    const delta = currentTime - lastFrameTime.value;
    if (delta > 0) {
      const instantFps = 1000 / delta;
      // exponential moving average to smooth displayed FPS
      frameRate.value = +(
        instantFps * fpsSmoothingAlpha +
        frameRate.value * (1 - fpsSmoothingAlpha)
      ).toFixed(1);
      maxFrameRate.value = Math.max(maxFrameRate.value, frameRate.value);
    }
  }
  lastFrameTime.value = currentTime;
}

async function stopGame(): Promise<void> {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
  // stop FPS tracking
  lastFrameTime.value = null;
  frameRate.value = 0;
  stopTension();
  playStop();
  vibrateStop();
  gameStore.stopGame();

  // Celebrate the score and submit it via WebSocket
  if (gameStore.currentScore !== null) {
    playEffects(gameStore.currentScore);
    playScore(gameStore.currentScore);
    celebrateScore(gameStore.currentScore);
    // Extra celebration for new personal best
    if (gameStore.currentScore > gameStore.bestScore) {
      setTimeout(() => {
        celebrateNewBest();
        playNewBest();
      }, 500);
    }

    try {
      await props.onScoreSubmit(gameStore.currentScore);
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  }
}

function playAgain(): void {
  gameStore.resetGame();
  initiateStart();
}

// Cleanup on component unmount
onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  stopTension();
  cleanupSounds();
  cleanupConfetti();
});
</script>

<template>
  <div class="game-container max-w-2xl w-full mx-auto">
    <!-- Countdown Overlay -->
    <GameCountdown v-if="showCountdown"
                   @complete="onCountdownComplete" />
    <!-- Game Title -->
    <div class="text-center mb-8">
      <h1 class="text-7xl font-bold mb-2 text-silver press-start-2p flicker">
        Quicky Finger
      </h1>
      <p class="text-gray-400">
        Stop the slider as close to center as possible!
      </p>
    </div>

    <!-- FPS display -->
    <div class="fps-counter text-sm text-gray-400 mt-2">
      FPS:
      <span class="font-mono">{{
        `${frameRate || "--"} / ${maxFrameRate || "--"}`
        }}</span>
    </div>

    <!-- Best Score Display -->
    <div v-if="gameStore.bestScore > 0"
         class="text-center mb-4">
      <p class="text-sm text-gray-400">
        Best Score:
        <span class="text-yellow-400 font-bold">{{ gameStore.bestScore }}</span>
      </p>
    </div>

    <!-- Game Area -->
    <div class="rounded-xl p-8 shadow-2xl game-area">
      <!-- Slider Track (only shown when playing) -->
      <div v-if="gameStore.isPlaying"
           class="mb-8">
        <div class="relative h-40 rounded-lg overflow-hidden"
             style="background-color: var(--color-bg-playground)">
          <!-- Target line (center) -->
          <div class="absolute top-0 bottom-0 w-1"
               style="
              left: 50%;
              transform: translateX(-50%);
              background-color: var(--color-gold);
            "></div>

          <!-- Moving slider indicator -->
          <div class="slider absolute top-0 bottom-0 w-2 rounded transition-transform"
               :class="direction == 1 ? 'right' : 'left'"
               :style="{
                left: gameStore.sliderPosition + '%',
                transform: 'translateX(-50%)',
                willChange: 'transform',
                backgroundColor: 'var(--color-success)',
              }"></div>
        </div>

        <!-- Position indicator -->
        <div class="text-center mt-2 text-gray-400 text-sm">
          Position: {{ gameStore.sliderPosition.toFixed(1) }}%
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex justify-center gap-4 h-full">
        <!-- Start Button -->
        <button v-if="!gameStore.isPlaying && !gameStore.hasScore"
                class="btn btn-primary start-btn press-start-2p pulse-btn"
                @click="initiateStart"
                @mouseenter="playHover()">
          Start Game
        </button>

        <!-- Stop Button -->
        <button v-if="gameStore.isPlaying"
                class="btn btn-danger stop-btn animate-pulse stop-button-shake press-start-2p"
                :style="{
                  '--shake-intensity': `${shakeIntensity * 0.5}px`,
                }"
                @click="stopGame"
                @mouseenter="playHover()">
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
          <p>Final Position: {{ gameStore.sliderPosition.toFixed(3) }}%</p>
          <p>
            Distance from Center:
            {{ Math.abs(gameStore.sliderPosition - 50).toFixed(3) }}%
          </p>
        </div>

        <button class="btn btn-primary text-xl px-8 py-3 press-start-2p pulse-btn"
                @click="playAgain"
                @mouseenter="playHover()">
          Play Again
        </button>
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
  text-shadow:
    0 0 20px var(--score-color),
    0 0 40px var(--score-color);
}

.text-silver {
  color: var(--color-silver);
}

.text-rating {
  color: var(--color-primary);
  text-shadow:
    0 0 20px var(--color-primary),
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

.slider.left {
  box-shadow: -8px 0px 25px 5px var(--color-success);
}

.slider.right {
  box-shadow: 8px 0px 25px 5px var(--color-success);
}

.start-btn {
  align-self: center !important;
  height: 6rem !important;
}

.fps-counter {
  position: absolute;
  top: 0.25rem;
  left: 1rem;
  font-size: 1.1rem;

  span {
    color: var(--fps-color);
  }
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
  animation: pulse-btn 0.5s ease-in-out 0s 1 normal none;
  opacity: 1;
}

.pulsate {
  animation: pulsate-fwd-normal 2.5s ease-in-out 0s infinite normal none;
}

@keyframes buttonShake {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(calc(var(--shake-intensity) * -0.5), 0) scale(1.05);
  }

  66% {
    transform: translate(calc(var(--shake-intensity) * 0.5), 0) scale(0.95);
  }
}

.stop-button-shake {
  animation: buttonShake 0.15s infinite;
  transform-origin: center;
}

@keyframes flicker {

  0%,
  19%,
  21%,
  23%,
  25%,
  54%,
  56%,
  100% {
    text-shadow:
      -2px -2px 2px var(--color-silver),
      2px 2px 2px var(--color-silver),
      0 0 8px var(--color-silver),
      0 0 0 var(--color-silver),
      0 0 16px var(--color-silver),
      0 0 2px var(--color-silver),
      0 0 28px var(--color-silver),
      0 0 5px var(--color-silver);
  }

  20%,
  24%,
  55% {
    text-shadow: none;
    box-shadow: none;
  }
}

.flicker {
  animation: flicker 2.5s infinite alternate;
}
</style>
