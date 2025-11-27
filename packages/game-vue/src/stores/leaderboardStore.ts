import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Player } from "@quicky-finger/shared";

export const useLeaderboardStore = defineStore("leaderboard", () => {
  // State
  const players = ref<Player[]>([]);
  const currentNickname = ref<string>("");

  // Computed
  const topPlayers = computed(() =>
    players.value.slice(0, 20).sort((a, b) => b.score - a.score),
  );

  const currentPlayerRank = computed(() => {
    if (!currentNickname.value) return null;
    const index = players.value.findIndex(
      (p) => p.nickname === currentNickname.value,
    );
    return index >= 0 ? index + 1 : null;
  });

  const currentPlayerScore = computed(() => {
    if (!currentNickname.value) return null;
    const player = players.value.find(
      (p) => p.nickname === currentNickname.value,
    );
    return player?.score ?? null;
  });

  // Actions
  function updateLeaderboard(newPlayers: Player[]): void {
    players.value = newPlayers;
  }

  function setNickname(nickname: string): void {
    currentNickname.value = nickname;
  }

  function clearNickname(): void {
    currentNickname.value = "";
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
