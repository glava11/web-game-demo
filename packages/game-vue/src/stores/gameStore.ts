import { defineStore } from "pinia";
import { ref, computed } from "vue";
// import { calculateScore } from "../utils/scoring";
import { calculateScore } from "@quicky-finger/shared";

export const useGameStore = defineStore("game", () => {
  // State
  const isPlaying = ref(false);
  const sliderPosition = ref(50); // 0-100
  const currentScore = ref<number | null>(null);
  const bestScore = ref(0);

  // Computed
  const hasScore = computed(() => currentScore.value !== null);

  // Actions
  function startGame(): void {
    isPlaying.value = true;
    currentScore.value = null;
    sliderPosition.value = 50;
  }

  function stopGame(): void {
    if (!isPlaying.value) return;

    isPlaying.value = false;
    const score = calculateScore(sliderPosition.value);
    currentScore.value = score;

    // Update best score
    if (score > bestScore.value) {
      bestScore.value = score;
    }
  }

  function updatePosition(position: number): void {
    sliderPosition.value = position;
  }

  function resetGame(): void {
    currentScore.value = null;
    sliderPosition.value = 50;
  }

  return {
    // State
    isPlaying,
    sliderPosition,
    currentScore,
    bestScore,
    // Computed
    hasScore,
    // Actions
    startGame,
    stopGame,
    updatePosition,
    resetGame,
  };
});
